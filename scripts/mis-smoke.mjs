// Smoke/interaction test for /mis (Person-dimension focus) — run: node scripts/mis-smoke.mjs [baseUrl]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch();
const fails = [];
const check = (cond, msg) => (cond ? console.log("  ✓", msg) : (fails.push(msg), console.log("  ✗", msg)));

async function run(name, viewport) {
  console.log(`\n[${name}] ${viewport.width}x${viewport.height}`);
  const page = await browser.newPage({ viewport, deviceScaleFactor: viewport.width < 500 ? 3 : 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}/mis`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  check((await page.locator("h1").innerText()).includes("ประชากร"), "hero title focuses on ประชากร");
  check((await page.locator("text=พีระมิดประชากร").count()) > 0, "population pyramid panel renders");
  check((await page.locator("text=แผนพัฒนามิติประชากร").count()) > 0, "roadmap panel renders");
  check((await page.locator(".recharts-surface").count()) === 0, "no disease charts rendered (hidden)");
  check((await page.locator("text=โรคไม่ติดต่อ (NCD)").count()) === 0, "NCD nav entry removed from sidebar");
  check((await page.locator("aside").first().locator("text=ข้อมูลพื้นฐาน").count()) === 1, "category header ข้อมูลพื้นฐาน renders");
  check((await page.locator("aside").first().locator("text=ประชากร").count()) >= 1, "sub-category ประชากร renders under category");
  // Content should fill the viewport, not leave a large empty band below the fold.
  const vh = viewport.height;
  const docH = await page.evaluate(() => document.body.scrollHeight);
  check(docH >= vh * 1.3, `page content fills well beyond one viewport (doc ${docH}px vs vh ${vh}px)`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 1, `no horizontal page overflow (${overflow}px)`);

  await page.screenshot({ path: `${out}/mis-${name}.png`, fullPage: true });

  if (viewport.width >= 1024) {
    // Category accordion collapses/expands
    const catBtn = page.locator("aside").first().locator("button", { hasText: "ข้อมูลพื้นฐาน" });
    await catBtn.click();
    await page.waitForTimeout(400);
    check((await page.locator("aside").first().locator("text=ประชากร").count()) === 0, "category collapses, hides sub-item");
    await catBtn.click();
    await page.waitForTimeout(400);
    check((await page.locator("aside").first().locator("text=ประชากร").count()) >= 1, "category re-expands, shows sub-item");

    // Year range picker still works
    await page.locator("button[aria-haspopup=dialog]").click();
    await page.waitForTimeout(300);
    check(await page.locator("[role=dialog]").isVisible(), "year range dialog opens");
    await page.keyboard.press("Escape");

    // Sidebar collapse persists
    await page.locator("button[aria-label='ย่อเมนู']").click();
    await page.waitForTimeout(500);
    const w = await page.locator("aside").first().evaluate((e) => e.getBoundingClientRect().width);
    check(w < 100, `sidebar collapses (${Math.round(w)}px)`);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const w2 = await page.locator("aside").first().evaluate((e) => e.getBoundingClientRect().width);
    check(w2 < 100, "collapsed state persists after reload");
    await page.locator("button[aria-label='ขยายเมนู']").click();
  } else {
    await page.locator("button[aria-label='เปิดเมนู']").click();
    await page.waitForTimeout(450);
    check(await page.locator("aside.fixed").isVisible(), "mobile drawer opens");
  }

  const real = errors.filter((e) => !/favicon/i.test(e));
  check(real.length === 0, `no console/page errors${real.length ? ": " + real.join(" | ") : ""}`);
  await page.close();
}

await run("desktop", { width: 1512, height: 950 });
await run("tablet", { width: 820, height: 1180 });
await run("mobile", { width: 390, height: 844 });
await browser.close();
console.log(fails.length ? `\nFAILED ${fails.length}` : "\nALL PASSED");
process.exit(fails.length ? 1 : 0);
