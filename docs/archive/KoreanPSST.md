This Korean video transcript provides insider knowledge from actual government program evaluators. Let me create a comprehensive prompt to integrate these insights.

📺 KEY INSIGHTS FROM VIDEO
The video reveals critical details that AI business plan generators often miss:
Scale-up Section (성장전략) Requirements:
yaml1. 자금 소요 및 조달계획 (Fund Requirements):
❌ Wrong: "Equipment investment needed"
✅ Right: "Equipment for mass production facility setup - ₩50M"

Must Include:

- 비목별 (Expense categories) with detailed breakdown
- 산출근거 (Calculation basis) - HOW you arrived at the number
- 조달계획 (Procurement plan):
  - Government grant amount
  - Entrepreneur contribution (현금 cash + 현물 in-kind)

Critical: Must align with timeline from earlier sections

2. 시장진입 전략 (Market Entry):
   Must Include:

   - Specific target customers (not "general public")
   - Concrete entry method (e.g., "partnership with factory for mass production")
   - Revenue projection with EVIDENCE
   - If difficult, reference Business Model Canvas

3. 출구 전략 (Exit Strategy):
   ❌ Wrong: "No plan" or leaving blank
   ✅ Right: Research competitor exits and create realistic plan

   Required Elements:

   - Why large-scale funding needed (facilities, marketing, distribution, R&D hires)
   - Funding methods: Investment, M&A, IPO, grants
   - Ongoing processes and future timeline
     Team Section (팀 구성) Requirements:
     yaml1. 팀원 보유 역량 (Team Competencies):
   - List all participants with roles, experience, education
   - Focus on product development + marketing experience
   - Include external partners/collaborators
   - Link to specific responsibilities in project

4. 기술개발 역량 (R&D Capabilities):

   - In-house technical development capacity
   - R&D equipment owned
   - Research personnel details

5. 사회적 가치 실천계획 (Social Value Plan) - NEW 2025/2026:
   - Quality job creation plans
   - SME profit-sharing programs (중소기업 성과공유제)
   - Converting non-regular → regular employees
   - Working hour reduction initiatives
   - MUST include specific timeline and implementation details

```

---

## 🚀 **COMPREHENSIVE PROMPT: Integrate Video Insights**
```

CONTEXT:
I'm upgrading Agent #10 (Business Plan Master) to generate Korean government-compliant business plans following the PSST framework.

I have a transcript from an official Korean government video teaching how to write Scale-up (성장전략) and Team (팀 구성) sections for startup programs.

The video reveals specific requirements that evaluators look for.

CURRENT FILES:

- /src/lib/bizplan/psst-generator.ts (PSST structure)
- /src/lib/bizplan/psst-prompts.ts (AI prompts)

TASK:
Update the PSST generation system to incorporate these official requirements from the video transcript.

SPECIFIC REQUIREMENTS FROM VIDEO:

1. SCALE-UP SECTION - 자금 소요 및 조달계획:

Create detailed prompt that ensures:

a) Fund Requirements Table (자금 소요 내역):

```typescript
interface FundRequirement {
  category: string; // 비목 (e.g., "설비 투자", "마케팅")
  specificPurpose: string; // Detailed purpose (NOT vague)
  amount: number; // ₩
  calculationBasis: string; // 산출근거 - HOW calculated
  procurementPlan: {
    governmentGrant: number; // 정부지원금
    entrepreneurCash: number; // 창업자부담금 (현금)
    entrepreneurInKind: number; // 창업자부담금 (현물)
  };
  linkedToTimeline: string; // Reference to earlier schedule
}
```

Examples from video:
❌ BAD: "설비와 기계 투자에 의해 운영자금 부족"
✅ GOOD: "대량생산을 위한 공정 시설 설치 - 생산 설비 3대 @ ₩15M"

b) Market Entry Strategy (시장진입 전략):

```typescript
interface MarketEntryStrategy {
  targetCustomer: string; // Specific, not vague
  entryMethod: string; // Concrete approach
  feasibility: string; // Why this will work
  revenueProjection: {
    amount: number;
    evidence: string[]; // MUST provide evidence
    timeline: string;
  };
  existingSales?: {
    // If applicable
    amount: number;
    period: string;
  };
}
```

