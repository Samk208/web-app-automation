const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Minimal env loader (mirrors test-hwp-enqueue.js)
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
} catch (e) {
  console.warn("⚠️ Failed to load .env.local:", e.message);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seedKStartup2026() {
  console.log("🚀 Seeding K-Startup 2026 demo programs into startup_programs...");

  const rows = [
    {
      name: "TIPS (Tech Incubator Program for Startup) – Deep Tech 2026",
      category: "R&D",
      funding_amount: "Up to 700M KRW (Matching + Follow-on)",
      deadline: "2026-12-31",
    },
    {
      name: "K-Startup Grand Challenge 2026",
      category: "Global",
      funding_amount: "Equity-free support + settlement grants",
      deadline: "2026-08-31",
    },
    {
      name: "OASIS Visa & Incubation 2026",
      category: "Visa",
      funding_amount: "OASIS points + office incubation",
      deadline: "2026-12-31",
    },
    {
      name: "Pre-Startup Package 2026 – Foreign Founders",
      category: "Commercialization",
      funding_amount: "Approx. 50M KRW",
      deadline: "2026-04-30",
    },
    {
      name: "Korea AI Voucher Program 2026",
      category: "AI",
      funding_amount: "Up to 160M KRW in vouchers",
      deadline: "2026-05-31",
    },
    {
      name: "Smart Factory PoC 2026",
      category: "Manufacturing",
      funding_amount: "PoC funding up to 300M KRW",
      deadline: "2026-06-30",
    },
    {
      name: "Global Market Expansion Package 2026",
      category: "Global",
      funding_amount: "Export marketing support up to 200M KRW",
      deadline: "2026-09-30",
    },
    {
      name: "Bio/Healthcare TIPS Track 2026",
      category: "BioHealth",
      funding_amount: "R&D support up to 1B KRW",
      deadline: "2026-11-30",
    },
    {
      name: "Green Energy Startup Fund 2026",
      category: "Green",
      funding_amount: "Seed funding + pilot projects",
      deadline: "2026-07-31",
    },
    {
      name: "Regional Deep Tech Incubator 2026",
      category: "Regional",
      funding_amount: "Office, mentorship, and grants up to 100M KRW",
      deadline: "2026-10-31",
    },
  ];

  const { error } = await supabase.from("startup_programs").insert(rows, { upsert: true });

  if (error) {
    console.error("❌ Failed to seed startup_programs:", error);
    process.exit(1);
  }

  console.log("✅ Seeded", rows.length, "startup_programs rows for 2026 demos.");
}

seedKStartup2026().catch((err) => {
  console.error("❌ Unexpected error while seeding:", err);
  process.exit(1);
});
