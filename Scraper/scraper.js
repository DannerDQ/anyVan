const { chromium, expect } = require("@playwright/test");
const { login } = require("./login");
const fs = require("fs/promises");
const oldData = require("./oldData.json");

async function write(data) {
  try {
    const content = JSON.stringify(data);
    await fs.writeFile("./oldData.json", content, {
      flag: "w",
    });
  } catch (e) {
    console.log(e);
  }
}

(async () => {
  const { chrome, AnyVan } = await login();

  await AnyVan.goto("https://anyvan.com/dashboard#listing-book-now");
  await AnyVan.waitForTimeout(10000);

  const book = await AnyVan.locator('div[data-name="listing-book-now"]');
  const bookContent = await book.locator(".row");
  const rows = await bookContent.count();

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const row = await bookContent.nth(rowIndex);
    const label = await row.locator('td[data-name="listing_label"]');
    const anchor = await label.locator("a");
    const link = await anchor.getAttribute("href");
    const title = await anchor
      .locator("span:not(.listing_is_fullpayment)")
      .textContent();
    let fullPayment;
    try {
      await anchor.locator(".listing_is_fullpayment");
      fullPayment = true;
    } catch (e) {
      fullPayment = false;
    }
    const from = await row
      .locator('td[data-name="listing_pickup_address"]')
      .textContent();
    const to = await row
      .locator('td[data-name="listing_delivery_address"]')
      .textContent();
    const pickupDate = await row
      .locator('td[data-name="listing_pickup_date"]')
      .textContent();
    const price = await row
      .locator('td[data-name="book_now_price"]')
      .textContent();

    oldData[title] = {
      link: link,
      from: from,
      to: to,
      pickupDate: pickupDate,
      price: price,
    };
  }

  await write(oldData);
  await chrome.close();
})();
