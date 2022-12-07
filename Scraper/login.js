const { chromium, expect } = require("@playwright/test");
const account = require("./account.json");

export default async function login() {
  const chrome = await chromium.launch({ headless: false });
  const loginPage = await chrome.newPage();
  await loginPage.goto("https://anyvan.com");
  await expect(loginPage.locator('.log:has-text("Log in")')).toBeVisible();
  await loginPage.locator('.log:has-text("Log in")').click();
  await loginPage.getByLabel("E-mail address:").fill(account.email);
  await loginPage.getByLabel("Password:").fill(account.password);
  await loginPage.locator('input[name="submit-login"]').click();

  return { chrome: chrome, AnyVan: loginPage };
}
