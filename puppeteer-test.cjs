const puppeteer = require('puppeteer');

async function checkWebsite() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const consoleErrors = [];
  const consoleMessages = [];

  async function visitPage(url, description) {
    console.log(`\n=== ${description} ===`);
    console.log(`URL: ${url}\n`);
    
    const page = await browser.newPage();
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const title = await page.title();
      console.log(`Page title: ${title}`);

      const content = await page.evaluate(() => document.body.innerText);
      console.log(`Page text content:\n${content.substring(0, 1000)}`);

      const rootHTML = await page.evaluate(() => {
        const root = document.querySelector('#root');
        return root ? root.innerHTML.substring(0, 2000) : 'No #root found';
      });
      console.log(`\n#root HTML (first 2000 chars):\n${rootHTML}`);

      const hasChamaOS = content.includes('ChamaOS');
      const hasLoginBtn = /login/i.test(content);
      const hasSignupBtn = /sign.?up|register/i.test(content);
      console.log(`\nChecks: ChamaOS=${hasChamaOS}, Login=${hasLoginBtn}, Signup=${hasSignupBtn}`);

      const forms = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        const buttons = document.querySelectorAll('button');
        return {
          inputs: Array.from(inputs).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
          buttons: Array.from(buttons).map(b => b.textContent.trim())
        };
      });
      console.log(`\nForm elements: ${JSON.stringify(forms)}`);

    } catch (err) {
      console.log(`Error loading page: ${err.message}`);
    }
    
    await page.close();
  }

  await visitPage('https://project-5djm1.vercel.app/', 'Home Page');
  await visitPage('https://project-5djm1.vercel.app/login', 'Login Page');

  console.log('\n=== Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors');
  } else {
    consoleErrors.forEach(e => console.log(e));
  }

  await browser.close();
}

checkWebsite().catch(console.error);