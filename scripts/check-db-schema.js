// Script to verify database schema and migration status
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n');

  // Check critical tables
  const tablesToCheck = [
    'organizations',
    'business_plans',
    'proposals',
    'sourcing_tasks',
    'localizations',
    'reconciliation_jobs',
    'safety_logs',
    'grant_applications',
    'startup_programs',
    'hwp_jobs',
    'ai_usage_logs',
    'workflow_states',
    'messages',
    'knowledge_base',
    'organization_members'
  ];

  console.log('📊 Checking Tables:');
  console.log('='.repeat(60));

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table.padEnd(25)} - TABLE DOES NOT EXIST`);
        } else {
          console.log(`⚠️  ${table.padEnd(25)} - Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table.padEnd(25)} - Exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`⚠️  ${table.padEnd(25)} - Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));

  // Check for specific columns added by migrations
  console.log('\n📋 Checking Migration-Specific Columns:');
  console.log('='.repeat(60));

  const columnChecks = [
    { table: 'organizations', column: 'subscription_tier', migration: '20260106020000' },
    { table: 'business_plans', column: 'document_url', migration: '20260106000000' },
    { table: 'proposals', column: 'document_url', migration: '20260106000000' },
    { table: 'proposals', column: 'stripe_price_id', migration: 'TBD' },
    { table: 'hwp_jobs', column: 'retry_at', migration: '20260105020000' },
    { table: 'hwp_jobs', column: 'attempts', migration: '20260105020000' },
    { table: 'localizations', column: 'organization_id', migration: '20260107000002' },
    { table: 'reconciliation_jobs', column: 'organization_id', migration: '20260107000003' },
  ];

  for (const check of columnChecks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.column)
        .limit(0);

      if (error) {
        console.log(`❌ ${check.table}.${check.column.padEnd(20)} - Missing (${check.migration})`);
      } else {
        console.log(`✅ ${check.table}.${check.column.padEnd(20)} - Present (${check.migration})`);
      }
    } catch (err) {
      console.log(`❌ ${check.table}.${check.column.padEnd(20)} - Error checking`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Schema Check Complete!\n');
}

checkSchema().catch(console.error);
