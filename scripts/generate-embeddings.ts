import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'
import { generateEmbedding } from "../src/lib/ai/embeddings"

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backfillEmbeddings() {
    console.log("🚀 Starting Embedding Backfill...")

    // 1. Fetch all programs without embeddings
    const { data: programs, error } = await supabase
        .from('startup_programs')
        .select('id, name, category, description')
    // .is('embedding', null) // Optional: only fetch missing

    if (error) {
        console.error("Fetch error:", error)
        return
    }

    console.log(`Found ${programs.length} programs to process`)

    for (const prog of programs) {
        const textToEmbed = `Program: ${prog.name}\nCategory: ${prog.category}\nDescription: ${prog.description || ""}`
        console.log(`Embedding: ${prog.name}...`)

        try {
            const vector = await generateEmbedding(textToEmbed)

            const { error: updateError } = await supabase
                .from('startup_programs')
                .update({ embedding: vector }) // Cast to string if needed, but JS client handles array -> vector
                .eq('id', prog.id)

            if (updateError) {
                console.error(`Failed to update ${prog.name}:`, updateError)
            }
        } catch (err) {
            console.error(`Failed to generate embedding for ${prog.name}:`, err)
        }
    }

    console.log("✅ Backfill Complete")
}

backfillEmbeddings().catch(console.error)
