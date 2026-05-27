const puppeteer = require('puppeteer');

const BASE_URL = 'https://project-5djm1.vercel.app';
const ROUTES = ['/', '/dashboard', '/members', '/contributions', '/loans', '/meetings', '/analytics', '/pricing', '/settings'];

async function test() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const results = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  for (const route of ROUTES) {
    const url = BASE_URL + route;
    const result = { route, url, success: false, error: null };
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      result.success = true;
      const title = await page.title();
      result.title = title;
      if (route === '/') {
        const branding = await page.$('text=ChamaOS', { visible: true }).catch(() => null);
        result.hasChamaOSBranding = !!branding;
      }
    } catch (e) {
      result.error = e.message;
    }
    results.push(result);
  }

  const loginResult = { route: '/login', url: BASE_URL + '/login', success: false, error: null };
  try {
    await page.goto(loginResult.url, { waitUntil: 'networkidle2', timeout: 15000 });
    loginResult.success = true;
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitBtn = await page.$('button[type="submit"]');
    loginResult.hasEmailInput = !!emailInput;
    loginResult.hasPasswordInput = !!passwordInput;
    loginResult.hasSubmitButton = !!submitBtn;
  } catch (e) {
    loginResult.error = e.message;
  }
  results.push(loginResult);

  console.log('\n=== TEST RESULTS ===\n');
  let passCount = 0;
  for (const r of results) {
    const status = r.success ? '✓' : '✗';
    console.log(`${status} ${r.route}: ${r.success ? 'OK' : r.error}`);
    if (r.success && (r.hasChamaOSBranding || r.hasEmailInput || r.hasSubmitButton)) {
      if (r.hasChamaOSBranding) console.log(`  - ChamaOS branding visible`);
      if (r.hasEmailInput) console.log(`  - Email input present`);
      if (r.hasPasswordInput) console.log(`  - Password input present`);
      if (r.hasSubmitButton) console.log(`  - Submit button present`);
    }
    if (r.success) passCount++;
  }

  console.log('\n=== CONSOLE ERRORS ===\n');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected');
  } else {
    for (const e of consoleErrors) console.log(`ERROR: ${e}`);
  }

  console.log(`\nTotal: ${passCount}/${results.length} pages loaded successfully`);

  await browser.close();
  process.exit(passCount === results.length ? 0 : 1);
}

test().catch(e => { console.error(e); process.exit(1); });