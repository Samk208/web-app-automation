// Wonlink Kakao webhook harness: sends a signed test payload to the webhook endpoint.
const path = require("path");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const secret = process.env.KAKAO_WEBHOOK_SECRET;
const message = process.argv[2] || "안녕하세요";
const userId = process.argv[3] || "test-user";
const targetUrl = process.argv[4] || "http://localhost:3000/api/kakao/webhook";

if (!secret) {
    console.error("❌ KAKAO_WEBHOOK_SECRET is required to sign the request.");
    process.exit(1);
}

const signature = crypto.createHmac("sha256", secret).digest("hex");

const payload = {
    userRequest: {
        user: { id: userId },
        utterance: message,
    },
};

async function send() {
    const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Kakao-Signature": signature,
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text();
    let parsed = text;
    try {
        parsed = JSON.parse(text);
    } catch {
        // keep raw text
    }

    console.log(`➡️ POST ${targetUrl} (${res.status}) as user=${userId}`);
    console.log(parsed);
}

send().catch((err) => {
    console.error("❌ Request failed", err);
    process.exit(1);
});

