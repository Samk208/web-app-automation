

/**
 * Mermaid Diagram Types
 */
export type MermaidDiagramType =
    | 'flowchart'
    | 'gantt'
    | 'timeline'
    | 'sequence'
    | 'pie'
    | 'journey'

/**
 * Generate Mermaid diagram URL and download image
 */
export async function generateMermaidDiagram(
    mermaidCode: string
): Promise<{
    pngUrl: string
    svgUrl: string
    pngBuffer: Buffer
    svgBuffer: Buffer
}> {

    // Clean the mermaid code
    const cleanCode = mermaidCode.trim()

    // Use URL-safe base64 encoding (pako is not needed, just use proper encoding)
    const encoded = Buffer.from(cleanCode, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    // Mermaid.ink API endpoints (FREE, no API key)
    const pngUrl = `https://mermaid.ink/img/${encoded}?type=png`
    const svgUrl = `https://mermaid.ink/svg/${encoded}`

    try {
        // Fetch PNG
        const pngResponse = await fetch(pngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (!pngResponse.ok) {
            console.error(`Mermaid.ink PNG failed: ${pngResponse.status} ${pngResponse.statusText}`)
            console.error('Mermaid code:', cleanCode)
            // Return 1x1 transparent PNG placeholder
            return {
                pngUrl: '',
                svgUrl: '',
                pngBuffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
                svgBuffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>')
            }
        }

        const pngBuffer = Buffer.from(await pngResponse.arrayBuffer())

        // Fetch SVG
        const svgResponse = await fetch(svgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        })

        const svgBuffer = !svgResponse.ok
            ? Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>')
            : Buffer.from(await svgResponse.arrayBuffer())

        return {
            pngUrl,
            svgUrl,
            pngBuffer,
            svgBuffer
        }
    } catch (error: any) {
        console.error('Mermaid diagram generation failed:', error.message)
        // Return 1x1 transparent PNG placeholder
        return {
            pngUrl: '',
            svgUrl: '',
            pngBuffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
            svgBuffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>')
        }
    }
}

/**
 * Generate Service Flow Diagram (서비스 흐름도)
 */
export async function generateServiceFlow(steps: Array<{
    id: string
    label: string
    type: 'start' | 'process' | 'decision' | 'end'
    next?: string[]
}>): Promise<{ pngBuffer: Buffer; svgBuffer: Buffer }> {

    let mermaid = 'flowchart TD\n'

    // Add styles for Korean business plan aesthetics
    steps.forEach(step => {
        let shape = ''

        switch (step.type) {
            case 'start':
                shape = `${step.id}([${step.label}])`
                break
            case 'process':
                shape = `${step.id}[${step.label}]`
                break
            case 'decision':
                shape = `${step.id}{${step.label}}`
                break
            case 'end':
                shape = `${step.id}([${step.label}])`
                break
        }

        mermaid += `  ${shape}\n`

        // Add connections
        if (step.next) {
            step.next.forEach(nextId => {
                mermaid += `  ${step.id} --> ${nextId}\n`
            })
        }
    })

    // Add styling (professional Korean government style)
    mermaid += '\n'
    mermaid += '  classDef startEnd fill:#e1f5ff,stroke:#0066cc,stroke-width:2px\n'
    mermaid += '  classDef process fill:#fff,stroke:#0066cc,stroke-width:2px\n'
    mermaid += '  classDef decision fill:#fff7e6,stroke:#ff9800,stroke-width:2px\n'

    const result = await generateMermaidDiagram(mermaid)
    return {
        pngBuffer: result.pngBuffer,
        svgBuffer: result.svgBuffer
    }
}

/**
 * Generate Gantt Chart Roadmap (개발 로드맵)
 */
export async function generateGanttChart(data: {
    title: string
    sections: Array<{
        name: string
        tasks: Array<{
            name: string
            start: string  // YYYY-MM-DD
            duration: string  // e.g., "30d", "3w", "2m"
            status?: 'done' | 'active' | 'crit' | 'milestone'
        }>
    }>
}): Promise<{ pngBuffer: Buffer; svgBuffer: Buffer }> {

    let mermaid = 'gantt\n'
    mermaid += `  title ${data.title}\n`
    mermaid += '  dateFormat YYYY-MM-DD\n'
    mermaid += '  axisFormat %Y-%m\n'
    mermaid += '\n'

    data.sections.forEach(section => {
        mermaid += `  section ${section.name}\n`

        section.tasks.forEach(task => {
            const status = task.status ? `${task.status}, ` : ''
            mermaid += `  ${task.name} :${status}${task.start}, ${task.duration}\n`
        })

        mermaid += '\n'
    })

    const result = await generateMermaidDiagram(mermaid)
    return {
        pngBuffer: result.pngBuffer,
        svgBuffer: result.svgBuffer
    }
}

/**
 * Generate Funding Timeline (자금 조달 계획)
 */
export async function generateFundingTimeline(milestones: Array<{
    period: string  // e.g., "2026 Q1"
    events: string[]
}>): Promise<{ pngBuffer: Buffer; svgBuffer: Buffer }> {

    let mermaid = 'timeline\n'
    mermaid += '  title 자금 조달 및 투자 유치 계획\n'
    mermaid += '\n'

    milestones.forEach(milestone => {
        mermaid += `  ${milestone.period}`
        milestone.events.forEach(event => {
            mermaid += ` : ${event}`
        })
        mermaid += '\n'
    })

    const result = await generateMermaidDiagram(mermaid)
    return {
        pngBuffer: result.pngBuffer,
        svgBuffer: result.svgBuffer
    }
}

/**
 * Generate Organization Chart (조직도)
 */
export async function generateOrgChart(structure: {
    ceo: string
    departments: Array<{
        head: string
        members: string[]
    }>
}): Promise<{ pngBuffer: Buffer; svgBuffer: Buffer }> {

    let mermaid = 'flowchart TB\n'
    mermaid += `  CEO[${structure.ceo}<br/>대표이사]\n`

    structure.departments.forEach((dept, idx) => {
        const deptId = `DEPT${idx}`
        mermaid += `  ${deptId}[${dept.head}]\n`
        mermaid += `  CEO --> ${deptId}\n`

        dept.members.forEach((member, mIdx) => {
            const memberId = `${deptId}_M${mIdx}`
            mermaid += `  ${memberId}[${member}]\n`
            mermaid += `  ${deptId} --> ${memberId}\n`
        })
    })

    // Styling
    mermaid += '\n'
    mermaid += '  classDef ceo fill:#4da6ff,color:#fff,stroke:#0066cc,stroke-width:3px\n'
    mermaid += '  classDef head fill:#a8d8ff,stroke:#0066cc,stroke-width:2px\n'
    mermaid += '  class CEO ceo\n'

    const result = await generateMermaidDiagram(mermaid)
    return {
        pngBuffer: result.pngBuffer,
        svgBuffer: result.svgBuffer
    }
}

/**
 * Validate Mermaid syntax before generation
 */
export function validateMermaidSyntax(code: string): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    // Basic validation
    if (!code.trim()) {
        errors.push('Mermaid code is empty')
    }

    // Check for valid diagram type
    const validTypes = ['flowchart', 'gantt', 'timeline', 'sequenceDiagram', 'classDiagram', 'pie']
    const firstLine = code.trim().split('\n')[0].toLowerCase()

    if (!validTypes.some(type => firstLine.startsWith(type))) {
        errors.push('Invalid diagram type. Must start with flowchart, gantt, timeline, etc.')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}
