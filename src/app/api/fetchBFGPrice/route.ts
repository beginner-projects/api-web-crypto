// src/app/api/fetchBFGPrice/route.ts
import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function GET() {
  let browser;
  try {
    // Launch the browser using chrome-aws-lambda
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath || "/usr/bin/chromium-browser",
      headless: true,
    });

    const page = await browser.newPage();
    const siteUrl = "https://coinmarketcap.com/currencies/betfury/";

    await page.goto(siteUrl, { waitUntil: "networkidle2" });

    const priceSelector = "#section-coin-overview > div.sc-65e7f566-0.DDohe.flexStart.alignBaseline > span";
    await page.waitForSelector(priceSelector);

    const priceText = await page.$eval(priceSelector, (el: { textContent: any }) => el.textContent);

    if (!priceText) {
      throw new Error('Price text not found');
    }

    const price = parseFloat(priceText.replace(/[^0-9.-]/g, ''));

    if (isNaN(price)) {
      throw new Error('Price conversion error');
    }

    const myTokenBuyPrice = (price + (price * 0.05)).toFixed(5);
    const myTokenSellPrice = (price - (price * 0.05)).toFixed(5);

    return NextResponse.json({ price, myTokenBuyPrice, myTokenSellPrice });
  } catch (err) {
    console.error('Error fetching price:', err);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
