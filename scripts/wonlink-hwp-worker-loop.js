// Wonlink HWP worker loop: repeatedly runs the worker batch with a delay, suitable for cron/PM2.
const { processBatch } = require("./wonlink-hwp-worker-runner");

const intervalMs = parseInt(process.env.HWP_WORKER_INTERVAL_MS || "5000", 10);
const maxRuns = parseInt(process.env.HWP_WORKER_MAX_RUNS || "0", 10); // 0 = infinite

let runs = 0;
async function loop() {
    while (true) {
        runs += 1;
        const summary = await processBatch();
        console.log(
            `ℹ️ Loop run ${runs}: processed=${summary.processed} succeeded=${summary.succeeded} failed=${summary.failed} retried=${summary.retried}`
        );
        if (maxRuns > 0 && runs >= maxRuns) {
            console.log("ℹ️ Reached max runs; exiting.");
            break;
        }
        await new Promise((res) => setTimeout(res, intervalMs));
    }
}

loop().catch((err) => {
    console.error("❌ Worker loop failed", err);
    process.exit(1);
});

