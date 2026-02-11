// Setup test organization and user membership
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestData() {
    console.log('🔧 Setting up test organization and membership...\n');

    // Get the current user
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users || users.length === 0) {
        console.error('❌ No users found. Please create a user first.');
        return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.email} (${user.id})\n`);

    // Check if organization exists
    let orgId = '00000000-0000-0000-0000-000000000002';
    const { data: existingOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

    if (!existingOrg) {
        console.log('📦 Creating test organization...');

        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                id: orgId,
                name: 'WonLink Test Organization',
                slug: 'wonlink-test'
            })
            .select()
            .single();

        if (orgError) {
            console.error('❌ Failed to create organization:', orgError);
            return;
        }

        console.log(`✅ Organization created: ${newOrg.name} (${newOrg.id})\n`);
    } else {
        console.log(`✅ Organization already exists: ${existingOrg.name} (${existingOrg.id})\n`);
    }

    // Check if membership exists
    const { data: existingMembership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .single();

    if (!existingMembership) {
        console.log('👥 Creating membership...');

        const { data: membership, error: memberError } = await supabase
            .from('memberships')
            .insert({
                user_id: user.id,
                organization_id: orgId,
                role: 'owner'
            })
            .select()
            .single();

        if (memberError) {
            console.error('❌ Failed to create membership:', memberError);
            return;
        }

        console.log(`✅ Membership created: ${user.email} → ${orgId} (owner)\n`);
    } else {
        console.log(`✅ Membership already exists: ${user.email} → ${orgId} (${existingMembership.role})\n`);
    }

    // Verify the setup
    console.log('✅ Verifying setup...\n');

    const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id);

    if (membership && membership.length > 0) {
        console.log('✅ User has', membership.length, 'membership(s)');
        console.log('✅ RLS policies will now allow storage uploads!');
        console.log('\n🎉 Setup complete! You can now test the Business Plan Master.\n');
    } else {
        console.log('❌ Verification failed. Membership not found.');
    }
}

setupTestData().catch(console.error);
