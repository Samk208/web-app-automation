
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '../.env.local');
const outPath = path.join(__dirname, 'models_verified.txt');

try {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Simple parser
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[key] = value;
        }
    });

    const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY || env.GEMINI_API_KEY;

    if (!apiKey) {
        fs.writeFileSync(outPath, "ERROR: No API Key found");
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.error) {
                    fs.writeFileSync(outPath, "API ERROR: " + JSON.stringify(json.error));
                } else {
                    const lines = json.models.map(m => m.name).join('\n');
                    fs.writeFileSync(outPath, lines);
                    console.log("Written to models_verified.txt");
                }
            } catch (e) {
                fs.writeFileSync(outPath, "PARSE ERROR: " + data);
            }
        });
    }).on('error', (err) => {
        fs.writeFileSync(outPath, "REQUEST ERROR: " + err.message);
    });

} catch (err) {
    fs.writeFileSync(outPath, "FILE ERROR: " + err.message);
}
