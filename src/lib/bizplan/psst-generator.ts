
import { getModel } from '@/lib/ai/model-provider';
import { createLogger } from '@/lib/logger';
import { cacheMarketData, getCachedMarketData } from '@/lib/market-data/cache';
import { fetchKOSISMarketData } from '@/lib/market-data/korean-market-api';
import { generateObject } from 'ai';
import { z } from 'zod';
import {
    PROBLEM_SECTION_PROMPT,
    PSST_SYSTEM_PROMPT,
    SCALEUP_EXIT_STRATEGY_PROMPT,
    SCALEUP_FUND_REQUIREMENTS_PROMPT,
    SCALEUP_MARKET_ENTRY_PROMPT,
    SOLUTION_SECTION_PROMPT,
    TEAM_COMPETENCY_PROMPT,
    TEAM_SOCIAL_VALUE_PROMPT
} from './psst-prompts';

const logger = createLogger({ agent: 'business-plan-master', correlationId: 'psst-gen' });
const model = getModel('gemini-2.0-flash');

// --- Zod Schemas for Structured Output ---

// 1. Problem
const problemSchema = z.object({
    background: z.object({
        painPoint: z.string(),
        marketTiming: z.string(),
    }),
    targetMarket: z.object({
        customerPersona: z.string(),
        tam: z.coerce.number().describe('Total Addressable Market in KRW (Use 0 if unknown)'),
        sam: z.coerce.number().describe('Serviceable Available Market in KRW'),
        som: z.coerce.number().describe('Serviceable Obtainable Market in KRW (Year 1-3)'),
        cagr: z.string().describe('Compound Annual Growth Rate with %'),
    }),
    competitorAnalysis: z.object({
        competitors: z.array(z.object({
            name: z.string(),
            limitations: z.string(),
        })).describe('List 3 key competitors'),
        differentiation: z.string(),
    }),
});

// 2. Solution
const solutionSchema = z.object({
    productDescription: z.object({
        coreFunctions: z.array(z.string()),
        developmentStage: z.string().describe('Current stage: Idea, MVP, Beta, Pilot, or Growth'),
        techStack: z.string(),
    }),
    differentiation: z.object({
        technological: z.string(),
        cost: z.string(),
        ux: z.string(),
    }),
    developmentPlan: z.object({
        goal: z.string().describe('What will be built during funding period'),
        keyFeatures: z.array(z.string()),
    }),
});

// 3. Scale-up
const scaleUpSchema = z.object({
    marketEntry: z.object({
        acquisitionStrategy: z.string(),
        distributionChannels: z.string(),
        revenueModel: z.string(),
        salesProjection: z.array(z.object({
            year: z.string(),
            amount: z.number().describe('Revenue in KRW'),
        })),
    }),
    fundRequirements: z.array(z.object({
        category: z.string().describe('Cost category (e.g., 인건비, 외주용역비, 재료비)'),
        purpose: z.string(),
        amount: z.coerce.number().describe('Amount in KRW'),
        calculationBasis: z.string().describe('Unit cost x Quantity'),
        source: z.object({
            government: z.coerce.number().describe('Grant request'),
            cash: z.coerce.number().describe('Entrepreneur cash'),
            inKind: z.coerce.number().describe('Entrepreneur in-kind'),
        }),
        timelineRef: z.string().describe('Reference to timeline (e.g. Q3 2026)'),
    })),
    exitStrategy: z.object({
        fundingNeeds: z.array(z.object({
            stage: z.string(), // Seed, Pre-A
            amount: z.number(),
            purpose: z.string(),
        })),
        scenarios: z.array(z.object({
            type: z.string().describe('Type: M&A, IPO, Partnership, etc.'),
            details: z.string(),
            timeline: z.string(),
        })),
    }),
});

// 4. Team
const teamSchema = z.object({
    ceo: z.object({
        name: z.string(),
        experience: z.string(),
        strength: z.string(),
    }),
    coreMembers: z.array(z.object({
        role: z.string(),
        competency: z.string(),
    })),
    socialValue: z.object({
        jobCreation: z.array(z.object({
            year: z.string(),
            count: z.number(),
        })),
        profitSharing: z.object({
            programName: z.string(),
            implementationQtr: z.string(),
            details: z.string(),
        }),
        otherInitiatives: z.string(),
    }),
});

export type PSSTSection = {
    problem: z.infer<typeof problemSchema>;
    solution: z.infer<typeof solutionSchema>;
    scaleUp: z.infer<typeof scaleUpSchema>;
    team: z.infer<typeof teamSchema>;
};

import { ProgramTemplate } from './program-templates';
// Generic types for compatibility (or refactor types if needed)
export type MarketData = {
    TAM: number;
    growthRate: number;
    year: number;
    source: string;
    url?: string;
};
export type CompetitorData = {
    name: string;
    marketShare?: string;
    limitations: string[];
};

