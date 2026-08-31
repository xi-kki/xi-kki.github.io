// Batch-capture real screenshots of all live portfolio projects
const path = require('path');

// Load global playwright
const globalRoot = process.env.APPDATA + '/npm/node_modules';
const { chromium } = require(path.join(globalRoot, 'playwright'));

const OUT = path.join(__dirname, '..', 'images', 'projects');

// url -> filename (must match card preview img names)
const SITES = {
  veridd:     'https://veridd.vercel.app',
  'xikki-brief': 'https://thexikkibrief.substack.com',
  'paiye-bot': 'https://t.me/Paiye_Bot',
  zareb:      'https://zareb.netlify.app',
  alithea:    'https://alithea.vercel.app',
  gaid3:      'https://gaid3.vercel.app',
  saiki:      'https://saiki-two.vercel.app',
  logos:      'https://logos-one-pied.vercel.app',
  // conduit:  'https://conduitapp.vercel.app',  // WRONG URL points to different B2B project
  quizfinity: 'https://quizfinity.vercel.app',
  sabe:       'https://sabe-six.vercel.app',
  ankor:      'https://ankore.vercel.app',
  s4f3:       'https://s4f3.vercel.app',
  droplet:    'https://droplet-topaz.vercel.app',
  lynx:       'https://lynx-research-six.vercel.app',
  negotia8:   'https://negotia8.vercel.app',
  talass:     'https://talass.vercel.app',
  sousy:      'https://sousy.vercel.app',
};

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  let ok = 0, fail = [];
  for (const [slug, url] of Object.entries(SITES)) {
    const file = path.join(OUT, `${slug}.png`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // wait a bit for fonts/JS to settle
      await page.waitForTimeout(6000);
      // scroll to top to be safe
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({ path: file });
      // quick sanity: file size
      const size = require('fs').statSync(file).size;
      console.log(`OK   ${slug}.png  ${(size/1024).toFixed(1)} KB  ${(await page.title()).slice(0,60)}`);
      ok++;
    } catch (e) {
      fail.push(`${slug}: ${e.message.split('\n')[0]}`);
      console.log(`FAIL ${slug}  ${e.message.split('\n')[0]}`);
    }
  }
  await browser.close();
  console.log(`\nDone: ${ok}/${Object.keys(SITES).length} captured`);
  if (fail.length) { console.log('Failures:'); fail.forEach(f => console.log('  ' + f)); }
})();
