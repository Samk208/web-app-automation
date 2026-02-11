
import { createLogger } from '@/lib/logger';

const logger = createLogger({ agent: 'market-data', correlationId: 'korean-market' });

export interface MarketData {
    TAM: number;
    growthRate: number; // percentage
    year: number;
    source: string;
    url: string;
}

export interface CompetitorData {
    name: string;
    website: string;
    strengths: string[];
    limitations: string[];
    marketShare?: string; // e.g. "15%"
}

/**
 * MOCK: Fetches Korean market size from "KOSIS" (Stubbed)
 * In real production, this would call the KOSIS OpenAPI or scrape a report.
 */
export async function getKoreanMarketSize(industry: string, subCategory?: string): Promise<MarketData> {
    logger.info(`Fetching Korean market data for: ${industry} / ${subCategory}`);

    // STUB: Return realistic-looking data based on industry keywords for demo purposes
    const isAI = industry.toLowerCase().includes('ai') || industry.toLowerCase().includes('intelligence');
    const isBio = industry.toLowerCase().includes('bio') || industry.toLowerCase().includes('health');

    if (isAI) {
        return {
            TAM: 2500000000000, // 2.5 Trillion KRW
            growthRate: 35.5,
            year: 2024,
            source: 'KOSIS (Korea Data Agency) - AI Industry Report',
            url: 'https://kosis.kr/statisticsList/statisticsListIndex.do'
        };
    }

    if (isBio) {
        return {
            TAM: 14000000000000, // 14 Trillion KRW
            growthRate: 12.1,
            year: 2024,
            source: 'KOSIS - Biohealth Industry Survey',
            url: 'https://kosis.kr/statisticsList/statisticsListIndex.do'
        };
    }

    // Default fallback
    return {
        TAM: 500000000000, // 500 Billion KRW
        growthRate: 8.5,
        year: 2024,
        source: 'KOSIS - SME Annual Report',
        url: 'https://kosis.kr'
    };
}

/**
 * MOCK: Fetches key competitors from "Naver" (Stubbed)
 */
export async function getKoreanCompetitors(industry: string, productType: string): Promise<CompetitorData[]> {
    logger.info(`Fetching Korean competitors for: ${industry} - ${productType}`);

    // STUB
    return [
        {
            name: 'Local Giant A',
            website: 'https://example.co.kr',
            strengths: ['Brand recognition', 'Offline network'],
            limitations: ['Legacy UI', 'Slow customer support', 'No AI features'],
            marketShare: '45%'
        },
        {
            name: 'Startup Challenger B',
            website: 'https://challenger.co.kr',
            strengths: ['Low price', 'Mobile-first'],
            limitations: ['Limited feature set', 'Unstable server'],
            marketShare: '12%'
        }
    ];
}
