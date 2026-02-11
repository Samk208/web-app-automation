
/**
 * Chart generation using QuickChart.io API (FREE)
 */

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'area'

/**
 * Generate chart using QuickChart.io
 */
export async function generateChart(config: {
    type: ChartType
    data: any
    options?: any
    width?: number
    height?: number
}): Promise<Buffer> {

    const chartConfig = {
        type: config.type,
        data: config.data,
        options: {
            ...config.options,
            plugins: {
                ...config.options?.plugins,
                legend: {
                    labels: {
                        font: {
                            family: "'Noto Sans KR', sans-serif"
                        }
                    }
                }
            }
        }
    }

    const requestBody = {
        chart: chartConfig,
        width: config.width || 600,
        height: config.height || 400,
        backgroundColor: 'white',
        format: 'png'
    }

    try {
        const response = await fetch('https://quickchart.io/chart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            throw new Error(`QuickChart failed: ${response.statusText}`)
        }

        return Buffer.from(await response.arrayBuffer())
    } catch (error: any) {
        console.error('Chart generation failed:', error)
        throw new Error(`Failed to generate chart: ${error.message}`)
    }
}

/**
 * Generate Revenue Projection Chart (매출 전망)
 */
export async function generateRevenueChart(projections: Array<{
    year: number
    revenue: number
    profit: number
}>): Promise<Buffer> {

    return generateChart({
        type: 'line',
        width: 700,
        height: 400,
        data: {
            labels: projections.map(p => `${p.year}년`),
            datasets: [
                {
                    label: '매출액 (억원)',
                    data: projections.map(p => p.revenue / 100000000),
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: '영업이익 (억원)',
                    data: projections.map(p => p.profit / 100000000),
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '3개년 재무 전망 (3-Year Financial Projection)',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '억원 (100M KRW)',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        callback: function (value: number) {
                            return value.toFixed(1) + '억'
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '연도 (Year)',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    })
}

/**
 * Generate Budget Breakdown Chart (사업비 집행 계획)
 */
export async function generateBudgetChart(budget: Array<{
    category: string
    amount: number
    color?: string
}>): Promise<Buffer> {

    const defaultColors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
    ]

    return generateChart({
        type: 'doughnut',
        width: 600,
        height: 400,
        data: {
            labels: budget.map(b => b.category),
            datasets: [{
                data: budget.map(b => b.amount / 1000000), // Convert to millions
                backgroundColor: budget.map((b, idx) =>
                    b.color || defaultColors[idx % defaultColors.length]
                ),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '사업비 집행 계획 (Budget Allocation)',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                datalabels: {
                    formatter: (value: number) => {
                        return `₩${value.toFixed(0)}M`
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 11
                    }
                }
            }
        }
    })
}

/**
 * Generate Market Share Pie Chart (시장 점유율)
 */
export async function generateMarketShareChart(data: Array<{
    company: string
    share: number
}>): Promise<Buffer> {

    return generateChart({
        type: 'pie',
        width: 600,
        height: 400,
        data: {
            labels: data.map(d => d.company),
            datasets: [{
                data: data.map(d => d.share),
                backgroundColor: [
                    '#4da6ff',
                    '#66b3ff',
                    '#99ccff',
                    '#cce6ff',
                    '#e6f2ff'
                ]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '시장 점유율 분석 (Market Share Analysis)',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    })
}

/**
 * Generate Competitive Analysis Radar Chart (경쟁사 비교)
 */
export async function generateCompetitorRadar(competitors: Array<{
    name: string
    scores: {
        technology: number
        marketShare: number
        funding: number
        teamSize: number
        patents: number
    }
}>): Promise<Buffer> {

    return generateChart({
        type: 'radar',
        width: 600,
        height: 500,
        data: {
            labels: [
                '기술력 (Technology)',
                '시장점유율 (Market)',
                '자금력 (Funding)',
                '팀 규모 (Team)',
                '특허 (Patents)'
            ],
            datasets: competitors.map((comp, idx) => ({
                label: comp.name,
                data: [
                    comp.scores.technology,
                    comp.scores.marketShare,
                    comp.scores.funding,
                    comp.scores.teamSize,
                    comp.scores.patents
                ],
                borderColor: `hsl(${idx * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
                borderWidth: 2
            }))
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '경쟁사 비교 분석 (Competitive Analysis)',
                    font: { size: 16 }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    })
}
