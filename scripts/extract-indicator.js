/**
 * Generic automate script for extracting HDC standard-report tables by
 * driving the real HDC public web UI with Playwright (no direct API calls).
 *
 * Supports two modes per indicator (see scripts/indicators.config.js):
 *   - filterByAmphoe: true   -> loops through every "อำเภอ" dropdown option,
 *                                clicks "ดูรายงาน" each time, extracts one
 *                                table per district (e.g. Indicator 1).
 *   - filterByAmphoe: false  -> clicks "ดูรายงาน" once at province level and
 *                                extracts a single table (e.g. Indicator 2).
 *
 * Usage:
 *   node scripts/extract-indicator.js indicator1
 *   node scripts/extract-indicator.js indicator2
 *   node scripts/extract-indicator.js all          # runs every indicator in the config
 *
 * npm shortcuts:
 *   npm run extract:indicator1
 *   npm run extract:indicator2
 *   npm run extract:all
 *
 * Env vars:
 *   HEADLESS=false   run with a visible browser window (default: true)
 *   SLOWMO=300       ms delay between Playwright actions (default: 250)
 *
 * Output (per indicator, under amphoe-data/<outputDir>/):
 *   data.json         structured data (per-amphoe or single province table)
 *   data.csv          flat CSV for spreadsheet/Dashboard use
 *   raw-tables.json   raw extracted <table> rows (debug)
 *   error-screenshot.png  only created on a fatal failure
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const INDICATORS = require('./indicators.config');

const HEADLESS = process.env.HEADLESS !== 'false';
const SLOWMO = parseInt(process.env.SLOWMO || '250', 10);
const NAV_TIMEOUT = 60000;
const MAX_RETRIES = 2;

const DIAGNOSIS_LABELS = {
  '1B030': 'SMI-V กลุ่ม 1',
  '1B031': 'SMI-V กลุ่ม 2',
  '1B032': 'SMI-V กลุ่ม 3',
  '1B033': 'SMI-V กลุ่มอื่นๆ'
};

const DIAGNOSIS_COLUMN_KEYS = [
  'total', 'f00_09', 'f10_19', 'f20_29', 'f30_39', 'f40_48',
  'f50_59', 'f60_69', 'f70_79', 'f80_89', 'f90_98', 'other', 'x60_84'
];

function log(indicatorKey, ...args) {
  console.log(new Date().toISOString(), `[${indicatorKey}]`, ...args);
}

function toNumber(text) {
  if (text == null) return 0;
  const n = parseFloat(String(text).replace(/,/g, '').trim());
  return Number.isNaN(n) ? 0 : n;
}

async function closePopupIfAny(page) {
  const closeSelectors = [
    'button:has-text("ปิด")',
    'button:has-text("ไม่แสดงอีก")',
    '.modal .btn-close',
    '.modal-header .close'
  ];
  for (const sel of closeSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && (await btn.isVisible())) {
        await btn.click();
        await page.waitForTimeout(400);
      }
    } catch (_) { /* ignore */ }
  }
}

async function findFilterToggleByLabel(page, labelKeyword, excludeKeyword) {
  const toggles = await page.$$('.ngx-select__toggle');
  for (const toggle of toggles) {
    // Only trust an actual <label>/.form-label ancestor sibling — never fall back to
    // raw textContent, since a dropdown's own (possibly stale, hidden) option list can
    // contain unrelated keyword matches (e.g. the view-mode dropdown's "รายอำเภอ" option
    // would otherwise false-match a lookup for the "อำเภอ" filter).
    const labelText = await toggle.evaluate(el => {
      let container = el.closest('.col-12, [class*="col-"]');
      for (let hop = 0; hop < 6 && container; hop++) {
        const label = container.querySelector(':scope > label, :scope > .form-label');
        if (label) return label.textContent.trim();
        container = container.parentElement;
      }
      return '';
    });
    if (labelText && labelText.includes(labelKeyword) && (!excludeKeyword || !labelText.includes(excludeKeyword))) {
      return toggle;
    }
  }
  return null;
}

/** Reads only the currently-open dropdown's option list (never stale/hidden ones from other toggles). */
async function readOpenDropdownOptions(page) {
  const options = await page.$$('.ngx-select.dropdown.open .ngx-select__item, .ngx-select.dropdown.show .ngx-select__item');
  const texts = [];
  for (const opt of options) {
    const t = (await opt.textContent()).trim();
    if (t) texts.push(t);
  }
  return { elements: options, texts };
}

