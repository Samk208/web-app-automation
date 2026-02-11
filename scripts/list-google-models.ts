
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!key) {
    console.error("No Google API Key found in .env.local");
    process.exit(1);
}

async function listModels() {
    // Manually fetch the list of models using the REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Error listing models:", JSON.stringify(data.error, null, 2));
            return;
        }

        const outputFn = path.resolve(process.cwd(), 'scripts', 'models.log');
        let logContent = "--- Available Google Models ---\n";

        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.name.includes('gemini')) {
                    const line = `- ${m.name} (${m.displayName}) - Supported: ${m.supportedGenerationMethods?.join(', ')}\n`;
                    console.log(line.trim());
                    logContent += line;
                }
            });
        } else {
            console.log("No models returned.");
            logContent += "No models returned.\n";
        }
        fs.writeFileSync(outputFn, logContent, 'utf8');
        console.log(`Written to ${outputFn}`);
    } catch (error: any) {
        console.error("Fetch error:", error.message);
    }
}

listModels();
