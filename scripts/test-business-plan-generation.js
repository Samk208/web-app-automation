// Test Business Plan Generation end-to-end
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }

async function testBusinessPlanGeneration() {
    console.log('🧪 Testing Business Plan Generation Workflow...\n');

    // Test with service role (bypasses auth)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test input
    const testInput = `WonLink AI Automation Agency - Bridging Korean SMEs to Government Support

We assist Korean SMEs and startups with AI-powered agentic automation solutions that unlock government funding opportunities.

Our Unique Selling Point:
Unlike generic AI automation tools like Zapier or Make.com, WonLink specializes in the Korean startup ecosystem with 10 specialized AI agents that solve critical pain points Korean businesses face:

1. Business Plan Master - Converts English pitch decks to Korean government-standard business plans
2. Proposal Writer - Generates tailored funding proposals for Korean government programs
3. K-Startup Navigator - Matches startups with eligible government programs

Market Opportunity:
- 650,000+ SMEs in Korea eligible for government support
- ₩15 trillion in annual government funding for startups
- 90% of SMEs struggle with complex Korean documentation requirements

Our Solution:
AI agents that understand both Korean business culture and government requirements, automating the entire application process from research to submission.`;

    console.log('📝 Test Input Length:', testInput.length, 'characters\n');

    try {
        // Step 1: Create business plan record
        console.log('1️⃣ Creating business plan record...');
        const { data: plan, error: insertError } = await supabase
            .from('business_plans')
            .insert({
                input_materials: testInput,
                target_program: 'TIPS (Tech Incubator Program for Startup) 2026',
                status: 'PROCESSING',
                organization_id: '00000000-0000-0000-0000-000000000002' // Test org
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Failed to create business plan:', insertError);
            return;
        }

        console.log('✅ Business plan created:', plan.id);
        console.log('   Status:', plan.status);
        console.log('   Organization:', plan.organization_id);
        console.log();

        // Step 2: Call the server action via API
        console.log('2️⃣ Triggering business plan generation...');
        console.log('   (This would normally be called via Next.js server action)');
        console.log('   Plan ID:', plan.id);
        console.log();

        // Step 3: Monitor plan status
        console.log('3️⃣ Monitoring plan status (checking every 2 seconds)...');

        let attempts = 0;
        const maxAttempts = 30; // 1 minute timeout

        const checkStatus = async () => {
            const { data: updatedPlan } = await supabase
                .from('business_plans')
                .select('*')
                .eq('id', plan.id)
                .single();

            attempts++;
            console.log(`   [${attempts}/${maxAttempts}] Status: ${updatedPlan?.status || 'UNKNOWN'}`);

            if (updatedPlan?.status === 'COMPLETED') {
                console.log('\n✅ Business plan generation COMPLETED!');
                console.log('\n📊 Generated Sections:');

                if (updatedPlan.sections_generated) {
                    const sections = updatedPlan.sections_generated;

                    console.log('\n📄 Problem Section:');
                    if (sections.problem) {
                        console.log('   - Background:', sections.problem.background?.substring(0, 100) + '...');
                        console.log('   - Target Market:', sections.problem.target_market?.substring(0, 100) + '...');
                        console.log('   - Competitor Analysis:', sections.problem.competitor_analysis?.substring(0, 100) + '...');
                    }

                    console.log('\n🔧 Solution Section:');
                    if (sections.solution) {
                        console.log('   - Product/Service:', sections.solution.product_service?.substring(0, 100) + '...');
                        console.log('   - Readiness:', sections.solution.readiness?.substring(0, 100) + '...');
                        console.log('   - Differentiation:', sections.solution.differentiation?.substring(0, 100) + '...');
                    }

                    console.log('\n📈 Scale-up Section:');
                    if (sections.scale_up) {
                        console.log('   - Business Model:', sections.scale_up.business_model?.substring(0, 100) + '...');
                        console.log('   - Market Entry:', sections.scale_up.market_entry?.substring(0, 100) + '...');
                        console.log('   - Funding Plan:', sections.scale_up.funding_plan?.substring(0, 100) + '...');
                    }

                    console.log('\n👥 Team Section:');
                    if (sections.team) {
                        console.log('   - Competency:', sections.team.competency?.substring(0, 100) + '...');
                        console.log('   - Partners:', sections.team.partners?.substring(0, 100) + '...');
                        console.log('   - ESG/Social:', sections.team.esg_social?.substring(0, 100) + '...');
                    }

                    console.log('\n🎨 Diagrams:');
                    if (sections.diagrams) {
                        console.log('   - Service Flow:', sections.diagrams.serviceFlow || 'Not generated');
                        console.log('   - Development Roadmap:', sections.diagrams.developmentRoadmap || 'Not generated');
                        console.log('   - Funding Timeline:', sections.diagrams.fundingTimeline || 'Not generated');
                        console.log('   - Org Chart:', sections.diagrams.orgChart || 'Not generated');
                        console.log('   - Revenue Projection:', sections.diagrams.revenueProjection || 'Not generated');
                        console.log('   - Budget Breakdown:', sections.diagrams.budgetBreakdown || 'Not generated');
                    }
                }

                console.log('\n📦 Document URL:', updatedPlan.document_url || 'Not generated');

                console.log('\n✨ Test completed successfully!');
                return true;
            } else if (updatedPlan?.status === 'FAILED') {
                console.log('\n❌ Business plan generation FAILED');
                console.log('   Check server logs for error details');
                return true;
            } else if (attempts >= maxAttempts) {
                console.log('\n⏱️ Timeout reached. Generation is taking too long.');
                console.log('   Current status:', updatedPlan?.status);
                console.log('   This might be normal for long AI generation tasks.');
                return true;
            }

            return false;
        };

        // Poll every 2 seconds
        const poll = async () => {
            const done = await checkStatus();
            if (!done) {
                setTimeout(poll, 2000);
            }
        };

        // Start polling after a short delay
        setTimeout(poll, 2000);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

console.log('⚠️  IMPORTANT: This test only creates the database record.');
console.log('   You need to manually trigger the server action by:');
console.log('   1. Going to http://localhost:3000/dashboard/business-plan-master');
console.log('   2. Pasting the test content');
console.log('   3. Clicking "Generate HWP Draft"');
console.log('\n   OR run the full generation via API call.\n');

testBusinessPlanGeneration().catch(console.error);
