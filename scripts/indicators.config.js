/**
 * Central registry of HDC indicators this project extracts.
 * Add a new indicator here, then run:
 *   node scripts/extract-indicator.js <key>
 *
 * filterByAmphoe:
 *   true  -> script drives the real "อำเภอ" ngx-select dropdown and loops
 *            through every district, extracting one table per district.
 *   false -> script clicks "ดูรายงาน" once (province-level report) and
 *            extracts a single table, no dropdown interaction needed.
 *
 * mode: 'facilityByAmphoe' (used with filterByAmphoe: false) ->
 *   first switches the "มุมมองการแสดงข้อมูล" view-mode dropdown to the
 *   `viewMode` option (e.g. "รายหน่วยบริการ"), then loops through every
 *   อำเภอ dropdown option same as filterByAmphoe, extracting one
 *   facility-level table per district.
 */

module.exports = {
  indicator1: {
    reportCode: '342c01cf6fd12450b7271740642df5a3',
    name: 'จำนวนผู้ป่วยจิตเวชที่มีความเสี่ยงต่อการก่อความรุนแรง (SMI-V)ที่มารับบริการในปีงบประมาณ(คนต่อสถานพยาบาล) จำแนกตามการวินิจฉัย',
    filterByAmphoe: true,
    outputDir: 'indicator1'
  },
  indicator2: {
    reportCode: 'r3yveog8x2yk4ug0tca4z',
    name: 'ร้อยละของผู้ป่วยจิตเวชสารเสพติดก่อความรุนแรง (SMI-V) ในเขตสุขภาพเข้าถึงบริการได้รับการดูแลต่อเนื่องและไม่ก่อความรุนแรงซ้ำ',
    filterByAmphoe: false,
    outputDir: 'indicator2'
  },
  indicator3: {
    reportCode: '1b64b51e4bf2edb57d2ddd1c316d48b1',
    name: 'ร้อยละผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) ไม่ก่อความรุนแรงซ้า',
    filterByAmphoe: false,
    mode: 'facilityByAmphoe',
    viewMode: 'รายหน่วยบริการ',
    outputDir: 'indicator3'
  },
  indicator4: {
    reportCode: 'pepa25tv0dy1coasj2c8w',
    name: 'จำนวนผู้ป่วยจิตเวชยาเสพติดก่อความรุนแรง (SMI-V) ที่ขาดการรักษาก่อความรุนแรงซ้ำจำแนกตามประเภทความรุนแรง ที่มารับการรักษาในปีงบประมาณ',
    filterByAmphoe: false,
    outputDir: 'indicator4'
  },
  indicator5: {
    reportCode: 'f76033a904fdd49edb0f99657b44550c',
    name: 'ร้อยละผู้ป่วยจิตเวชที่มีความเสี่ยงสูงต่อการก่อความรุนแรง (SMI-V) ได้รับการติดตาม ดูแลเฝ้าระวัง ตามแนวทางที่กำหนด (Workload)',
    filterByAmphoe: false,
    mode: 'facilityByAmphoe',
    viewMode: 'รายหน่วยบริการ',
    outputDir: 'indicator5'
  }
};
