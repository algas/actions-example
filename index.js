const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {URL} = require('url');
const fs = require('fs');

const launchBrowser = async () => {
  return await puppeteer.launch({
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
};


const runTest = async (browser, host, path) => {
  return await lighthouse(host+path, {
    port: (new URL(browser.wsEndpoint())).port,
    output: ['json','html'],
    disableDeviceEmulation: true,
    logLevel: 'info',
    throttlingMethod: 'provided',
  });
};


const outputToFile = async (filePath, data) => {
  console.log(`outputToFile: ${filePath}`);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if(err){
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
};

(async (req, res) => {
  let browser;
  const host = 'https://google.com';
  const testPath = '/';
  const reportFilePath = 'output/result.html'

  try {
    browser = await launchBrowser();
    const {lhr, report} = await runTest(browser, host, testPath);
    // console.log(lhr);
    const html = report[1];
    // console.log(html);
    await outputToFile(reportFilePath, html);
  } 
  catch (err) {
    if(err instanceof Error) {
      console.error(err);
    } else {
      console.error(new Error(err));
    }
  } 
  finally {
    if(browser){
      await browser.close();
    }
  }
})();