async function listAmphoeOptions(page) {
  const toggle = await findFilterToggleByLabel(page, 'อำเภอ', 'ตำบล');
  if (!toggle) throw new Error('ไม่พบ dropdown อำเภอ');

  await toggle.click();
  await page.waitForTimeout(600);

  const { texts } = await readOpenDropdownOptions(page);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  return texts.filter(t => !t.includes('ทั้งหมด'));
}

async function selectAmphoeAndViewReport(page, amphoeName) {
  const toggle = await findFilterToggleByLabel(page, 'อำเภอ', 'ตำบล');
  if (!toggle) throw new Error('ไม่พบ dropdown อำเภอ (retry)');

  await toggle.click();
  await page.waitForTimeout(500);

  const { elements: options } = await readOpenDropdownOptions(page);
  let clicked = false;
  for (const opt of options) {
    const text = (await opt.textContent()).trim();
    if (text === amphoeName) {
      await opt.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) throw new Error(`ไม่พบตัวเลือกอำเภอ: ${amphoeName}`);

  await page.waitForTimeout(600);
  await clickViewReport(page);
}

async function clickViewReport(page) {
  const viewBtn = await page.$('button:has-text("ดูรายงาน")');
  if (!viewBtn) throw new Error('ไม่พบปุ่ม "ดูรายงาน"');
  await viewBtn.click();
  await page.waitForTimeout(2500);
}

/** Selects an option in the "มุมมองการแสดงข้อมูล" (view mode) dropdown — always the first toggle on the filter panel. */
async function selectViewMode(page, optionLabel) {
  const toggles = await page.$$('.ngx-select__toggle');
  if (toggles.length === 0) throw new Error('ไม่พบตัวเลือกมุมมองการแสดงข้อมูล');
  await toggles[0].click();
  await page.waitForTimeout(500);

  const { elements: options } = await readOpenDropdownOptions(page);
  let clicked = false;
  for (const opt of options) {
    const text = (await opt.textContent()).trim();
    if (text === optionLabel) {
      await opt.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) throw new Error(`ไม่พบตัวเลือกมุมมอง: ${optionLabel}`);
  await page.waitForTimeout(500);
}

async function extractRawTables(page) {
  await page.waitForSelector('table', { timeout: 10000 }).catch(() => null);
  await page.waitForTimeout(800);

  return page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    const results = [];
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      const tableRows = [];
      for (const row of rows) {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(c => ({
          text: c.textContent.trim(),
          colspan: c.colSpan || 1,
          rowspan: c.rowSpan || 1,
          tag: c.tagName.toLowerCase()
        }));
        if (rowData.length > 0) tableRows.push(rowData);
      }
      if (tableRows.length > 0) results.push(tableRows);
    }
    return results;
  });
}

/** Reads the "วันที่ประมวลผล :: <date>" footer text HDC prints below every report table. */
async function extractProcessedDate(page) {
  try {
    const text = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div.col-12.mt-2'));
      const div = divs.find(d => d.textContent.includes('วันที่ประมวลผล'));
      return div ? div.textContent.trim() : null;
    });
    if (!text) return null;
    const match = text.match(/วันที่ประมวลผล\s*::\s*(.+)/);
    return match ? match[1].trim() : text;
  } catch (_) {
    return null;
  }
}

/**
 * Expands a set of raw <tr> rows (cells carrying colspan/rowspan) into a
 * dense grid, honoring HTML table span semantics, so header rows spanning
 * multiple rows/columns line up correctly against the data columns below.
 */
function expandGridRows(rawRows) {
  const grid = [];
  const occupied = [];
  for (let r = 0; r < rawRows.length; r++) {
    grid[r] = grid[r] || [];
    occupied[r] = occupied[r] || [];
    let c = 0;
    for (const cell of rawRows[r]) {
      while (occupied[r][c]) c++;
      for (let rr = r; rr < r + cell.rowspan; rr++) {
        grid[rr] = grid[rr] || [];
        occupied[rr] = occupied[rr] || [];
        for (let cc = c; cc < c + cell.colspan; cc++) {
          occupied[rr][cc] = true;
          grid[rr][cc] = cell.text;
        }
      }
      c += cell.colspan;
    }
  }
  return grid;
}

/** Bottom-most non-empty label per column = the real leaf header, aligned to data columns. */
function flattenLeafHeaders(headerRawRows) {
  if (headerRawRows.length === 0) return [];
  const grid = expandGridRows(headerRawRows);
  const numColumns = Math.max(...grid.map((row) => row.length));
  const leaves = [];
  for (let c = 0; c < numColumns; c++) {
    let label = '';
    for (let r = grid.length - 1; r >= 0; r--) {
      if (grid[r] && grid[r][c]) { label = grid[r][c]; break; }
    }
    leaves.push(label);
  }
  return leaves;
}


