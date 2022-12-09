const { login } = require("./login");
const fs = require("fs/promises");
const oldData = require("./oldData.json");

let i = 144;

async function write(data) {
  try {
    const content = JSON.stringify(data);
    await fs.writeFile("./oldData.json", content, {
      flag: "w",
    });
  } catch (e) {
    fetch("http://127.0.0.1:1000/error", { method: "POST" });
  }
}

async function viewForNew() {
  const { chrome, AnyVan } = await login();

  while (i > 0) {
    i--;
    await AnyVan.goto("https://anyvan.com/dashboard#listing-book-now", {
      timeout: 60000,
    });
    await AnyVan.waitForTimeout(9000);
    const table =
      "#main-content-area > div:nth-child(5) > div.container > div.content.active > table";
    const tbody = `${table} > tbody`;
    let pagination = await AnyVan.locator(
      `${table} + .pagination li.page.last.active`
    ).getAttribute("data-page");

    const pages = Number(pagination);
    for (let page = 0; page <= pages; page++) {
      let next;
      try {
        next = AnyVan.locator(`${table} + .pagination li.page.next.active`);
      } catch {
        break;
      }

      if (page != 0) {
        await next.click();
        await AnyVan.waitForTimeout(5000);
      }

      const bookContent = AnyVan.locator(`${tbody} .row`);
      const rows = await bookContent.count();

      for (let rowIndex = 1; rowIndex <= rows; rowIndex++) {
        const row = `${tbody} tr:nth-child(${rowIndex})`;
        const label = `${row} > td[data-name="listing_label"]`;
        const anchor = AnyVan.locator(`${label} > a`);
        const title = await AnyVan.textContent(
          `${label} > a > span:first-child`
        );

        if (title in oldData) {
          console.log("Not new: ", title);
          continue;
        }

        const imgTag = AnyVan.locator(
          `${row} > td[data-name="virtual_thumbnail_url"] > img`
        );
        const image = await imgTag.getAttribute("src");
        const link = "https://anyvan.com" + (await anchor.getAttribute("href"));
        const distance = await AnyVan.textContent(
          `${row} > td[data-name="listing_distance"]`
        );
        const from = {
          town: await AnyVan.textContent(
            `${row} > td[data-name="listing_pickup_address"] > .town`
          ),
          region: await AnyVan.textContent(
            `${row} > td[data-name="listing_pickup_address"] > .region`
          ),
          postcode: await AnyVan.textContent(
            `${row} > td[data-name="listing_pickup_address"] > .postcode`
          ),
        };
        const to = {
          town: await AnyVan.textContent(
            `${row} > td[data-name="listing_delivery_address"] > .town`
          ),
          region: await AnyVan.textContent(
            `${row} > td[data-name="listing_delivery_address"] > .region`
          ),
          postcode: await AnyVan.textContent(
            `${row} > td[data-name="listing_delivery_address"] > .postcode`
          ),
        };
        const pickupDate = await AnyVan.textContent(
          `${row} > td[data-name="listing_pickup_date"]`
        );
        const price = await AnyVan.textContent(
          `${row} > td[data-name="book_now_price"]`
        );

        let headers = {
          "Content-Type": "aplication/json",
          body: JSON.stringify({
            title: title,
            launch: link,
            msg: `For ${price}, from ${from.town} ${from.region} ${
              from.postcode
            }, to ${to.town} ${to.region} ${
              to.postcode
            }\nPickup Date: ${pickupDate.toLocaleLowerCase()}, Distance: ${distance}`,
          }),
          method: "POST",
        };

        fetch("http://127.0.0.1:1000/", headers)
          .then((res) => res)
          .then((response) => console.log(response))
          .catch((err) => console.log(err));

        console.log("New: ", title);

        oldData[title] = {
          title: title,
          img: image,
          link: link,
          distance: distance,
          from: from,
          to: to,
          pickupDate: pickupDate,
          price: price,
        };
      }
    }
    await write(oldData);
    await AnyVan.waitForTimeout(300000);
  }

  await chrome.close();
  fetch("http://127.0.0.1:1000/closeScraper", { method: "POST" });
}

(async () => {
  await viewForNew();
})();
