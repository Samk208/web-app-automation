import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env.local parsing to ensure we get the fresh keys
const envPath = path.resolve(process.cwd(), '.env.local');
let env: Record<string, string> = {};

try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.warn('Could not read .env.local, falling back to defaults');
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'] || 'http://localhost:54321';
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedTestData() {
    console.log('🌱 Seeding test data...');
    console.log('Target URL:', SUPABASE_URL);

    try {
        // Create test organization with ID 0000...0002 to match the enqueue script
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Test Organization (Demo)',
                slug: 'test-org-demo'
            })
            .select()
            .single();

        if (orgError) {
            if (orgError.code === '23505') { // Unique violation
                console.log('✅ Organization 000...0002 already exists');
            } else {
                throw orgError;
            }
        } else {
            console.log('✅ Organization created:', org.id);
        }

        console.log('\n✅ Test data seeded successfully!');
        console.log('You can now run: node scripts/test-hwp-enqueue.js');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTestData();
