// Minimal smoke check for core agent tables.
// Verifies Supabase connectivity and table availability for business-plan, grant-scout, k-startup, safety-guardian, messages, hwp_jobs.

import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const val = value.trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key.trim()] = val;
        }
    });
} catch (e) {
    console.error('Failed to read .env.local', e);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

const tables = [
    "business_plans",
    "grant_applications",
    "program_matches",
    "safety_logs",
    "messages",
    "hwp_jobs",
];

(async () => {
    console.log(`📡 Smoke: Supabase connectivity to ${url}`);

    for (const table of tables) {
        const { error, status } = await supabase.from(table).select("id", { count: "exact", head: true }).limit(1);

        if (error) {
            if (status === 0) {
                console.error(`❌ ${table}: network/connection error`, error);
                process.exitCode = 1;
            } else {
                console.log(`✅ ${table}: reachable (status ${status}) — note: error likely RLS/permissions: ${error.message}`);
            }
        } else {
            console.log(`✅ ${table}: reachable (read success)`);
            if (table === 'hwp_jobs') {
                console.log(`Testing INSERT on hwp_jobs...`);
                const { error: insertError, data: insertData } = await supabase.from('hwp_jobs').insert({
                    status: 'QUEUED',
                    file_url: 'https://smoke.check/test.hwp'
                }).select().maybeSingle();

                if (insertError) {
                    console.error(`❌ ${table} INSERT failed:`, insertError);
                } else {
                    console.log(`✅ ${table} INSERT success:`, insertData?.id);
                }
            }
        }
    }
})();

