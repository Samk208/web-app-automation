// Check if storage buckets exist
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    console.log('🪣 Checking Supabase Storage Buckets...\n');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('❌ Error listing buckets:', error);
        return;
    }

    console.log(`Found ${buckets.length} buckets:\n`);

    const requiredBuckets = ['business-plans', 'proposals', 'diagrams'];

    for (const bucketName of requiredBuckets) {
        const bucket = buckets.find(b => b.id === bucketName);
        if (bucket) {
            console.log(`✅ ${bucketName.padEnd(20)} - EXISTS (public: ${bucket.public})`);
        } else {
            console.log(`❌ ${bucketName.padEnd(20)} - MISSING`);
        }
    }

    console.log('\n📋 All buckets in database:');
    buckets.forEach(b => {
        console.log(`   - ${b.id} (public: ${b.public}, size limit: ${b.file_size_limit || 'unlimited'})`);
    });
}

checkBuckets().catch(console.error);
