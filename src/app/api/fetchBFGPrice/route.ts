// src/app/api/fetchBFGPrice/route.ts
import puppeteer from 'puppeteer-core';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });

    const page = await browser.newPage();
    const siteUrl = "https://coinmarketcap.com/currencies/betfury/";

    await page.goto(siteUrl, { waitUntil: "networkidle2" });

    const priceSelector = "#section-coin-overview > div.sc-65e7f566-0.DDohe.flexStart.alignBaseline > span";
    await page.waitForSelector(priceSelector);

    const priceText = await page.$eval(priceSelector, (el: { textContent: any; }) => el.textContent);

    if (!priceText) {
      throw new Error('Price text not found');
    }

    const price = parseFloat(priceText.replace(/[^0-9.-]/g, ''));

    if (isNaN(price)) {
      throw new Error('Price conversion error');
    }

    const myTokenBuyPrice = (price + (price * 0.05)).toFixed(5);
    const myTokenSellPrice = (price - (price * 0.05)).toFixed(5);

    await browser.close();

    return NextResponse.json({ price, myTokenBuyPrice, myTokenSellPrice });
  } catch (err) {
    console.error('Error fetching price:', err);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}
