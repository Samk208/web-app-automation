/**
 * Test script to verify diagram generation is working
 * Run with: node scripts/test-diagram-integration.js
 */

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) { console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDiagrams() {
    console.log('🧪 Testing diagram integration...\n')

    // 1. Check if diagrams column exists
    const { data: plans, error } = await supabase
        .from('business_plans')
        .select('id, diagrams, status')
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('❌ Database error:', error.message)
        return
    }

    console.log(`✅ Found ${plans.length} recent business plans\n`)

    plans.forEach((plan, i) => {
        console.log(`Plan ${i + 1}: ${plan.id}`)
        console.log(`  Status: ${plan.status}`)
        console.log(`  Diagrams: ${plan.diagrams ? JSON.stringify(plan.diagrams, null, 2) : 'null'}`)
        console.log('')
    })

    // 2. Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets()
    const diagramBucket = buckets?.find(b => b.name === 'diagrams')

    if (diagramBucket) {
        console.log('✅ Diagrams bucket exists')
        console.log(`  Public: ${diagramBucket.public}`)

        // List files in bucket
        const { data: files } = await supabase.storage.from('diagrams').list()
        console.log(`  Files: ${files?.length || 0}`)
    } else {
        console.log('❌ Diagrams bucket not found!')
    }
}

testDiagrams().catch(console.error)
