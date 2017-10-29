const fs = require("fs");
const connect = require("connect"),
  serveStatic = require("serve-static");
const puppeteer = require("puppeteer");

const port = 3000;
console.log("Listening on port", 3000);

const app = connect();

app.use(serveStatic("./dist/Piano-Trainer"));
app.listen(port);

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:" + port);
  const html = await page.content();

  fs.writeFile("./dist/Piano-Trainer/index.html", html, async () => {
    console.log("Successfully wrote pre-rendered html into index.html");
    await browser.close();
    process.exit(0);
  });
}

run();
