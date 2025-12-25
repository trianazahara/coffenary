require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

console.log("USERNAME:", process.env.BROWSERSTACK_USERNAME);
console.log("ACCESS_KEY:", process.env.BROWSERSTACK_ACCESS_KEY);

const { Builder, By, until } = require("selenium-webdriver");

const USERNAME = process.env.BROWSERSTACK_USERNAME;
const ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;

if (!USERNAME || !ACCESS_KEY) {
  throw new Error(
    "BROWSERSTACK_USERNAME dan BROWSERSTACK_ACCESS_KEY harus di-set di environment"
  );
}

const HUB_URL = `https://${USERNAME}:${ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`;

const APP_URL = "https://disttress.cloud/";


const browserConfigs = [
  ["Chrome latest - Windows 11", {
    browserName: "Chrome",
    browserVersion: "latest",
    "bstack:options": { os: "Windows", osVersion: "11", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Chrome latest - Windows 11" },
  }],
  ["Chrome latest-1 - Windows 10", {
    browserName: "Chrome",
    browserVersion: "latest-1",   
    "bstack:options": { os: "Windows", osVersion: "10", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Chrome latest-1 - Windows 10" },
  }],
  ["Edge latest - Windows 11", {
    browserName: "Edge",
    browserVersion: "latest",
    "bstack:options": { os: "Windows", osVersion: "11", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Edge latest - Windows 11" },
  }],
  ["Edge latest-1 - Windows 10", {
    browserName: "Edge",
    browserVersion: "latest-1",
    "bstack:options": { os: "Windows", osVersion: "10", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Edge latest-1 - Windows 10" },
  }],
  ["Firefox latest - Windows 11", {
    browserName: "Firefox",
    browserVersion: "latest",
    "bstack:options": { os: "Windows", osVersion: "11", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Firefox latest - Windows 11" },
  }],
  ["Firefox latest-1 - Windows 10", {
    browserName: "Firefox",
    browserVersion: "latest-1",
    "bstack:options": { os: "Windows", osVersion: "10", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Firefox latest-1 - Windows 10" },
  }],
  ["Safari latest - macOS Sonoma", {
    browserName: "Safari",
    browserVersion: "latest",
    "bstack:options": { os: "OS X", osVersion: "Sonoma", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Safari latest - Sonoma" },
  }],
  ["Safari latest - macOS Monterey", {
    browserName: "Safari",
    browserVersion: "latest",   
    "bstack:options": { os: "OS X", osVersion: "Monterey", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Safari latest - Monterey" },
  }],
  ["Safari latest - macOS Ventura", {
    browserName: "Safari",
    browserVersion: "latest",
    "bstack:options": { os: "OS X", osVersion: "Ventura", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Safari latest - Ventura" },
  }],
  ["Chrome latest - macOS Sonoma", {
    browserName: "Chrome",
    browserVersion: "latest",
    "bstack:options": { os: "OS X", osVersion: "Sonoma", projectName: "Coffenary", buildName: "Coffenary Compat Build 1", sessionName: "Chrome latest - macOS Sonoma" },
  }],
  // ["Opera 125 - Windows 10", {
  //   browserName: "Opera",
  //   browserVersion: "125",
  //   "bstack:options": {
  //     os: "Windows",
  //     osVersion: "10",
  //     projectName: "Coffenary",
  //     buildName: "Coffenary Compat Build 1",
  //     sessionName: "Opera 125 - Windows 10"
  //   },
  // }],
  // ["Yandex 24.12 - Windows 10", {
  //   browserName: "Yandex",
  //   browserVersion: "24.12",
  //   "bstack:options": {
  //     os: "Windows",
  //     osVersion: "10",
  //     projectName: "Coffenary",
  //     buildName: "Coffenary Compat Build 1",
  //     sessionName: "Yandex 24.12 - Windows 10"
  //   },
  // }],
];


describe.each(browserConfigs)(
  "Coffenary - compatibility test: %s",
  (label, capabilities) => {
    let driver;

    beforeAll(async () => {
      driver = await new Builder()
        .usingServer(HUB_URL)
        .withCapabilities(capabilities)
        .build();
    }, 30000);

    afterAll(async () => {
      if (driver) {
        await driver.quit();
      }
    });

    test(
      "halaman login bisa dibuka",
      async () => {
        await driver.get(APP_URL);

        await driver.wait(until.titleContains("Coffenary"), 15000);

        await driver.wait(until.elementLocated(By.css("body")), 15000);
        const body = await driver.findElement(By.css("body"));
        expect(body).toBeDefined();

        const source = (await driver.getPageSource()).toLowerCase();
        expect(source).toContain("coffenary");
      },
      60000
    );
  }
);
