const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

let browser, page;

// runs before every test
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-gpu",
      "--no-sandbox",
      "--lang=en-US",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ], // this one removes page crash errors
  });

  page = await browser.newPage();
  await page.goto("localhost:3000");
});

// runs after every test
afterEach(async () => {
  await browser.close();
});

test("The header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);

  expect(text).toEqual("Blogster");
});

test("Clicking login should start Oauth flow", async () => {
  await page.click("ul.right a");
  const currentUrl = await page.url();
  expect(currentUrl).toMatch(/accounts\.google\.com/); // make sure to escape the "."
});

test("After Signing in, logout is displayed", async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });

  await page.goto("localhost:3000");

  await page.waitFor(".right > li:nth-child(2) > a:nth-child(1)");

  const text = await page.$eval(
    ".right > li:nth-child(2) > a:nth-child(1)",
    (el) => el.innerHTML
  );
  expect(text).toEqual("Logout");
});
