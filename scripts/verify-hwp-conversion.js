
const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

try {
    dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
} catch (e) {
    console.error("❌ dotenv config failed:", e.message);
}

// Require after env load
let processBatch;
try {
    processBatch = require("./wonlink-hwp-worker-runner").processBatch;
} catch (e) {
    console.error("❌ require runner failed:", e);
    process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key

console.log(`CloudConvert Key Present: ${!!process.env.CLOUD_CONVERT_API_KEY}`);
if (process.env.CLOUD_CONVERT_API_KEY) {
    console.log(`CloudConvert Key Length: ${process.env.CLOUD_CONVERT_API_KEY.length}`);
} else {
    console.error("WARNING: CLOUD_CONVERT_API_KEY is missing in env");
}

if (!url || !key) {
    console.error("❌ Missing env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    process.exit(1);
}

const supabase = createClient(url, key);

async function verify() {
    console.log("🚀 Starting HWP Conversion Verification...");

    // 1. Create a dummy job with a valid DOCX url
    // using a public sample DOCX if possible, or a placeholder if we trust the cloudconvert import/url handles it.
    // CloudConvert 'import/url' needs a publicly accessible URL.
    // I'll use a sample docx from a stable source or a previous upload if available.
    // For now, I'll use a standard accessible sample.
    const sampleDocxUrl = "https://filesamples.com/samples/document/docx/sample1.docx";

    console.log(`Creating test job with file: ${sampleDocxUrl}`);
    const { data: job, error } = await supabase.from('hwp_jobs').insert({
        status: 'QUEUED',
        file_url: sampleDocxUrl,
        retry_at: new Date().toISOString(),
        organization_id: null // anon
    }).select().single();

    if (error) {
        console.error("❌ Failed to create test job:", error);
        process.exit(1);
    }

    console.log(`✅ Test Job Created: ${job.id}`);

    // 2. Run the worker batch
    console.log("🏃 Running worker batch...");
    const summary = await processBatch();

    // 3. Check results
    console.log("📊 Runner Summary:", summary);

    if (summary.succeeded > 0) {
        console.log("✅ Worker reported success. Verifying DB record...");
        const { data: updatedJob } = await supabase.from('hwp_jobs').select('*').eq('id', job.id).single();

        if (updatedJob.status === 'COMPLETED' && updatedJob.output_url) {
            console.log(`🎉 SUCCESS! Job completed.`);
            console.log(`📂 Output URL: ${updatedJob.output_url}`);
            console.log("Make sure to manually check if the link works.");
        } else {
            console.error("❌ Job not updated correctly in DB:", updatedJob);
        }
    } else {
        console.error("❌ Worker did not succeed processing the job.");
        // Check DLQ if failed
        const { data: dlq } = await supabase.from('hwp_job_dlq').select('*').eq('job_id', job.id);
        if (dlq && dlq.length > 0) {
            console.error("❌ Job went to DLQ:", dlq);
        }
    }
}

verify().catch(err => {
    console.error("❌ Unexpected error caught in main:");
    if (err.message) console.error("Message:", err.message);
    if (err.hint) console.error("Hint:", err.hint);
    if (err.details) console.error("Details:", err.details);
    if (err.code) console.error("Code:", err.code);
    console.error("Stack:", err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : "No stack");
    process.exit(1);
});