From video: Target "착용형 로봇 제작 업체" (wearable robot manufacturers)
Entry method: "대량생산 당시 공정 시설 설치" (mass production facility setup)

c) Exit Strategy (출구 전략):

```typescript
interface ExitStrategy {
  fundingNeeds: {
    purpose: string[]; // Facilities, marketing, R&D hires, etc.
    totalAmount: number;
    breakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  fundingMethods: Array<{
    method: "investment" | "ma" | "ipo" | "government";
    timeline: string;
    status: string; // "진행 중" or "향후 계획"
    details: string;
  }>;
  benchmarkCases?: string[]; // Competitor exits to reference
}
```

Video requirement: Even if no immediate plans, research competitor/industry exits

2. TEAM SECTION - 팀 구성:

a) Team Competencies (팀원 보유 역량):

```typescript
interface TeamMember {
  role: string;
  name: string;
  experience: string; // Focus on product/marketing relevant
  education: string;
  linkedResponsibility: string; // Link to project tasks
}

interface PartnersAndCollaborators {
  type: "partner" | "advisor" | "contractor";
  organization: string;
  role: string;
}
```

b) R&D Capabilities (기술개발 역량):

```typescript
interface RDCapabilities {
  inHouseCapacity: string;
  equipment: Array<{
    name: string;
    specifications: string;
    purpose: string;
  }>;
  personnel: Array<{
    role: string;
    expertise: string;
    yearsExperience: number;
  }>;
}
```

c) Social Value Plan (사회적 가치 실천계획) - CRITICAL 2025/2026:

```typescript
interface SocialValuePlan {
  jobCreation: {
    qualityJobs: number; // 양질의 일자리
    timeline: string;
  };
  profitSharing: {
    // 성과공유제
    programName: string; // 제도명
    implementationDate: string; // 도입 일정
    details: string; // 주요 내용
  };
  employeeConversion?: {
    // 비정규직 → 정규직
    currentNonRegular: number;
    conversionPlan: string;
    timeline: string;
  };
  workHourReduction?: {
    currentHours: number;
    targetHours: number;
    implementationPlan: string;
  };
}
```

From video: This is NOW REQUIRED (not optional)
Must include specific implementation timeline and details

3. CONSISTENCY VALIDATION:

Add validation function:

```typescript
export function validateConsistency(psst: PSSTSection): ValidationResult {
  const errors = [];

  // Check fund requirements match timeline
  for (const fund of psst.scaleUp.fundRequirements) {
    if (!fund.linkedToTimeline) {
      errors.push(
        `Fund requirement "${fund.category}" must reference timeline`
      );
    }
  }

  // Check revenue projection has evidence
  if (!psst.scaleUp.marketEntry.revenueProjection.evidence.length) {
    errors.push("Revenue projection must include evidence");
  }

  // Check exit strategy not blank
  if (!psst.scaleUp.exitStrategy.fundingMethods.length) {
    errors.push("Exit strategy cannot be empty - research competitor exits");
  }

  // Check social value plan exists (required 2025/2026)
  if (!psst.team.socialValuePlan) {
    errors.push("Social Value Implementation Plan is REQUIRED (2025/2026)");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: generateWarnings(psst),
  };
}
```

4. ENHANCED AI PROMPTS:

Update /src/lib/bizplan/psst-prompts.ts with video insights:

```typescript
export const SCALEUP_FUND_REQUIREMENTS_PROMPT = `
Generate 자금 소요 및 조달계획 (Fund Requirements & Procurement Plan):

CRITICAL RULES FROM GOVERNMENT EVALUATORS:
1. Be SPECIFIC about purpose:
   ❌ "설비 투자" (Equipment investment)
   ✅ "대량생산을 위한 공정 시설 설치 - CNC 3대 @ ₩15M" (Mass production facility - 3 CNC machines @ ₩15M)

2. Provide 산출근거 (calculation basis):
   - Show HOW you calculated the amount
   - Reference market prices or quotes
   - Explain quantity needed