/** Parser used for Indicator 1-style tables: rows keyed by 1B0xx diagnosis code + a "รวม" summary row. */
function parseDiagnosisTable(rawTable) {
  const diagnoses = [];
  let summary = null;
  const headerRawRows = [];

  for (const row of rawTable) {
    const first = row[0]?.text || '';
    const match = first.match(/1B0(\d{2})/);
    if (match) {
      const code = `1B0${match[1]}`;
      const values = row.slice(1).map(c => toNumber(c.text));
      const record = { code, name: DIAGNOSIS_LABELS[code] || code };
      DIAGNOSIS_COLUMN_KEYS.forEach((key, i) => { record[key] = values[i] ?? 0; });
      diagnoses.push(record);
    } else if (first.trim() === 'รวม') {
      const values = row.slice(1).map(c => toNumber(c.text));
      summary = { code: 'TOTAL', name: 'รวม' };
      DIAGNOSIS_COLUMN_KEYS.forEach((key, i) => { summary[key] = values[i] ?? 0; });
    } else if (row.some(c => c.tag === 'th')) {
      headerRawRows.push(row);
    }
  }

  const headerRows = headerRawRows.map(row => row.map(c => ({ text: c.text, colSpan: c.colspan || 1, rowSpan: c.rowspan || 1 })));

  return { diagnoses, summary, headerRows };
}

/**
 * Generic parser for province-level KPI tables (Indicator 2/3-style):
 * multi-row headers (with colspan/rowspan) followed by one data row per
 * area + a "รวม" row. Flattens the header grid into leaf column labels
 * that line up 1:1 with the data columns, since KPI column meanings vary
 * widely between indicators.
 */
function parseKpiTable(rawTable) {
  if (rawTable.length === 0) return { headerRows: [], columns: [], dataRows: [] };

  // Heuristic: header rows are any leading rows whose first cell is not
  // a known area name and does not parse as a comparable numeric total row.
  // In practice the HDC KPI tables put data rows last (province name + "รวม").
  const dataRows = [];
  const headerRawRows = [];

  for (const row of rawTable) {
    const first = (row[0]?.text || '').trim();
    const looksLikeAreaRow = first && !/^(areaheader)$/i.test(first) &&
      row.slice(1).some(cell => /^[\d,.-]+$/.test(cell.text.replace(/,/g, '')));
    if (looksLikeAreaRow) {
      const rowText = row.map(c => c.text);
      dataRows.push({
        area: first,
        values: row.slice(1).map(c => toNumber(c.text)),
        raw: rowText
      });
    } else {
      headerRawRows.push(row);
    }
  }

  const columns = flattenLeafHeaders(headerRawRows).map((label) =>
    /^areaheader$/i.test(label.trim()) ? 'จังหวัด' : label
  );
  const headerRows = headerRawRows.map(row => row.map(c => ({
    text: /^areaheader$/i.test((c.text || '').trim()) ? 'จังหวัด' : c.text,
    colSpan: c.colspan || 1,
    rowSpan: c.rowspan || 1,
  })));

  return { headerRows, columns, dataRows };
}

function diagnosisDataToCsv(allData) {
  const header = ['amphoe', 'code', 'name', ...DIAGNOSIS_COLUMN_KEYS];
  const rows = [header.join(',')];

  for (const [amphoe, entry] of Object.entries(allData)) {
    if (entry.error) continue;
    for (const d of entry.diagnoses) {
      rows.push([amphoe, d.code, d.name, ...DIAGNOSIS_COLUMN_KEYS.map(k => d[k] ?? 0)].join(','));
    }
    if (entry.summary) {
      rows.push([amphoe, entry.summary.code, entry.summary.name, ...DIAGNOSIS_COLUMN_KEYS.map(k => entry.summary[k] ?? 0)].join(','));
    }
  }
  return rows.join('\n');
}

function kpiDataToCsv(result) {
  if (!result.dataRows || result.dataRows.length === 0) return 'area\n';
  const maxCols = Math.max(...result.dataRows.map(r => r.values.length));
  const header = ['area', ...Array.from({ length: maxCols }, (_, i) => `col${i + 1}`)];
  const rows = [header.join(',')];
  for (const r of result.dataRows) {
    rows.push([r.area, ...r.values].join(','));
  }
  return rows.join('\n');
}

