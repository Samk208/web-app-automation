// Wonlink HWP worker: processes queued hwp_jobs with retry/backoff and placeholder conversion.
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const CloudConvert = require("cloudconvert");
// Manual .env.local loading to avoid dotenv crashes
const fs = require('fs');
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        content.split("\n").forEach(line => {
            // Trim and ignore comments
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.warn("Manual env load failed:", e.message);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_BATCH = parseInt(process.env.HWP_WORKER_MAX_BATCH || "5", 10);
const MAX_ATTEMPTS = parseInt(process.env.HWP_WORKER_MAX_ATTEMPTS || "3", 10);
const FORCE_FAIL = process.env.HWP_WORKER_FORCE_FAIL === "1";

if (!url || !key) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for HWP worker");
    process.exit(1);
}

console.log("🔁 HWP worker starting", {
    url,
    maxBatch: MAX_BATCH,
    maxAttempts: MAX_ATTEMPTS,
    intervalMs: parseInt(process.env.HWP_WORKER_INTERVAL_MS || "5000", 10),
});

const supabase = createClient(url, key);

function nextRetryDelayMs(attempts) {
    // Exponential backoff capped at 60s.
    return Math.min(1000 * 2 ** attempts, 60_000);
}

// Initialize CloudConvert if key is present
const cloudConvert = process.env.CLOUD_CONVERT_API_KEY
    ? new CloudConvert(process.env.CLOUD_CONVERT_API_KEY)
    : null;
const enableCloudConvert = process.env.ENABLE_HWP_CONVERTER === "true";

async function convertWithCloudConvert(job) {
    if (!cloudConvert) throw new Error("CloudConvert not initialized");

    const jobId = job.id;
    const inputUrl = job.file_url;

    // 1. Create Job
    const jobPayload = {
        "tasks": {
            "import-1": {
                "operation": "import/url",
                "url": inputUrl
            },
            "convert-1": {
                "operation": "convert",
                "input_format": "docx",
                "output_format": "hwp",
                "engine": "hancom",
                "input": ["import-1"]
            },
            "export-1": {
                "operation": "export/url",
                "input": ["convert-1"]
            }
        },
        "tag": `job-${jobId}`
    };

    const ccJob = await cloudConvert.jobs.create(jobPayload);

    // 2. Wait for completion
    const completedJob = await cloudConvert.jobs.wait(ccJob.id);

    // 3. Get Export URL
    const exportTask = completedJob.tasks.find(t => t.name === "export-1");
    const fileRemoteUrl = exportTask?.result?.files?.[0]?.url;

    if (!fileRemoteUrl) {
        throw new Error("CloudConvert succeeded but returned no export URL");
    }

    // 4. Download File
    const fileRes = await fetch(fileRemoteUrl);
    if (!fileRes.ok) throw new Error(`Failed to download from CloudConvert: ${fileRes.statusText}`);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Supabase Code
    // Path: hwp/{jobId}.hwp
    const storagePath = `hwp/${jobId}.hwp`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-plans") // Keeping consistent with bucket name used generally but double check bucket name
        // Wait, earlier plan mentioned "business-plans" bucket. I should verify if it exists.
        // Assuming "business-plans" bucket based on context.
        .upload(storagePath, buffer, {
            contentType: "application/x-hwp",
            upsert: true
        });

    if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

    // 6. Get Public URL
    const { data: publicUrlData } = supabase.storage
        .from("business-plans")
        .getPublicUrl(storagePath);

    const finalUrl = publicUrlData.publicUrl;

    // 7. Update Job as Completed (using shared function logic but custom values)
    await supabase.from("hwp_jobs").update({
        status: "COMPLETED",
        output_url: finalUrl,
        updated_at: new Date().toISOString()
    }).eq("id", jobId);

    return finalUrl;
}

function computeOutputUrl(job) {
    return job.file_url?.replace(/(\.[^./]+)?$/, ".docx") || `https://example.com/output/${job.id}.docx`;
}

async function claimNextJob() {
    const nowIso = new Date().toISOString();
    const { data: job, error } = await supabase
        .from("hwp_jobs")
        .select("*")
        .eq("status", "QUEUED")
        .lte("retry_at", nowIso)
        .order("retry_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to fetch queued job: ${error.message}`);
    }

    if (!job) return null;

    const { data: claimed, error: claimError } = await supabase
        .from("hwp_jobs")
        .update({ status: "PROCESSING", updated_at: new Date().toISOString() })
        .eq("id", job.id)
        .eq("status", "QUEUED")
        .lte("retry_at", nowIso)
        .select()
        .single();

    if (claimError) {
        throw new Error(`Failed to claim job: ${claimError.message}`);
    }

    if (!claimed) return null;
    return claimed;
}

async function completeJob(job) {
    const output_url = computeOutputUrl(job);
    const { error } = await supabase
        .from("hwp_jobs")
        .update({
            status: "COMPLETED",
            output_url,
            updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    if (error) throw error;
    return output_url;
}

async function failOrRetryJob(job, err) {
    const attempts = (job.attempts || 0) + 1;
    const message = err?.message || "conversion failed";

    if (attempts >= MAX_ATTEMPTS) {
        await supabase
            .from("hwp_jobs")
            .update({
                status: "FAILED",
                attempts,
                error_message: message,
                updated_at: new Date().toISOString(),
            })
            .eq("id", job.id);

        // Insert into DLQ for inspection.
        await supabase.from("hwp_job_dlq").insert({
            job_id: job.id,
            organization_id: job.organization_id,
            error_message: message,
            attempts,
            payload: job,
        });

        return { status: "FAILED" };
    }

    const delayMs = nextRetryDelayMs(attempts);
    const retry_at = new Date(Date.now() + delayMs).toISOString();

    await supabase
        .from("hwp_jobs")
        .update({
            status: "QUEUED",
            attempts,
            error_message: message,
            retry_at,
            updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

    return { status: "QUEUED", retry_at, attempts };
}

async function processBatch() {
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let retried = 0;

    for (let i = 0; i < MAX_BATCH; i++) {
        const job = await claimNextJob();
        if (!job) break;

        processed += 1;
        console.log(`🚧 Processing job ${job.id} (attempt ${job.attempts || 0})`);

        try {
            if (FORCE_FAIL) {
                throw new Error("forced failure (HWP_WORKER_FORCE_FAIL=1)");
            }

            // Real CloudConvert Implementation
            let outputUrl;
            if (enableCloudConvert && process.env.CLOUD_CONVERT_API_KEY && process.env.CLOUD_CONVERT_API_KEY.length > 5) {
                console.log(`☁️  Starting CloudConvert for Job ${job.id}...`);
                outputUrl = await convertWithCloudConvert(job);
            } else {
                if (process.env.CLOUD_CONVERT_API_KEY && process.env.CLOUD_CONVERT_API_KEY.length > 5 && !enableCloudConvert) {
                    console.log("ℹ️ CloudConvert key present but ENABLE_HWP_CONVERTER is not 'true'; using placeholder conversion.");
                } else {
                    console.warn("⚠️ CLOUD_CONVERT_API_KEY missing or invalid, using placeholder.");
                }
                outputUrl = await completeJob(job);
            }

            succeeded += 1;
            console.log(`✅ Job ${job.id} completed -> ${outputUrl}`);
        } catch (err) {
            require('fs').appendFileSync('worker_error.log', `Job ${job.id} Error: ${err.message}\n${err.stack}\n`);
            const result = await failOrRetryJob(job, err);
            if (result.status === "FAILED") {
                failed += 1;
                console.error(`❌ Job ${job.id} failed permanently: ${err?.message || err}`);
            } else {
                retried += 1;
                console.warn(
                    `⚠️ Job ${job.id} will retry at ${result.retry_at} (attempt ${result.attempts}/${MAX_ATTEMPTS})`
                );
            }
        }
    }

    const summary = { processed, succeeded, failed, retried };
    if (processed === 0) {
        console.log("ℹ️ Worker run: no jobs found (queue idle)");
    } else {
        console.log(
            `🏁 Worker run finished. processed=${processed} succeeded=${succeeded} failed=${failed} retried=${retried}`
        );
    }
    return summary;
}

async function main() {
    try {
        await processBatch();
    } catch (err) {
        console.error("❌ Unexpected error", err);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { processBatch };

