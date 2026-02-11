// Check if test user has organization membership
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMemberships() {
    console.log('👥 Checking User Memberships...\n');

    // Check all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('❌ Failed to list users:', usersError);
        return;
    }

    console.log(`Found ${users.users.length} user(s):\n`);

    for (const user of users.users) {
        console.log(`📧 User: ${user.email || 'No email'}`);
        console.log(`   ID: ${user.id}`);

        // Check memberships for this user
        const { data: memberships, error: membError } = await supabase
            .from('memberships')
            .select('*')
            .eq('user_id', user.id);

        if (membError) {
            console.log(`   ❌ Error fetching memberships:`, membError.message);
        } else if (!memberships || memberships.length === 0) {
            console.log(`   ⚠️  NO MEMBERSHIPS FOUND - This is the problem!`);
            console.log(`   → User cannot upload files (RLS policies require membership)`);
        } else {
            console.log(`   ✅ Memberships: ${memberships.length}`);
            memberships.forEach(m => {
                console.log(`      - Org: ${m.organization_id}, Role: ${m.role}`);
            });
        }
        console.log();
    }

    // Check all organizations
    console.log('🏢 Checking Organizations...\n');
    const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*');

    if (orgsError) {
        console.error('❌ Failed to list organizations:', orgsError);
        return;
    }

    console.log(`Found ${orgs.length} organization(s):\n`);
    orgs.forEach(org => {
        console.log(`   - ${org.name} (${org.id})`);
    });

    // Check all memberships
    console.log('\n👥 All Memberships:\n');
    const { data: allMemberships, error: allMembError } = await supabase
        .from('memberships')
        .select('*');

    if (allMembError) {
        console.error('❌ Failed to list memberships:', allMembError);
        return;
    }

    if (allMemberships.length === 0) {
        console.log('   ⚠️  NO MEMBERSHIPS IN DATABASE!');
        console.log('\n   🔧 FIX REQUIRED:');
        console.log('   You need to create a membership record linking your user to an organization.');
        console.log('\n   Run this SQL in Supabase Studio or psql:');
        console.log('\n   INSERT INTO memberships (user_id, organization_id, role)');
        console.log('   VALUES (');
        console.log(`     '${users.users[0]?.id || 'YOUR_USER_ID'}',`);
        console.log(`     '${orgs[0]?.id || '00000000-0000-0000-0000-000000000002'}',`);
        console.log(`     'owner'`);
        console.log('   );');
    } else {
        console.log(`   Found ${allMemberships.length} membership(s):\n`);
        allMemberships.forEach(m => {
            console.log(`   - User ${m.user_id.substring(0, 8)}... → Org ${m.organization_id.substring(0, 8)}... (${m.role})`);
        });
    }
}

checkMemberships().catch(console.error);
