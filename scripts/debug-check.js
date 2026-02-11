const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

console.log("🔍 Debugger starting...");


try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    console.log(`📂 Env Path: ${envPath}`);

    if (fs.existsSync(envPath)) {
        console.log("✅ .env.local found.");
        const content = fs.readFileSync(envPath, "utf8");
        content.split("\n").forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                // Don't print values, just presence
                // process.env[key] = value; // We don't overwrite real env for this test context usually, but here we populate process.env
                process.env[key] = value;
            }
        });
    } else {
        console.error("❌ .env.local NOT found!");
    }
} catch (e) {
    console.error("❌ Env load error:", e.message);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`URL Present: ${!!url}`);
console.log(`KEY Present: ${!!key}`);

if (url) console.log(`URL Value (partial): ${url.substring(0, 15)}...`);

if (url && key) {
    console.log(`🔌 Supabase URL: ${url}`);
    console.log("🔌 Testing Connectivity via fetch...");

    // Test raw fetch first
    fetch(url).then(res => console.log(`✅ Raw Fetch Status: ${res.status}`)).catch(e => console.error(`❌ Raw Fetch Failed: ${e.message}`));

    console.log("🔌 Testing Supabase SDK...");
    try {
        const supabase = createClient(url, key);
        supabase.from('hwp_jobs').select('count', { count: 'exact', head: true })
            .then(({ count, error }) => {
                if (error) console.error("❌ Supabase Error:", error.message);
                else console.log(`✅ Connection Success! HWP Jobs Count: ${count}`);
            })
            .catch(err => console.error("❌ Client Error:", err.message));
    } catch (err) {
        console.error("❌ Init Error:", err.message);
    }
}