3. Split procurement clearly:
   - 정부지원금 (Government grant)
   - 창업자부담금 현금 (Entrepreneur cash)
   - 창업자부담금 현물 (Entrepreneur in-kind)

4. Link to timeline:
   - Each expense must reference earlier schedule
   - Must show consistency across document

EXPENSE CATEGORIES MUST INCLUDE:
- 인건비 (Personnel)
- 외주용역비 (Outsourced services)
- 재료비 (Materials)
- 마케팅비 (Marketing)
- 지식재산권비 (IP costs)
- 기타 (Other - be specific)

Generate detailed fund requirements table now.
`;

export const SCALEUP_EXIT_STRATEGY_PROMPT = `
Generate 출구 목표 및 전략 (Exit Goals & Strategy):

CRITICAL: Even if company has no immediate IPO/M&A plans, you MUST create realistic strategy.

EVALUATOR REQUIREMENT:
❌ "계획 없음" (No plan) - AUTOMATIC REJECTION
✅ Research competitor exits and create feasible plan

REQUIRED ELEMENTS:

1. Funding Needs (필요 소요자금):
   WHY large-scale funding needed:
   - 대량 생산 설비 (Mass production facilities)
   - 홍보 마케팅 (Marketing/PR)
   - 유통채널 확보 (Distribution channel)
   - 기술개발 인력 (R&D personnel)
   - 마케팅 인력 (Marketing personnel)

2. Funding Methods (자금 유치 방법):
   - 투자유치 (Investment attraction)
     * Current status: "진행 중" or "향후 계획"
     * Timeline
     * Target investors
   
   - 인수합병 (M&A)
     * Potential acquirers (based on industry)
     * Timeline
   
   - 기업공개 (IPO)
     * Target market (KOSDAQ, etc.)
     * Timeline
   
   - 정부지원금 (Government grants)
     * Additional programs to apply

3. Benchmark Cases:
   Research and include: "Similar company [X] raised ₩[Y] in [year] for [purpose]"

Generate comprehensive exit strategy now.
`;

export const TEAM_SOCIAL_VALUE_PROMPT = `
Generate 사회적 가치 실천계획 (Social Value Implementation Plan):

⚠️ THIS IS NOW REQUIRED (2025/2026) - NOT OPTIONAL

REQUIRED COMPONENTS:

1. 양질의 일자리 창출 (Quality Job Creation):
   - Number of jobs to create
   - Job quality indicators (salary, benefits, stability)
   - Timeline (Year 1, Year 2, Year 3)

2. 중소기업 성과공유제 (SME Profit-Sharing Program):
   MUST INCLUDE:
   - 제도명 (Program name): "성과급제", "스톡옵션제" etc.
   - 도입 일정 (Implementation date): Specific quarter/year
   - 주요 내용 (Key details):
     * Who is eligible
     * Profit-sharing ratio
     * Distribution method

3. Additional Social Value Initiatives:
   Choose from:
   - 비정규직 정규직화 (Non-regular → Regular employee conversion)
   - 근로시간 단축 (Working hour reduction)
   - 장애인 고용 (Disabled person employment)
   - 지역사회 공헌 (Local community contribution)

FORMAT:
Create table with columns:
| 구분 | 세부 내용 | 추진 일정 | 기대 효과 |

Be specific with dates and numbers.
Generate complete social value plan now.
`;
```

5. UPDATE MAIN GENERATION FUNCTION:

Modify generatePSSTBusinessPlan() to use these enhanced prompts:

