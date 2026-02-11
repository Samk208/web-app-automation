/**
 * Test Script: Production Mode Blocking
 *
 * Verifies that agents with mock data properly block in production mode
 *
 * Usage:
 *   NODE_ENV=production node scripts/test-production-blocking.js
 *   NODE_ENV=development node scripts/test-production-blocking.js
 *   ALLOW_MOCK_DATA=true NODE_ENV=production node scripts/test-production-blocking.js
 */

// Simulate different environments
function testFeatureFlags(env, allowMock) {
  // Set environment
  process.env.NODE_ENV = env;
  if (allowMock !== undefined) {
    process.env.ALLOW_MOCK_DATA = allowMock;
  } else {
    delete process.env.ALLOW_MOCK_DATA;
  }

  // Clear module cache to reload feature-flags
  delete require.cache[require.resolve('../src/lib/feature-flags.ts')];

  const {
    isDevelopment,
    isProduction,
    allowMockData,
    requireRealIntegrations,
    ensureMockDataAllowed,
    MockDataNotAllowedError
  } = require('../src/lib/feature-flags.ts');

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Environment: ${env}`);
  console.log(`ALLOW_MOCK_DATA: ${process.env.ALLOW_MOCK_DATA || 'not set'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`isDevelopment(): ${isDevelopment()}`);
  console.log(`isProduction(): ${isProduction()}`);
  console.log(`allowMockData(): ${allowMockData()}`);
  console.log(`requireRealIntegrations(): ${requireRealIntegrations()}`);

  // Test all agents with mock data
  const agentsToTest = [
    {
      agent: 'sourcing',
      feature: '1688.com scraping',
      integration: 'Playwright + Bright Data proxies'
    },
    {
      agent: 'naver-seo',
      feature: 'SEO audit and crawling',
      integration: 'Lighthouse + DataForSEO API'
    },
    {
      agent: 'grant-scout',
      feature: 'government programs database',
      integration: 'K-Startup.go.kr scraper'
    },
    {
      agent: 'k-startup',
      feature: 'government programs database',
      integration: 'K-Startup.go.kr scraper'
    }
  ];

  console.log(`\n📋 Testing ${agentsToTest.length} agents with mock data:\n`);

  agentsToTest.forEach(({ agent, feature, integration }) => {
    try {
      ensureMockDataAllowed(agent, feature, integration);
      console.log(`✅ ${agent}: Mock data ALLOWED`);
    } catch (error) {
      if (error instanceof MockDataNotAllowedError) {
        console.log(`❌ ${agent}: Mock data BLOCKED`);
        console.log(`   Error: ${error.message.split('\n')[0]}`);
      } else {
        console.log(`⚠️  ${agent}: Unexpected error - ${error.message}`);
      }
    }
  });
}

// Run tests
console.log('\n🧪 Production Mode Blocking Test Suite\n');
console.log('=' .repeat(50));

// Test 1: Development mode (should allow)
testFeatureFlags('development');

// Test 2: Production mode (should block)
testFeatureFlags('production');

// Test 3: Production with explicit opt-in (should allow)
testFeatureFlags('production', 'true');

// Test 4: Production with explicit opt-out (should block)
testFeatureFlags('production', 'false');

console.log('\n' + '='.repeat(50));
console.log('\n✅ Test suite complete!\n');

// Expected results summary
console.log('📊 Expected Results:');
console.log('  Development: All agents should ALLOW mock data');
console.log('  Production (default): All agents should BLOCK mock data');
console.log('  Production (ALLOW_MOCK_DATA=true): All agents should ALLOW');
console.log('  Production (ALLOW_MOCK_DATA=false): All agents should BLOCK');
console.log('');
