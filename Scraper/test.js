const { chromium } = require("@playwright/test");

(async () => {
  const chrome = chromium.launch();
  const page = await chrome.newPage();
  page.goto("https://");
})();
