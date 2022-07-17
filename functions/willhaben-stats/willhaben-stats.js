const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export default async function handler(req, res) {
  let result = {};
  // parse body of POSY request to valid object and
  // use object destructuring to obtain target url
  const endpoint = JSON.parse(req.body);

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.EXCECUTABLE_PATH || (await chromium.executablePath),
    headless: true,
  });

  // open new page in browser
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  try {
    // navigate to the targetURL
    await page.goto(endpoint.url, {
      timeout: 10 * 1000,
      waitUntil: "domcontentloaded",
    });

    // get the title from the newly loaded page
    const element = await page.waitForSelector("#result-list-title");
    const value = await element.evaluate((el) => el.textContent);
    let description = value.split(" ")[0];

    result.description = description;
    result.title = value.substring(value.indexOf(" "));

    /* const screenshot = await page.screenshot({
      type: "jpeg",
      encoding: "base64",
    }); */

    // result.screenshot = screenshot;

    res.send(result);

    // close the browser
    await browser.close();
  } catch (error) {
    res.send();
    // if any error occurs, close the browser instance
    // and send an error code
    await browser.close();
  }
}