export async function generatePSSTBusinessPlan(input: {
    companyInfo: any;
    englishNotes: string;
    template?: ProgramTemplate;
    marketData?: MarketData;
    competitors?: CompetitorData[];
}): Promise<PSSTSection> {
    const context = `
    Company Info: ${JSON.stringify(input.companyInfo)}
    Additional Notes: ${input.englishNotes}
  `;

    // 1. Fetch Real Market Data (Cache -> API -> Fallback)
    let marketData = input.marketData;
    if (!marketData) {
        try {
            // Try cache
            const cached = await getCachedMarketData(input.companyInfo.industry ?? "General");
            if (cached) {
                marketData = cached;
            } else {
                // Fetch fresh
                const fresh = await fetchKOSISMarketData(input.companyInfo.industry ?? "General");
                marketData = fresh;
                // Cache logic
                if (input.companyInfo.industry) {
                    await cacheMarketData(input.companyInfo.industry, fresh);
                }
            }
        } catch (e) {
            console.error("Market Data Fetch Failed", e);
            // Default fallback if everything fails
            marketData = {
                TAM: 100000000000,
                growthRate: 5,
                year: 2024,
                source: "Estimate",
                url: ""
            };
        }
    }

    // Format for Prompt
    const marketContext = `
    REAL MARKET DATA (Source: ${marketData?.source}):
    - Review the following data carefully.
    - TAM: ${marketData?.TAM.toLocaleString()} KRW
    - Growth Rate: ${marketData?.growthRate}%
    - Year: ${marketData?.year}
    - URL: ${marketData?.url}
    
    INSTRUCTION: Use this specific data to substantiate the "Problem" and "Market Size" sections. cite the source.
    `;

    // Dynamic Prompt Enhancement based on Template AND Market Data
    let systemPrompt = PSST_SYSTEM_PROMPT;
    let emphasisInfo = "";

    if (input.template) {
        emphasisInfo = `
       TARGET PROGRAM: ${input.template.programName} (${input.template.year})
       
       CRITICAL EMPHASIS AREAS (Must highlight these):
       ${input.template.emphasisAreas.map(a => `- ${a}`).join('\n')}
       
       BUDGET CONSTRAINTS:
       ${Object.entries(input.template.budgetCategories).map(([k, v]) => `- ${k}: ${v.description} (Max: ${v.max ? '₩' + v.max.toLocaleString() : 'N/A'})`).join('\n')}
     `;

        systemPrompt += `\n\n${emphasisInfo}`;
    }

    // Old mock market logic removed in favor of real data injection above

    let competitorContext = "";
    if (input.competitors) {
        competitorContext = `
      REAL COMPETITOR DATA:
      ${input.competitors.map(c => `- ${c.name} (${c.marketShare || 'N/A'}): ${c.limitations.join(', ')}`).join('\n')}
      
      COMPARE AGAINST THESE SPECIFIC COMPANIES.
      `;
    }

    logger.info(`Starting PSST Generation for ${input.template ? input.template.programName : 'Generic'} with Market Data prop: ${!!input.marketData}`);

    // 1. Generate Problem
    const problem = await generateObject({
        model,
        schema: problemSchema,
        system: systemPrompt,
        prompt: PROBLEM_SECTION_PROMPT + "\n\nCONTEXT:\n" + context + "\n\n" + marketContext + "\n\n" + competitorContext
    });

    // 2. Generate Solution
    const solution = await generateObject({
        model,
        schema: solutionSchema,
        system: systemPrompt,
        prompt: `
      ${SOLUTION_SECTION_PROMPT}
    CONTEXT: ${context}
      Solved Problem: ${problem.object.background.painPoint}
      
      PROGRAM EMPHASIS:
      ${emphasisInfo}
    `,
    });

    // 3. Generate Scale-up (Heavy Logic)
    const scaleUp = await generateObject({
        model,
        schema: scaleUpSchema,
        system: systemPrompt,
        prompt: `
      ${SCALEUP_MARKET_ENTRY_PROMPT}

    ----------------
        ${SCALEUP_FUND_REQUIREMENTS_PROMPT}

    ----------------
        ${SCALEUP_EXIT_STRATEGY_PROMPT}

    CONTEXT: ${context}
      Target Market: ${JSON.stringify(problem.object.targetMarket)}
      
      PROGRAM EMPHASIS:
      ${emphasisInfo}

      MARKET INTELLIGENCE:
      ${marketContext}
    `,
    });

    // 4. Generate Team (Includes Social Value)
    const team = await generateObject({
        model,
        schema: teamSchema,
        system: systemPrompt,
        prompt: `
      ${TEAM_COMPETENCY_PROMPT}

    ----------------
        ${TEAM_SOCIAL_VALUE_PROMPT}

    CONTEXT: ${context}
      
      PROGRAM EMPHASIS:
      ${emphasisInfo}
    `,
    });

    // Validate Consistency (Simple check)
    const validation = validateConsistency({
        problem: problem.object,
        solution: solution.object,
        scaleUp: scaleUp.object,
        team: team.object
    });

    if (!validation.valid) {
        logger.warn('PSST Consistency Validation Failed', { errors: validation.errors });
        // In a full implementation, we might regenerate here.
        // For now, we log and proceed (or could attach warnings).
    }

    return {
        problem: problem.object,
        solution: solution.object,
        scaleUp: scaleUp.object,
        team: team.object,
    };
}

export function validateConsistency(plan: PSSTSection): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Check if Exit Strategy is blank
    if (plan.scaleUp.exitStrategy.scenarios.length === 0) {
        errors.push('Exit strategy scenarios cannot be empty.');
    }

    // 2. Check if Social Value Profit Sharing is specific
    const profitSharing = plan.team.socialValue.profitSharing;
    if (!profitSharing.programName || profitSharing.programName.length < 2) {
        errors.push('Social Value Profit Sharing program name is too vague.');
    }

    // 3. Check Fund Requirements Calculation Basis
    const funds = plan.scaleUp.fundRequirements;
    const invalidFunds = funds.filter(f => !f.calculationBasis || f.calculationBasis.length < 5);
    if (invalidFunds.length > 0) {
        errors.push(`Fund calculation basis missing for ${invalidFunds.length} items.`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
