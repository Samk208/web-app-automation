
/**
 * Pre-built Korean business plan diagram templates
 */

/**
 * Standard Korean Government Business Plan Templates
 */
export const KOREAN_BIZPLAN_DIAGRAMS = {

    /**
     * Market Entry Strategy Template (시장 진입 전략)
     */
    marketEntry: {
        mermaid: `
flowchart LR
  A[목표 고객<br/>파악] --> B[파트너십<br/>구축]
  B --> C[시범 사업<br/>실시]
  C --> D{성과<br/>검증}
  D -->|성공| E[대량 생산<br/>준비]
  D -->|개선 필요| C
  E --> F[유통 채널<br/>확보]
  F --> G[전국 확대]
  
  classDef start fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
  classDef process fill:#fff,stroke:#0066cc,stroke-width:2px
  classDef decision fill:#fff7e6,stroke:#ff9800,stroke-width:2px
  classDef end fill:#4da6ff,color:#fff,stroke:#0066cc,stroke-width:2px
  
  class A start
  class B,C,E,F process
  class D decision
  class G end
    `,
        description: '표준 시장 진입 프로세스'
    },

    /**
     * Product Development Roadmap (제품 개발 로드맵)
     */
    developmentRoadmap: {
        mermaid: `
gantt
  title 제품 개발 및 상용화 로드맵
  dateFormat YYYY-MM-DD
  axisFormat %Y-%m
  
  section MVP 개발
  기획 및 설계       :2026-01-01, 30d
  핵심 기능 개발     :2026-02-01, 60d
  베타 테스트        :2026-04-01, 30d
  
  section 상용화
  정식 출시 준비     :2026-05-01, 30d
  마케팅 캠페인      :2026-06-01, 60d
  초기 고객 확보     :2026-08-01, 60d
  
  section 확장
  기능 고도화        :2026-10-01, 90d
  파트너십 구축      :2027-01-01, 60d
  전국 확대          :2027-03-01, 90d
    `,
        description: '표준 제품 개발 일정'
    },

    /**
     * Funding Timeline (자금 조달 계획)
     */
    fundingTimeline: {
        mermaid: `
timeline
  title 자금 조달 및 투자 유치 계획
  2026 Q1 : 정부지원금 신청 (예비창업패키지)
          : 엔젤 투자 접촉 시작
  2026 Q2 : 정부지원금 수령 (₩1억)
          : 엔젤 투자 유치 (₩3억)
  2026 Q3 : 초기 매출 발생
          : 운영자금 확보
  2026 Q4 : Series A 준비
          : VC 미팅 시작
  2027 Q2 : Series A 유치 (₩20억)
          : 팀 확장 및 마케팅 강화
  2028 Q1 : Series B 준비
          : 글로벌 진출 계획
    `,
        description: '표준 투자 유치 타임라인'
    },

    /**
     * Team Organization Chart (조직 구성도)
     */
    teamStructure: {
        mermaid: `
flowchart TB
  CEO[대표이사<br/>CEO]
  
  CTO[기술이사<br/>CTO]
  CMO[마케팅이사<br/>CMO]
  CFO[재무이사<br/>CFO]
  
  DEV1[백엔드 개발자]
  DEV2[프론트엔드 개발자]
  DEV3[데이터 분석가]
  
  MKT1[마케팅 매니저]
  MKT2[콘텐츠 기획자]
  
  FIN1[회계 담당자]
  
  CEO --> CTO
  CEO --> CMO
  CEO --> CFO
  
  CTO --> DEV1
  CTO --> DEV2
  CTO --> DEV3
  
  CMO --> MKT1
  CMO --> MKT2
  
  CFO --> FIN1
  
  classDef ceo fill:#4da6ff,color:#fff,stroke:#0066cc,stroke-width:3px
  classDef exec fill:#a8d8ff,stroke:#0066cc,stroke-width:2px
  classDef staff fill:#e1f5ff,stroke:#0066cc,stroke-width:1px
  
  class CEO ceo
  class CTO,CMO,CFO exec
  class DEV1,DEV2,DEV3,MKT1,MKT2,FIN1 staff
    `,
        description: '표준 조직 구조'
    },

    /**
     * User Journey (사용자 여정)
     */
    userJourney: {
        mermaid: `
journey
  title 사용자 여정 지도 (User Journey Map)
  section 인지 (Awareness)
    광고 접촉: 3: 사용자
    웹사이트 방문: 4: 사용자
    가입 결정: 3: 사용자
  section 가입 (Signup)
    정보 입력: 4: 사용자
    이메일 인증: 3: 사용자
    프로필 설정: 5: 사용자
  section 사용 (Usage)
    첫 기능 사용: 5: 사용자
    추가 기능 탐색: 4: 사용자
    문제 해결: 3: 사용자, 고객지원
  section 충성 (Loyalty)
    정기 사용: 5: 사용자
    추천 및 공유: 4: 사용자
    유료 전환: 5: 사용자
    `,
        description: '표준 사용자 여정'
    }
}

/**
 * Get template by name
 */
export function getKoreanDiagramTemplate(
    name: keyof typeof KOREAN_BIZPLAN_DIAGRAMS
): { mermaid: string; description: string } {
    return KOREAN_BIZPLAN_DIAGRAMS[name]
}

/**
 * Customize template with user data
 */
export function customizeTemplate(
    templateName: keyof typeof KOREAN_BIZPLAN_DIAGRAMS,
    replacements: Record<string, string>
): string {

    let template = KOREAN_BIZPLAN_DIAGRAMS[templateName].mermaid

    // Replace placeholders
    Object.entries(replacements).forEach(([key, value]) => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    return template
}
