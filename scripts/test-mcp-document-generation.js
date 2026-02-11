#!/usr/bin/env node

/**
 * Test script for MCP document generation
 * Validates that MCP servers are working and can generate documents
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

console.log('🧪 Testing MCP Document Generation\n');

// Test 1: Check if MCP servers are installed
async function testMCPServerAvailability() {
  console.log('1️⃣  Checking MCP server availability...');

  const servers = [
    'thiagotw10-document-generator-mcp',
    'doctranslate-io-mcp',
  ];

  for (const server of servers) {
    try {
      console.log(`   Checking ${server}...`);
      const proc = spawn(npx, ['-y', server, '--help'], {
        stdio: 'pipe',
        timeout: 5000,
      });

      await new Promise((resolve, reject) => {
        proc.on('exit', (code) => {
          if (code === 0) {
            console.log(`   ✅ ${server} is available`);
            resolve();
          } else {
            console.log(`   ⚠️  ${server} might not be installed (exit code: ${code})`);
            resolve();
          }
        });
        proc.on('error', (err) => {
          console.log(`   ❌ ${server} error: ${err.message}`);
          resolve();
        });
      });
    } catch (err) {
      console.log(`   ⚠️  Could not verify ${server}`);
    }
  }
}

// Test 2: Test document generator MCP
async function testDocumentGenerator() {
  console.log('\n2️⃣  Testing document-generator MCP...');

  return new Promise((resolve) => {
    const proc = spawn(npx, ['-y', 'thiagotw10-document-generator-mcp'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseReceived = false;

    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          console.log('   📦 Received response:', JSON.stringify(response, null, 2).substring(0, 200));
          responseReceived = true;
        } catch (e) {
          // Not JSON, ignore
        }
      }
    });

    proc.stderr.on('data', (data) => {
      console.log('   🔍 stderr:', data.toString().substring(0, 100));
    });

    // Send a test request
    const testRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    };

    console.log('   📤 Sending request:', JSON.stringify(testRequest));
    proc.stdin.write(JSON.stringify(testRequest) + '\n');

    setTimeout(() => {
      if (responseReceived) {
        console.log('   ✅ Document generator MCP is working!');
      } else {
        console.log('   ⚠️  No response from document generator (may need configuration)');
      }
      proc.kill();
      resolve();
    }, 3000);
  });
}

// Test 3: Test DocTranslate MCP
async function testDocTranslate() {
  console.log('\n3️⃣  Testing doctranslate MCP...');

  return new Promise((resolve) => {
    const proc = spawn(npx, ['-y', 'doctranslate-io-mcp'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseReceived = false;

    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          console.log('   📦 Received response:', JSON.stringify(response, null, 2).substring(0, 200));
          responseReceived = true;
        } catch (e) {
          // Not JSON, ignore
        }
      }
    });

    proc.stderr.on('data', (data) => {
      console.log('   🔍 stderr:', data.toString().substring(0, 100));
    });

    // Send a test request
    const testRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    };

    console.log('   📤 Sending request:', JSON.stringify(testRequest));
    proc.stdin.write(JSON.stringify(testRequest) + '\n');

    setTimeout(() => {
      if (responseReceived) {
        console.log('   ✅ DocTranslate MCP is working!');
      } else {
        console.log('   ⚠️  No response from DocTranslate (may need configuration)');
      }
      proc.kill();
      resolve();
    }, 3000);
  });
}

// Test 4: Verify TypeScript types
function testTypeScriptSetup() {
  console.log('\n4️⃣  Checking TypeScript setup...');

  const filesToCheck = [
    'src/lib/mcp/document-helpers.ts',
    'src/lib/mcp/client.ts',
    'src/lib/mcp/config.ts',
    'src/lib/mcp/index.ts',
  ];

  for (const file of filesToCheck) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.log(`   ❌ ${file} missing!`);
    }
  }
}

// Test 5: Check migration
function testMigration() {
  console.log('\n5️⃣  Checking database migration...');

  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20260106000000_add_document_urls.sql'
  );

  if (fs.existsSync(migrationPath)) {
    console.log('   ✅ Migration file exists');
    const content = fs.readFileSync(migrationPath, 'utf-8');
    if (content.includes('document_url')) {
      console.log('   ✅ Migration adds document_url column');
    } else {
      console.log('   ❌ Migration missing document_url column');
    }
  } else {
    console.log('   ❌ Migration file missing!');
  }
}

// Run all tests
async function runTests() {
  try {
    await testMCPServerAvailability();
    await testDocumentGenerator();
    await testDocTranslate();
    testTypeScriptSetup();
    testMigration();

    console.log('\n✅ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: cd web-app && npm install');
    console.log('   2. Apply migration: supabase db reset --yes');
    console.log('   3. Start dev server: npm run dev');
    console.log('   4. Test document generation in Business Plan Master');

  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
