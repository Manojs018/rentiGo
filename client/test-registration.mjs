import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to the registration page
  await page.goto('http://localhost:5173/register');

  // Fill in the form
  await page.fill('input[type="text"]', 'Antigravity AI');
  await page.fill('input[type="email"]', 'antigravity@test.com');
  await page.fill('input[type="tel"]', '9876543210');
  await page.fill('input[type="password"]', 'supersecret');

  // Select customer role
  // Click on the first button in the role selector (Customer)
  await page.click('button:has-text("Customer")');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation or a toast message
  await page.waitForTimeout(2000);

  // Take a screenshot of the dashboard
  const screenshotPath = path.resolve('..', '..', '..', '..', '.gemini', 'antigravity', 'brain', 'dbfbe3c4-f47c-4a50-8b68-9da2e6e518ca', 'artifacts', 'dashboard-preview.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to ${screenshotPath}`);

  await browser.close();
})();
