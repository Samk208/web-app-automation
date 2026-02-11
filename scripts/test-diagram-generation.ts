
/**
 * Test Script for Visual Diagram Generation
 * 
 * Usage: npx tsx scripts/test-diagram-generation.ts
 */

import type { PSSTSection } from '@/lib/bizplan/psst-generator'
import { generatePSSTDiagrams } from '@/lib/diagrams'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runTest() {
    console.log('🚀 Starting Visual Diagram Generation Test...')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('❌ Missing Supabase environment variables')
        process.exit(1)
    }

    // Create Supabase client manually (for script environment)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Mock PSST Data
    const mockPSST: PSSTSection = {
        problem: {
            background: {
                painPoint: "기존 솔루션의 높은 비용과 낮은 정확성",
                marketTiming: "AI 기술 성숙과 시장 수요 급증"
            },
            targetMarket: {
                customerPersona: "30대 직장인",
                tam: 100000000000,
                sam: 50000000000,
                som: 10000000000,
                cagr: "15%"
            },
            competitorAnalysis: {
                competitors: [
                    { name: "CompA", limitations: "High cost" },
                    { name: "CompB", limitations: "Slow speed" }
                ],
                differentiation: "AI-driven automation"
            }
        },
        solution: {
            productDescription: {
                coreFunctions: ["Auto-generation", "Analysis"],
                techStack: "Next.js, Python, GPT-4",
                developmentStage: "MVP"
            },
            developmentPlan: {
                goal: "Launch within 3 months",
                keyFeatures: ["Core AI engine", "User dashboard", "API integration"]
            },
            differentiation: {
                technological: "Patent pending algorithm",
                cost: "50% cheaper",
                ux: "Intuitive interface with minimal learning curve"
            }
        },
        scaleUp: {
            marketEntry: {
                revenueModel: "Subscription",
                salesProjection: [
                    { year: "2026", amount: 100000000 },
                    { year: "2027", amount: 300000000 },
                    { year: "2028", amount: 1000000000 }
                ],
                acquisitionStrategy: "Content marketing",
                distributionChannels: "Direct sales"
            },
            fundRequirements: [
                {
                    category: "외주용역비",
                    amount: 50000000,
                    purpose: "Hire devs",
                    calculationBasis: "₩10M x 5 developers",
                    source: { government: 30000000, cash: 20000000, inKind: 0 },
                    timelineRef: "Q1 2026"
                }
            ],
            exitStrategy: {
                fundingNeeds: [
                    { stage: "Seed", amount: 500000000, purpose: "Product development" }
                ],
                scenarios: [
                    { type: "M&A", details: "Acquisition by major tech company", timeline: "3-5 years" }
                ]
            }
        },
        team: {
            ceo: {
                name: "Hong Gil-dong",
                experience: "10 years in AI",
                strength: "Strong technical background with proven track record"
            },
            coreMembers: [
                { role: "CTO", competency: "Full stack expert" }
            ],
            socialValue: {
                profitSharing: {
                    programName: "Employee Stock Option",
                    implementationQtr: "2026 Q4",
                    details: "10% of equity reserved for employee stock options"
                },
                jobCreation: [
                    { year: "2026", count: 5 }
                ],
                otherInitiatives: "Green office"
            }
        }
    }

    try {
        const result = await generatePSSTDiagrams(mockPSST, {
            organizationId: 'test-org',
            planId: 'test-plan-id',
            client: supabase // PASS CLIENT
        })

        console.log('\n✨ Generation Complete! Result URLs:')
        console.log(JSON.stringify(result, null, 2))

        console.log('\n✅ TEST PASSED')
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error)
    }
}

runTest()
