const { chromium, expect, firefox } = require("@playwright/test");
const account = require("./account.json");

async function login() {
  const chrome = await chromium.launch({ headless: true });
  const loginPage = await chrome.newPage();
  await loginPage.goto("https://anyvan.com", {
    timeout: 60000,
  });
  await expect(loginPage.locator('.log:has-text("Log in")')).toBeVisible();
  await loginPage.locator('.log:has-text("Log in")').click();
  await loginPage.getByLabel("E-mail address:").fill(account.email);
  await loginPage.getByLabel("Password:").fill(account.password);
  await loginPage.locator('input[name="submit-login"]').click();

  return { chrome: chrome, AnyVan: loginPage };
}

module.exports.login = login;
