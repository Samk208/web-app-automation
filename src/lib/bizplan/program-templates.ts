

export interface ProgramTemplate {
    programName: string;
    year: number;
    maxPages: number;
    requiredSections: string[];
    emphasisAreas: string[];
    budgetCategories: Record<string, { max?: number; description: string }>;
    evaluationCriteria: Record<string, number>;
}

// 2026 Pre-startup Package Template
const PRE_STARTUP_2026: ProgramTemplate = {
    programName: '예비창업패키지 2026',
    year: 2026,
    maxPages: 15,
    requiredSections: ['problem', 'solution', 'scaleUp', 'team', 'esg'],
    emphasisAreas: [
        'Problem Validation (Customer Verification)',
        'MVP Feasibility',
        'Social Value Creation'
    ],
    budgetCategories: {
        '외주용역비': { max: 50000000, description: 'Outsourced development' },
        '재료비': { max: 30000000, description: 'Materials' },
        '마케팅비': { max: 20000000, description: 'Marketing' },
        '지식재산권비': { max: 10000000, description: 'IP costs' }
    },
    evaluationCriteria: {
        'Problem Recognition': 30,
        'Feasibility': 30,
        'Scale-up Strategy': 20,
        'Team Competency': 20
    }
};

// 2026 TIPS Template (Tech emphasis)
const TIPS_2026: ProgramTemplate = {
    programName: 'TIPS (Tech Incubator Program for Startup) 2026',
    year: 2026,
    maxPages: 20,
    requiredSections: ['problem', 'solution', 'scaleUp', 'team', 'global', 'exit'],
    emphasisAreas: [
        'Deep Tech / R&D Capabilities',
        'Global Market Expansion',
        'Exit Strategy (IPO/M&A)',
        'Technical Differentiation (Patents)'
    ],
    budgetCategories: {
        '인건비 (R&D)': { description: 'Researcher salaries' },
        '연구활동비': { description: 'Research activities' },
        '연구재료비': { description: 'Lab materials' },
        '위탁연구개발비': { description: 'Outsourced R&D' }
    },
    evaluationCriteria: {
        'Technical Capability': 40,
        'Market Potential': 30,
        'Global Strategy': 20,
        'Team & Exit': 10
    }
};

const TEMPLATES: Record<string, ProgramTemplate> = {
    'pre-startup': PRE_STARTUP_2026,
    'early-startup': { ...PRE_STARTUP_2026, programName: '초기창업패키지 2026', emphasisAreas: ['Revenue Growth', 'Market Expansion'] },
    'tips': TIPS_2026
};

// Simplified loader (in-memory for now, could be JSON files)
export function getTemplateForProgram(programType: string): ProgramTemplate {
    // Normalize input
    const key = programType.toLowerCase().includes('tips') ? 'tips' :
        programType.toLowerCase().includes('early') ? 'early-startup' : 'pre-startup';

    return TEMPLATES[key] || PRE_STARTUP_2026;
}
