import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure()?.errorText));
  page.on('response', response => {
    if (response.url().includes('/api/auth')) {
      console.log('AUTH RESPONSE:', response.status(), response.url());
    }
  });

  try {
    await page.goto('http://localhost:5173/login');
    
    // Fill the form using demo account
    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    
    console.log('Form filled, submitting...');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const url = page.url();
    console.log('Final URL:', url);
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
