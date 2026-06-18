import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Log page console messages
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('PAGE LOG:', msg.text());
    }
  });

  try {
    // 1. Log in as admin
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    
    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);

    console.log('Successfully logged in. Current URL:', page.url());

    // 2. Setup Route Interception to delay the analytics API call by 2.5 seconds
    console.log('Setting up API interception to delay analytics by 2.5 seconds...');
    await page.route('**/api/admin/analytics', async route => {
      console.log('API INTERCEPTED: /api/admin/analytics. Simulating slow connection...');
      await new Promise(resolve => setTimeout(resolve, 2500));
      await route.continue();
    });

    // 3. Start navigation asynchronously
    console.log('Navigating to Admin Dashboard (/admin) asynchronously...');
    const navigationPromise = page.goto('http://localhost:5173/admin');

    // Wait for the KPI cards container to mount
    console.log('Waiting for KPI cards to mount...');
    await page.waitForSelector('.glass.card-glow');
    await page.waitForTimeout(300); // Small grace period for React render

    // 4. Immediately check the KPI card values (during loading state)
    console.log('Checking KPI values during loading (should show fallback values)...');
    const kpiValuesLoading = await page.locator('.text-2xl.font-black.text-white').allTextContents();
    console.log('KPI values during loading:', kpiValuesLoading);

    const totalRevenueLoading = kpiValuesLoading[0];
    if (totalRevenueLoading === '₹undefined') {
      console.log('❌ FAIL: Found "₹undefined" rendered during page load!');
    } else if (totalRevenueLoading === '₹0') {
      console.log('✅ SUCCESS: Correctly displayed fallback "₹0" during loading state!');
    } else {
      console.log(`⚠️ Warning: Showed unexpected value during loading: ${totalRevenueLoading}`);
    }

    // 5. Wait for the API response to finish and UI to update
    console.log('Waiting for API response to complete and UI to update...');
    await page.waitForFunction(() => {
      const firstKpi = document.querySelector('.text-2xl.font-black.text-white');
      return firstKpi && firstKpi.textContent !== '₹0';
    }, { timeout: 6000 });

    const kpiValuesLoaded = await page.locator('.text-2xl.font-black.text-white').allTextContents();
    console.log('KPI values after load:', kpiValuesLoaded);

    const totalRevenueLoaded = kpiValuesLoaded[0];
    if (totalRevenueLoaded && totalRevenueLoaded.includes('₹') && !totalRevenueLoaded.includes('undefined') && totalRevenueLoaded !== '₹0') {
      console.log(`✅ SUCCESS: Correctly loaded and formatted final revenue: ${totalRevenueLoaded}`);
    } else {
      console.log(`❌ FAIL: Invalid final loaded revenue: ${totalRevenueLoaded}`);
    }

    await navigationPromise; // Ensure navigation promise finishes cleanly

  } catch (err) {
    console.error('Error occurred during Playwright test:', err);
  } finally {
    await browser.close();
  }
})();
