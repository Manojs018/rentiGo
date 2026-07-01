import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

  // Resolve screenshot path dynamically
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  let screenshotPath = '';
  
  let conversationId = '';
  if (process.env.ANTIGRAVITY_SOURCE_METADATA) {
    try {
      const metadata = JSON.parse(process.env.ANTIGRAVITY_SOURCE_METADATA);
      conversationId = metadata.tool?.conversationId || '';
    } catch (e) {
      // ignore
    }
  }

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  if (conversationId && userProfile) {
    // Check if running within the agent environment and determine if we should write to the agent's artifacts
    for (const appFolderName of ['antigravity-ide', 'antigravity']) {
      const brainDir = path.join(userProfile, '.gemini', appFolderName, 'brain', conversationId);
      if (fs.existsSync(brainDir)) {
        const artifactsDir = path.join(brainDir, 'artifacts');
        if (!fs.existsSync(artifactsDir)) {
          fs.mkdirSync(artifactsDir, { recursive: true });
        }
        screenshotPath = path.join(artifactsDir, 'dashboard_preview.png');
        break;
      }
    }
  }

  // Fallback: save to a local screenshots directory in the workspace
  if (!screenshotPath) {
    const localScreenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(localScreenshotsDir)) {
      fs.mkdirSync(localScreenshotsDir, { recursive: true });
    }
    screenshotPath = path.join(localScreenshotsDir, 'dashboard_preview.png');
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to ${screenshotPath}`);

  await browser.close();
})();
