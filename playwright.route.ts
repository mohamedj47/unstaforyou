import { chromium } from "playwright";
import fs from "fs";

const mocks = JSON.parse(fs.readFileSync("./mocks.json", "utf8"));

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  for (const mock of mocks) {
    if (mock.enabled === false) continue;
    await page.route("**" + mock.url + "*", async (route) => {
      if (route.request().method() !== mock.method) return route.continue();
      if (mock.delayMs) await new Promise((r) => setTimeout(r, mock.delayMs));
      await route.fulfill({
        status: mock.statusCode || 200,
        contentType: "application/json",
        body: mock.responseBody,
      });
    });
  }

  await page.goto("http://localhost:3000/pages/index.html");
}

main();
