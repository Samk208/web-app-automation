/**
 * Test Script: Playwright Installation Verification
 *
 * Verifies that Playwright and Chromium are correctly installed
 *
 * Usage:
 *   node scripts/test-playwright.js
 */

const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('🧪 Testing Playwright Installation...\n');

  try {
    console.log('✅ Playwright version:', require('playwright/package.json').version);

    console.log('\n📦 Launching Chromium browser...');
    const browser = await chromium.launch({
      headless: true,
      timeout: 30000
    });
    console.log('✅ Chromium launched successfully');

    console.log('\n📄 Creating new page...');
    const page = await browser.newPage();
    console.log('✅ Page created');

    console.log('\n🌐 Navigating to example.com...');
    await page.goto('https://example.com', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ Navigation successful');

    console.log('\n📊 Extracting page data...');
    const data = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      heading: document.querySelector('h1')?.textContent
    }));

    console.log('✅ Data extracted:');
    console.log('   Title:', data.title);
    console.log('   URL:', data.url);
    console.log('   Heading:', data.heading);

    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');

    console.log('\n✅ All tests passed! Playwright is ready to use.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Sign up for Bright Data proxies');
    console.log('   2. Implement 1688 scraper (see PLAYWRIGHT_INSTALLATION.md)');
    console.log('   3. Update sourcing.ts to use real scraper');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   - Run: npx playwright install chromium');
    console.error('   - Check: npx playwright install --with-deps chromium');
    console.error('   - Verify: npm list playwright');
    process.exit(1);
  }
}

// Run test
testPlaywright();
