const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, '../status_v2.json');
const envPath = path.join(__dirname, '../.env.local');

try {
    const statusContent = fs.readFileSync(statusPath, 'utf8');
    const status = JSON.parse(statusContent);

    console.log('Detected Supabase Config:');
    console.log('API URL:', status.API_URL);
    console.log('ANON KEY Length:', status.ANON_KEY ? status.ANON_KEY.length : 0);
    console.log('SERVICE KEY Length:', status.SERVICE_ROLE_KEY ? status.SERVICE_ROLE_KEY.length : 0);

    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Helper to replace or append
    const updateEnv = (key, value) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
            console.log(`Updated ${key}`);
        } else {
            envContent += `\n${key}=${value}`;
            console.log(`Appended ${key}`);
        }
    };

    updateEnv('NEXT_PUBLIC_SUPABASE_URL', status.API_URL);
    updateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', status.ANON_KEY);
    updateEnv('SUPABASE_SERVICE_ROLE_KEY', status.SERVICE_ROLE_KEY);

    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env.local');

} catch (error) {
    console.error('Error updating .env.local:', error);
    process.exit(1);
}