async function runAmphoeIndicator(page, indicatorKey, config, paths) {
  const allData = {};
  const rawTables = {};

  log(indicatorKey, 'ค้นหารายชื่ออำเภอทั้งหมดจาก dropdown จริง...');
  const amphoeList = await listAmphoeOptions(page);
  log(indicatorKey, `พบ ${amphoeList.length} อำเภอ:`, amphoeList.join(', '));

  for (const amphoeName of amphoeList) {
    let success = false;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
      try {
        log(indicatorKey, `[${amphoeName}] เลือก dropdown (ครั้งที่ ${attempt})...`);
        await selectAmphoeAndViewReport(page, amphoeName);

        const raw = await extractRawTables(page);
        rawTables[amphoeName] = raw;

        const parsed = raw.length > 0 ? parseDiagnosisTable(raw[0]) : { diagnoses: [], summary: null };
        const processedDate = await extractProcessedDate(page);
        allData[amphoeName] = { ...parsed, processedDate, extractedAt: new Date().toISOString() };

        log(indicatorKey, `[${amphoeName}] ✅ สำเร็จ (${parsed.diagnoses.length} รายการ, รวม=${parsed.summary?.total ?? 'N/A'})`);
        success = true;
      } catch (err) {
        lastError = err;
        log(indicatorKey, `[${amphoeName}] ❌ ล้มเหลว (ครั้งที่ ${attempt}):`, err.message);
        await page.waitForTimeout(1000);
      }
    }

    if (!success) {
      allData[amphoeName] = { error: lastError?.message || 'unknown error', extractedAt: new Date().toISOString() };
    }

    fs.writeFileSync(paths.dataJson, JSON.stringify(allData, null, 2), 'utf8');
    fs.writeFileSync(paths.rawJson, JSON.stringify(rawTables, null, 2), 'utf8');
  }

  fs.writeFileSync(paths.dataCsv, diagnosisDataToCsv(allData), 'utf8');

  let okCount = 0, failCount = 0;
  for (const entry of Object.values(allData)) {
    if (entry.error) failCount++; else okCount++;
  }
  log(indicatorKey, `สำเร็จ ${okCount}/${amphoeList.length} อำเภอ, ล้มเหลว ${failCount}`);

  return allData;
}

async function runProvinceIndicator(page, indicatorKey, config, paths) {
  log(indicatorKey, 'ดึงข้อมูลระดับจังหวัด (ไม่กรองอำเภอ)...');
  await clickViewReport(page);

  const raw = await extractRawTables(page);
  fs.writeFileSync(paths.rawJson, JSON.stringify(raw, null, 2), 'utf8');

  const parsed = raw.length > 0 ? parseKpiTable(raw[0]) : { headerRows: [], dataRows: [] };
  const processedDate = await extractProcessedDate(page);
  const result = {
    reportCode: config.reportCode,
    name: config.name,
    ...parsed,
    processedDate,
    extractedAt: new Date().toISOString()
  };

  fs.writeFileSync(paths.dataJson, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(paths.dataCsv, kpiDataToCsv(result), 'utf8');

  log(indicatorKey, `✅ สำเร็จ (${result.dataRows.length} แถวข้อมูล)`);
  for (const row of result.dataRows) {
    log(indicatorKey, `  ${row.area}: ${row.values.join(', ')}`);
  }

  return result;
}

/**
 * Facility-level mode (Indicator 3-style): switches the "มุมมองการแสดงข้อมูล"
 * view to "รายหน่วยบริการ" then loops through every "อำเภอ" dropdown option,
 * clicking "ดูรายงาน" each time and extracting one facility-level KPI table
 * per district — same generic KPI parser as the province-level mode, just
 * run once per district with the อำเภอ filter applied.
 */
async function runFacilityByAmphoeIndicator(page, indicatorKey, config, paths) {
  log(indicatorKey, `เปลี่ยนมุมมองการแสดงข้อมูล -> ${config.viewMode}...`);
  await selectViewMode(page, config.viewMode);

  log(indicatorKey, 'ค้นหารายชื่ออำเภอทั้งหมดจาก dropdown จริง...');
  const amphoeList = await listAmphoeOptions(page);
  log(indicatorKey, `พบ ${amphoeList.length} อำเภอ:`, amphoeList.join(', '));

  const allData = {};
  const rawTables = {};

  for (const amphoeName of amphoeList) {
    let success = false;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
      try {
        log(indicatorKey, `[${amphoeName}] เลือก dropdown อำเภอ + กดดูรายงาน (ครั้งที่ ${attempt})...`);
        await selectAmphoeAndViewReport(page, amphoeName);

        const raw = await extractRawTables(page);
        rawTables[amphoeName] = raw;

        const parsed = raw.length > 0 ? parseKpiTable(raw[0]) : { headerRows: [], columns: [], dataRows: [] };
        const processedDate = await extractProcessedDate(page);
        allData[amphoeName] = { ...parsed, processedDate, extractedAt: new Date().toISOString() };

        log(indicatorKey, `[${amphoeName}] ✅ สำเร็จ (${parsed.dataRows.length} หน่วยบริการ)`);
        success = true;
      } catch (err) {
        lastError = err;
        log(indicatorKey, `[${amphoeName}] ❌ ล้มเหลว (ครั้งที่ ${attempt}):`, err.message);
        await page.waitForTimeout(1000);
      }
    }

    if (!success) {
      allData[amphoeName] = { error: lastError?.message || 'unknown error', extractedAt: new Date().toISOString() };
    }

    fs.writeFileSync(paths.dataJson, JSON.stringify({ reportCode: config.reportCode, name: config.name, viewMode: config.viewMode, byAmphoe: allData }, null, 2), 'utf8');
    fs.writeFileSync(paths.rawJson, JSON.stringify(rawTables, null, 2), 'utf8');
  }

  const csvRows = ['amphoe,facility,' + (Object.values(allData).find(d => d.columns?.length)?.columns.slice(1).map((_, i) => `col${i + 1}`).join(',') || '')];
  for (const [amphoe, entry] of Object.entries(allData)) {
    if (entry.error) continue;
    for (const row of entry.dataRows) {
      csvRows.push([amphoe, row.area, ...row.values].join(','));
    }
  }
  fs.writeFileSync(paths.dataCsv, csvRows.join('\n'), 'utf8');

  let okCount = 0, failCount = 0;
  for (const entry of Object.values(allData)) {
    if (entry.error) failCount++; else okCount++;
  }
  log(indicatorKey, `สำเร็จ ${okCount}/${amphoeList.length} อำเภอ, ล้มเหลว ${failCount}`);

  return allData;
}

