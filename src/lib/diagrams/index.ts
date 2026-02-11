
/**
 * Main exports for diagram generation system
 */

import type { PSSTSection } from '@/lib/bizplan/psst-generator'
import { generateBudgetChart, generateRevenueChart } from './chart-generator'
import { generateFundingTimeline, generateGanttChart, generateOrgChart, generateServiceFlow } from './mermaid-generator'
import { uploadDiagramBatch } from './storage'

export interface DiagramSet {
    serviceFlow: string
    developmentRoadmap: string
    fundingTimeline: string
    orgChart: string
    revenueProjection: string
    budgetBreakdown: string
}

/**
 * Generate complete set of diagrams for Korean PSST business plan
 */
export async function generatePSSTDiagrams(
    psst: PSSTSection,
    metadata: {
        organizationId: string
        planId: string
        client?: any
    }
): Promise<DiagramSet> {

    console.log('🎨 Generating diagrams for PSST business plan...')

    try {
        // 1. Service Flow (서비스 흐름도)
        const serviceFlowResult = await generateServiceFlow([
            { id: 'A', label: '사용자 등록', type: 'start' },
            { id: 'B', label: '프로필 설정', type: 'process', next: ['C'] },
            { id: 'C', label: '서비스 선택', type: 'decision', next: ['D', 'E'] },
            { id: 'D', label: 'AI 분석', type: 'process', next: ['F'] },
            { id: 'E', label: '전문가 상담', type: 'process', next: ['F'] },
            { id: 'F', label: '결과 확인', type: 'process', next: ['G'] },
            { id: 'G', label: '다운로드/공유', type: 'end' }
        ])

        // 2. Development Roadmap (개발 로드맵)
        const roadmapResult = await generateGanttChart({
            title: '제품 개발 및 시장 진입 로드맵',
            sections: [
                {
                    name: 'MVP 개발',
                    tasks: [
                        { name: '기획 및 설계', start: '2026-01-01', duration: '30d', status: 'done' },
                        { name: '핵심 기능 개발', start: '2026-02-01', duration: '60d', status: 'active' },
                        { name: '베타 테스트', start: '2026-04-01', duration: '30d' }
                    ]
                },
                {
                    name: '상용화',
                    tasks: [
                        { name: '정식 출시', start: '2026-05-01', duration: '60d' },
                        { name: '마케팅 캠페인', start: '2026-07-01', duration: '90d' }
                    ]
                },
                {
                    name: '확장',
                    tasks: [
                        { name: '파트너십 구축', start: '2026-10-01', duration: '60d' },
                        { name: '전국 확대', start: '2027-01-01', duration: '90d' }
                    ]
                }
            ]
        })

        // 3. Funding Timeline (자금 조달 계획)
        const fundingResult = await generateFundingTimeline([
            {
                period: '2026 Q1',
                events: ['정부지원금 신청', '엔젤 투자 접촉']
            },
            {
                period: '2026 Q2',
                events: ['정부지원금 수령 (₩1억)', '엔젤 투자 유치 (₩3억)']
            },
            {
                period: '2026 Q4',
                events: ['Series A 준비', 'VC 미팅']
            },
            {
                period: '2027 Q2',
                events: ['Series A 유치 (₩20억)']
            }
        ])

        // 4. Organization Chart (조직 구성도)
        const orgChartResult = await generateOrgChart({
            ceo: '홍길동 (대표이사)',
            departments: [
                {
                    head: '기술이사 (CTO)',
                    members: ['백엔드 개발자', '프론트엔드 개발자', '데이터 분석가']
                },
                {
                    head: '마케팅이사 (CMO)',
                    members: ['마케팅 매니저', '콘텐츠 기획자']
                },
                {
                    head: '재무이사 (CFO)',
                    members: ['회계 담당자']
                }
            ]
        })

        // 5. Revenue Projection (매출 전망)
        const revenueBuffer = await generateRevenueChart([
            { year: 2026, revenue: 100000000, profit: 10000000 },
            { year: 2027, revenue: 150000000, profit: 20000000 },
            { year: 2028, revenue: 250000000, profit: 60000000 }
        ])

        // 6. Budget Breakdown (사업비 집행)
        const budgetBuffer = await generateBudgetChart([
            { category: '외주용역비', amount: 50000000 },
            { category: '재료비', amount: 30000000 },
            { category: '마케팅비', amount: 20000000 },
            { category: '인건비', amount: 40000000 },
            { category: '지식재산권비', amount: 10000000 }
        ])

        // Upload all diagrams to Supabase
        console.log('📤 Uploading diagrams to Supabase...')

        const urls = await uploadDiagramBatch(
            [
                { buffer: serviceFlowResult.pngBuffer, type: 'service-flow', format: 'png' },
                { buffer: roadmapResult.pngBuffer, type: 'development-roadmap', format: 'png' },
                { buffer: fundingResult.pngBuffer, type: 'funding-timeline', format: 'png' },
                { buffer: orgChartResult.pngBuffer, type: 'org-chart', format: 'png' },
                { buffer: revenueBuffer, type: 'revenue-projection', format: 'png' },
                { buffer: budgetBuffer, type: 'budget-breakdown', format: 'png' }
            ],
            metadata,
            metadata.client
        )

        console.log('✅ All diagrams generated successfully!')

        return {
            serviceFlow: urls['service-flow'],
            developmentRoadmap: urls['development-roadmap'],
            fundingTimeline: urls['funding-timeline'],
            orgChart: urls['org-chart'],
            revenueProjection: urls['revenue-projection'],
            budgetBreakdown: urls['budget-breakdown']
        }

    } catch (error) {
        console.error('❌ Diagram generation failed:', error)
        throw error
    }
}

// Re-export utilities
export { getKoreanDiagramTemplate } from './korean-templates'
export { cleanupOldDiagrams, uploadDiagram } from './storage'
export { generateBudgetChart, generateFundingTimeline, generateGanttChart, generateRevenueChart, generateServiceFlow }

