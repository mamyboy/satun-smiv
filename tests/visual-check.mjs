import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

await mkdir("artifacts", { recursive: true });
const results = [];

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `artifacts/${viewport.name}.png`, fullPage: true });

  const metrics = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent,
    statCards: document.querySelectorAll(".stat-card").length,
    panels: document.querySelectorAll(".panel").length,
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  if (viewport.name === "desktop") {
    try {
      await page.locator(".search-trigger").click();
      await page.locator(".dialog-input input").waitFor({ timeout: 3000 });
      await page.locator(".dialog-input input").fill("Analytics");
      metrics.searchResults = await page.locator(".dialog-results button").count();
      await page.keyboard.press("Escape");
      const before = await page.locator(".stat-card.featured .stat-value").textContent();
      await page.getByRole("button", { name: "เพิ่มโครงการ", exact: true }).click();
      const after = await page.locator(".stat-card.featured .stat-value").textContent();
      metrics.addProject = { before, after };
    } catch (error) {
      metrics.interactionError = error.message;
    }
  } else {
    try {
      await page.locator(".menu-button").click();
      metrics.sidebarOpen = await page.locator(".sidebar").evaluate((element) => element.classList.contains("is-open"));
    } catch (error) {
      metrics.interactionError = error.message;
    }
  }

  results.push({ viewport, metrics, errors });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