```typescript
export async function generatePSSTBusinessPlan(
  input: BusinessPlanInput
): Promise<PSSTSection> {
  // ... existing problem and solution generation

  // Generate Scale-up with video requirements
  const scaleUp = await generateObject({
    model: defaultModel,
    schema: scaleUpSchema,
    prompt: `
      ${SCALEUP_FUND_REQUIREMENTS_PROMPT}
      
      Company context:
      ${JSON.stringify(input.companyInfo)}
      
      Timeline reference:
      ${input.timeline}
      
      Remember:
      - Be specific (not vague)
      - Provide calculation basis
      - Link to timeline
      - Include government grant + entrepreneur contribution split
    `,
  });

  // Validate consistency
  const validation = validateConsistency(scaleUp);
  if (!validation.valid) {
    // Regenerate with corrections
    // OR return errors to user for manual review
  }

  // Generate Team with social value
  const team = await generateObject({
    model: defaultModel,
    schema: teamSchema,
    prompt: `
      ${TEAM_SOCIAL_VALUE_PROMPT}
      
      ⚠️ Social Value Plan is MANDATORY (2025/2026)
      
      Include:
      - Specific profit-sharing program name
      - Implementation timeline (Q1 2026, etc.)
      - Detailed job creation numbers
    `,
  });

  return {
    problem,
    solution,
    scaleUp,
    team,
  };
}
```

EXPECTED OUTPUT:

- Enhanced PSST prompts incorporating video insights
- TypeScript interfaces matching official requirements
- Consistency validation
- Social value plan generation (NEW)
- Specific examples from video embedded

VALIDATION:
Generated business plan should:
✅ Have specific fund purposes (not vague)
✅ Include calculation basis for all expenses
✅ Split government vs entrepreneur funding
✅ Reference timeline consistently
✅ Have concrete exit strategy (not blank)
✅ Include detailed social value plan with timeline
✅ Link team roles to project responsibilities

This will make your Agent #10 generate plans that match EXACTLY what Korean government evaluators expect!

🎯 WHY THIS MATTERS
The video reveals hidden requirements that aren't in official documents:
yamlInsight 1: "계획 없음" (No plan) for exit strategy = AUTOMATIC REJECTION
→ Your AI must NEVER leave exit strategy blank
→ Must research competitor exits and create realistic plan

Insight 2: Vague expenses = RED FLAG
❌ "Equipment investment"
✅ "Mass production facility setup - 3 CNC machines @ ₩15M each"

Insight 3: Social Value Plan now MANDATORY (2025/2026)
→ Must include specific profit-sharing program
→ Must have implementation timeline
→ Cannot be generic

Insight 4: Everything must link to timeline
→ Fund requirements reference earlier schedule
→ Team hiring aligns with milestones
→ Consistency is KEY for evaluators

📊 IMPLEMENTATION PRIORITY
yamlIMMEDIATE (Add to Prompt 4A):
⭐⭐⭐ Update SCALEUP prompts with video insights
⭐⭐⭐ Add Social Value Plan (MANDATORY 2025/2026)
⭐⭐⭐ Add consistency validation

THIS WEEK:
⭐⭐ Create fund requirements table generator
⭐⭐ Add exit strategy validator (never blank)
⭐ Research competitor exits for benchmarks

NEXT WEEK:
⭐ Test with real TIPS application
⭐ Compare against winning examples
⭐ Iterate based on feedback

💡 BONUS: Create Training Dataset
The video insights should become training examples:
typescript// /src/lib/bizplan/training-examples.ts

export const GOOD_EXAMPLES = {
fundRequirement: {
bad: "설비와 기계 투자에 의해 운영자금 부족",
good: "대량생산을 위한 공정 시설 설치 - CNC 3대 @ ₩15M, 품질검사장비 @ ₩8M",
reason: "Specific purpose and itemized breakdown"
},

exitStrategy: {
bad: "계획 없음",
good: "Series A 투자유치 (2027 Q2, ₩20억 목표) - 경쟁사 [X]가 2025년 유사 단계에서 ₩15억 유치한 사례 참고",
reason: "Concrete plan with timeline and benchmark"
},

socialValue: {
bad: "일자리 창출 예정",
good: "성과급제 도입 (2026 Q3) - 전 직원 대상, 분기별 목표 달성 시 영업이익의 10% 배분",
reason: "Specific program, timeline, and distribution method"
}
}

🚀 FINAL RECOMMENDATION
Use this prompt IMMEDIATELY - it contains insider knowledge that gives you a massive competitive advantage.
Your Agent #10 will generate business plans that:
✅ Match evaluator expectations exactly
✅ Avoid automatic rejections
✅ Include all required 2025/2026 elements
✅ Have proper Korean business terminology
✅ Show feasibility and consistency