async function runIndicator(indicatorKey) {
  const config = INDICATORS[indicatorKey];
  if (!config) {
    throw new Error(`ไม่พบตัวชี้วัด "${indicatorKey}" ใน scripts/indicators.config.js`);
  }

  const outDir = path.join(__dirname, '..', 'amphoe-data', config.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  const paths = {
    dataJson: path.join(outDir, 'data.json'),
    dataCsv: path.join(outDir, 'data.csv'),
    rawJson: path.join(outDir, 'raw-tables.json'),
    errorShot: path.join(outDir, 'error-screenshot.png')
  };

  const url = `https://hdc.moph.go.th/stn/public/standard-report-detail/${config.reportCode}`;

  log(indicatorKey, 'เปิดเบราว์เซอร์...');
  const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOWMO });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  try {
    log(indicatorKey, 'เปิดหน้ารายงาน:', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
    await page.waitForTimeout(2000);
    await closePopupIfAny(page);
    await page.waitForTimeout(800);

    if (config.filterByAmphoe) {
      await runAmphoeIndicator(page, indicatorKey, config, paths);
    } else if (config.mode === 'facilityByAmphoe') {
      await runFacilityByAmphoeIndicator(page, indicatorKey, config, paths);
    } else {
      await runProvinceIndicator(page, indicatorKey, config, paths);
    }

    log(indicatorKey, 'ไฟล์ผลลัพธ์:');
    log(indicatorKey, ' ', paths.dataJson);
    log(indicatorKey, ' ', paths.dataCsv);
    log(indicatorKey, ' ', paths.rawJson);
  } catch (fatalError) {
    log(indicatorKey, 'เกิดข้อผิดพลาดร้ายแรง:', fatalError.message);
    try {
      await page.screenshot({ path: paths.errorShot, fullPage: true });
      log(indicatorKey, 'บันทึก screenshot ไว้ที่:', paths.errorShot);
    } catch (_) { /* ignore */ }
    throw fatalError;
  } finally {
    await browser.close();
  }
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('ใช้งาน: node scripts/extract-indicator.js <indicator-key|all>');
    console.error('ตัวชี้วัดที่มี:', Object.keys(INDICATORS).join(', '));
    process.exit(1);
  }

  const keys = arg === 'all' ? Object.keys(INDICATORS) : [arg];
  let hadError = false;

  for (const key of keys) {
    try {
      await runIndicator(key);
    } catch (err) {
      hadError = true;
      console.error(`[${key}] ล้มเหลว:`, err.message);
    }
  }

  if (hadError) process.exitCode = 1;
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
