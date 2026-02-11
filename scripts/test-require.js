const path = require("path");
try {
    console.log("Requiring dotenv...");
    const dotenv = require("dotenv");
    console.log("Configuring dotenv...");
    const result = dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
    if (result.error) {
        console.error("Dotenv reported error:", result.error);
    } else {
        console.log("Dotenv config success. Parsed:", Object.keys(result.parsed || {}));
    }

    console.log("Requiring cloudconvert...");
    const CloudConvert = require("cloudconvert");
    console.log("Require success!");
} catch (err) {
    console.error("Require failed:", err);
}
