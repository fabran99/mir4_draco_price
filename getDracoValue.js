// import selenium
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");
const ServiceBuilder = chrome.ServiceBuilder;
// chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const chromedriverPath = require("chromedriver").path.replace(
  "app.asar",
  "app.asar.unpacked"
);
const serviceBuilder = new ServiceBuilder(chromedriverPath);

const driver = new webdriver.Builder()
  .setChromeOptions(new chrome.Options().headless())
  // .usingServer("http://localhost:9515")
  // .withCapabilities({
  //   "goog:chromeOptions": {
  //     // Here is the path to your Electron binary.
  //     binary: "./node_modules/.bin/electron.exe",
  //   },
  // })
  .setChromeService(serviceBuilder)
  .forBrowser("chrome")
  .build();

const URL = "https://www.mir4draco.com/price";

const getDraco = async () => {
  // create a new chrome session and get de html from the URL, then return it
  // driver should start in headless mode
  await driver.get(URL);
  //   wait 15 seconds
  await driver.sleep(15000);
  //   find all elements with the class "amount"
  const elements = await driver.findElements(webdriver.By.className("amount"));
  // get the innerHTML of every element
  const values = await Promise.all(
    elements.map(async (element) => {
      return await element.getAttribute("innerHTML");
    })
  );

  //   find an element that starts with $ then convert the string to a float, then return it
  // the text starts with $ and has a comma that should be replace to a point before converting to a float
  const dracoValue = values.find((value) => {
    return value.startsWith("$");
  });
  if (dracoValue !== undefined) {
    // replace the comma with a point and remove the $, then convert to a float
    return parseFloat(dracoValue.replace(/\,/g, ".").replace("$", ""));
  }
  // close the driver
  await driver.quit();
  // return the values
  return null;
};

// export getDraco function
module.exports = getDraco;
