const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

puppeteer.use(StealthPlugin());

async function scrapeGoldData() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.logammulia.com/id', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('input[name="_token"]');

    const token = await page.$eval('input[name="_token"]', el => el.value);
    console.log('✅ Token ditemukan:', token);

    // WIB (UTC+7)
    const transitionDate = dayjs().add(7, 'hour').format('YYYY-MM-DD');
    console.log('📅 Tanggal:', transitionDate);

    // Scrape SELL data
    await scrapeSellData(page, token, transitionDate);

    // Scrape BUY data
    await scrapeBuyData(page, token, transitionDate);

    console.log('✅ Semua data berhasil discrape dan disimpan');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

async function scrapeSellData(page, token, transitionDate) {
  console.log('\n📊 Scraping SELL data...');
  
  const url = `https://www.logammulia.com/data-base-price/gold_eai/sell?_token=${token}&transition=1`;
  console.log('🔗 Sell URL:', url);

  await new Promise(resolve => setTimeout(resolve, 5000)); // delay

  const resultText = await page.evaluate(async (_url) => {
    const res = await fetch(_url, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    return await res.text();
  }, url);

  try {
    const json = JSON.parse(resultText);
    console.log('✅ Sell data parsed:', json.length, 'entries');

    // Create data/sell folder if it doesn't exist
    const dataDir = path.join(__dirname, 'data', 'sell');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing data from antam_sell.json in parent folder
    const parentFile = path.join(__dirname, 'antam_sell.json');
    let existing = [];
    if (fs.existsSync(parentFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(parentFile, 'utf-8'));
      } catch (e) {
        console.warn('⚠️ Gagal baca antam_sell.json:', e.message);
      }
    }

    // Merge old + new data
    const combined = [...existing, ...json];

    // Remove duplicates based on YYYY-MM-DD + price
    const seen = new Set();
    const filtered = combined.filter(([ts, price]) => {
      const key = `${dayjs(ts).format('YYYY-MM-DD')}-${price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by timestamp
    filtered.sort((a, b) => a[0] - b[0]);

    // Save daily archive
    const filename = path.join(dataDir, `gold-sell-${transitionDate}.json`);
    fs.writeFileSync(filename, JSON.stringify(filtered, null, 2));

    // Update parent folder antam_sell.json
    fs.writeFileSync(parentFile, JSON.stringify(filtered, null, 2));

    console.log(`💾 Sell data disimpan ke ${filename} dan antam_sell.json (total ${filtered.length} data)`);
  } catch (e) {
    console.error('❌ Gagal parse sell data:', e.message);
    console.log('📄 Cuplikan isi:', resultText.slice(0, 300));
  }
}

async function scrapeBuyData(page, token, transitionDate) {
  console.log('\n📊 Scraping BUY data...');
  
  const url = `https://www.logammulia.com/data-base-price/gold/buy?_token=${token}`;
  console.log('🔗 Buy URL:', url);

  await new Promise(resolve => setTimeout(resolve, 5000)); // delay

  const resultText = await page.evaluate(async (_url) => {
    const res = await fetch(_url, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    return await res.text();
  }, url);

  try {
    const json = JSON.parse(resultText);
    console.log('✅ Buy data parsed:', json.length, 'entries');

    // Create data/buy folder if it doesn't exist
    const dataDir = path.join(__dirname, 'data', 'buy');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing data from antam_buy.json in parent folder
    const parentFile = path.join(__dirname, 'antam_buy.json');
    let existing = [];
    if (fs.existsSync(parentFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(parentFile, 'utf-8'));
      } catch (e) {
        console.warn('⚠️ Gagal baca antam_buy.json:', e.message);
      }
    }

    // Merge old + new data
    const combined = [...existing, ...json];

    // Remove duplicates based on YYYY-MM-DD + price
    const seen = new Set();
    const filtered = combined.filter(([ts, price]) => {
      const key = `${dayjs(ts).format('YYYY-MM-DD')}-${price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by timestamp
    filtered.sort((a, b) => a[0] - b[0]);

    // Save daily archive
    const filename = path.join(dataDir, `gold-buy-${transitionDate}.json`);
    fs.writeFileSync(filename, JSON.stringify(filtered, null, 2));

    // Update parent folder antam_buy.json
    fs.writeFileSync(parentFile, JSON.stringify(filtered, null, 2));

    console.log(`💾 Buy data disimpan ke ${filename} dan antam_buy.json (total ${filtered.length} data)`);
  } catch (e) {
    console.error('❌ Gagal parse buy data:', e.message);
    console.log('📄 Cuplikan isi:', resultText.slice(0, 300));
  }
}

scrapeGoldData();
