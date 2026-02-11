const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
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
            process.env[key] = value;
        }
    });
} catch (e) { }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (url) console.log(`URL: ${url}`);
if (key) console.log(`KEY: ${key.substring(0, 5)}... (len ${key.length})`);

if (!url || !key) {
    console.error("❌ Missing env vars");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testQueue() {
    console.log(`🔑 Key used (len): ${key?.length}`);

    // 1. Create a job directly
    const { data: jobs, error } = await supabase.from('hwp_jobs').insert({
        status: 'QUEUED',
        file_url: 'https://filesamples.com/samples/document/docx/sample1.docx',
        organization_id: '00000000-0000-0000-0000-000000000002'
    }).select();

    if (error) {
        console.error("❌ Failed to create job:", error);
        return;
    }
    const job = jobs?.[0];
    if (!job) {
        console.error("❌ Insert successful but no data returned.");
        return;
    }
    console.log(`✅ Job created: ${job.id} [${job.status}]`);

    // 2. Simulate the Server Action (Status PENDING -> QUEUED)
    // In the real app, the UI creates PENDING, then calls the action which sets QUEUED.
    // Or the action creates it. The code I verified assumes job exists (created by UI or upload).
    // The action: await supabase.from("hwp_jobs").update({ status: "QUEUED", ... }).eq("id", jobId)

    console.log("🔄 calling logic equivalent to processHwpJob (enqueue)...");
    const { error: updateError } = await supabase.from("hwp_jobs").update({
        status: "QUEUED",
        retry_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }).eq("id", job.id);

    if (updateError) {
        console.error("❌ Failed to enqueue:", updateError);
        return;
    }
    console.log(`✅ Job enqueued: ${job.id} [QUEUED]`);
    console.log("⏳ Now run the worker to process it!");
}

testQueue();
