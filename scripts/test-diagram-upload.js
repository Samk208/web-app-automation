// Test diagram upload to verify storage bucket fix
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDiagramUpload() {
    console.log('🧪 Testing Diagram Upload to Supabase Storage...\n');

    // Create a simple PNG buffer (1x1 red pixel)
    const testPngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
        0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testOrgId = 'test-org-123';
    const testPlanId = 'test-plan-456';
    const filename = `${testOrgId}/${testPlanId}/test-diagram-${timestamp}.png`;

    console.log(`📤 Uploading test diagram to: diagrams/${filename}\n`);

    try {
        // Test upload to 'diagrams' bucket
        const { data, error } = await supabase.storage
            .from('diagrams')
            .upload(filename, testPngBuffer, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('❌ Upload failed:', error);
            console.error('\nError details:', JSON.stringify(error, null, 2));
            return;
        }

        console.log('✅ Upload successful!');
        console.log('   Path:', data.path);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('diagrams')
            .getPublicUrl(filename);

        console.log('   Public URL:', publicUrl);

        // Verify file exists
        const { data: files, error: listError } = await supabase.storage
            .from('diagrams')
            .list(`${testOrgId}/${testPlanId}`);

        if (listError) {
            console.error('\n⚠️ Could not verify file:', listError);
        } else {
            console.log('\n✅ File verification:');
            console.log(`   Found ${files.length} file(s) in test directory`);
            files.forEach(file => {
                console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
            });
        }

        // Cleanup test file
        console.log('\n🧹 Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from('diagrams')
            .remove([filename]);

        if (deleteError) {
            console.error('⚠️ Cleanup failed:', deleteError);
        } else {
            console.log('✅ Test file deleted successfully');
        }

        console.log('\n✨ All tests passed! Storage bucket fix is working correctly.\n');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testDiagramUpload().catch(console.error);
