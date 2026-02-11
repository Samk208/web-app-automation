/**
 * Supabase Admin Client (Service Role)
 * Use ONLY for server-side operations that require bypassing RLS
 * NEVER expose this client to the browser
 */

import { createClient } from '@supabase/supabase-js'

// Fix for Node.js "name resolution failed" with localhost on some systems
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('localhost', '127.0.0.1')

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Admin client with service role key
 * Bypasses RLS - use with caution
 */
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
