import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to the registration page
  await page.goto('http://localhost:5173/register');

  // Fill in the form with a random email to ensure success
  const randomEmail = `testuser${Date.now()}@test.com`;
  await page.fill('input[type="text"]', 'Test User');
  await page.fill('input[type="email"]', randomEmail);
  await page.fill('input[type="tel"]', '9876543210');
  await page.fill('input[type="password"]', 'supersecret');

  // Select customer role
  await page.click('button:has-text("Customer")');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => console.log('Did not navigate to dashboard'));
  
  // Wait a bit for animations to finish
  await page.waitForTimeout(2000);

  // Take a screenshot
  const screenshotPath = 'C:\\Users\\Manoj\\.gemini\\antigravity\\brain\\fa71501d-cc7f-483d-920a-d379f9d50320\\artifacts\\dashboard_preview.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to ${screenshotPath}`);

  await browser.close();
})();
