const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('https://project-5djm1.vercel.app/', { waitUntil: 'networkidle0' });
  
  const visibleText = await page.evaluate(() => document.body.innerText);
  const hasChamaOS = await page.evaluate(() => {
    const headings = document.querySelectorAll('h1, h2, h3');
    return Array.from(headings).some(h => h.textContent.includes('ChamaOS'));
  });

  console.log('=== VISIBLE TEXT ===');
  console.log(visibleText);
  console.log('\n=== ChamaOS HEADING VISIBLE ===');
  console.log(hasChamaOS ? 'YES' : 'NO');
  console.log('\n=== CONSOLE ERRORS ===');
  console.log(consoleErrors.length > 0 ? consoleErrors.join('\n') : 'None');
  
  await browser.close();
})();