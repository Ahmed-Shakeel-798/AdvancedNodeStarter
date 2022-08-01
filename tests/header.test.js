const puppeteer = require('puppeteer');

let browser, page;

// runs before every test
beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-gpu', '--no-sandbox', '--lang=en-US', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] // this one removes page crash errors
    });

    page = await browser.newPage();
    await page.goto('localhost:3000');
});

// runs after every test
afterEach(async () => {
    await browser.close();
});

test('Checking the logo', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual("Blogster");
});