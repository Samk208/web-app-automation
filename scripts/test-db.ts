import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
    console.error("❌ Missing env vars usage: Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and KEY")
    process.exit(1)
}

const supabase = createClient(url, key)

async function testConnection() {
    console.log(`📡 Connecting to Supabase at: ${url}`)

    // Try to hit the API. Even an RLS error means we connected.
    const { data, error, status } = await supabase.from('organizations').select('*').limit(1)

    if (error) {
        // If status is 0, it's usually a generic network error
        if (status === 0) {
            console.error("❌ Connection Failed. Network Error or Invalid URL.")
            console.error(error)
        } else {
            console.log(`✅ Connection Successful! (API responded with ${status})`)
            console.log(`   Note: Received DB error: "${error.message}" - This is EXPECTED if RLS is enabled and we are anonymous.`)
        }
    } else {
        console.log("✅ Connection Successful! (Read data allowed)")
    }
}

testConnection()
