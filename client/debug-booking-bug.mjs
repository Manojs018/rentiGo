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

  // Log API requests made to /vehicles
  page.on('request', request => {
    if (request.url().includes('/api/vehicles')) {
      console.log('API REQUEST:', request.method(), request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/vehicles')) {
      console.log('API RESPONSE:', response.status(), response.url());
    }
  });

  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('load');

    console.log('Filling out Quick Booking form on homepage...');
    await page.fill('input[placeholder="Rahul Sharma"]', 'Test User');
    await page.fill('input[placeholder="+91 98765 43210"]', '9999999999');

    // Set Pickup and Return dates
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const formatDateTimeLocal = (date) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const pickupInput = page.locator('input[type="datetime-local"]').first();
    const returnInput = page.locator('input[type="datetime-local"]').nth(1);
    
    await pickupInput.fill(formatDateTimeLocal(tomorrow));
    await returnInput.fill(formatDateTimeLocal(dayAfter));

    // Select "Surat" on the Home page form
    console.log('Selecting City: Surat on homepage...');
    await page.selectOption('select:has-text("Ahmedabad")', 'Surat');

    // Submit and navigate
    console.log('Submitting form...');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button:has-text("Confirm Booking")')
    ]);

    console.log('Arrived at Booking Page. Current URL:', page.url());
    await page.waitForTimeout(2000);

    const activeCityText1 = await page.locator('button.bg-orange-500').first().innerText();
    console.log('Selected City on Booking Page:', activeCityText1.trim());

    const vehiclesSurat = await page.locator('h3.text-white').allTextContents();
    console.log('Vehicles listed for Surat:', vehiclesSurat.filter(v => !['Quick Links', 'Partner Program', 'Contact Us'].includes(v)));

    // Test manual city switch to "Vadodara" on the booking page
    console.log('Manually clicking city: Vadodara on the Booking page...');
    await page.click('button:has-text("Vadodara")');
    await page.waitForTimeout(2000);

    const activeCityText2 = await page.locator('button.bg-orange-500').first().innerText();
    console.log('New Selected City on Booking Page:', activeCityText2.trim());

    const vehiclesVadodara = await page.locator('h3.text-white').allTextContents();
    console.log('Vehicles listed for Vadodara:', vehiclesVadodara.filter(v => !['Quick Links', 'Partner Program', 'Contact Us'].includes(v)));

  } catch (err) {
    console.error('Error occurred during Playwright test:', err);
  } finally {
    await browser.close();
  }
})();
