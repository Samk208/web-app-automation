"use client"

import { createSEOAudit, processSEOAudit } from "@/actions/naver-seo"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowRight, Lightbulb, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { z } from "zod"

type AuditStatus = 'ANALYZING' | 'COMPLETED'

interface SeoAudit {
    id: string
    target_url: string
    status: AuditStatus
    current_metrics: unknown
    optimization_report: unknown
}

const SuggestionSchema = z.object({
    type: z.enum(['critical', 'warning', 'info']),
    msg: z.string(),
})

const OptimizationReportSchema = z.object({
    score: z.number(),
    suggestions: z.array(SuggestionSchema),
    optimized_title_candidate: z.string(),
})

const CurrentMetricsSchema = z.object({
    keyword_density: z.string(),
    image_count: z.number(),
})

function getOptimizationReport(value: unknown) {
    const fallback = { score: 0, suggestions: [] as z.infer<typeof SuggestionSchema>[], optimized_title_candidate: '' }
    const parsed = OptimizationReportSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

function getCurrentMetrics(value: unknown) {
    const fallback = { keyword_density: 'N/A', image_count: 0 }
    const parsed = CurrentMetricsSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

export default function NaverSeoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NaverSeoContent />
        </Suspense>
    )
}

function NaverSeoContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const auditIdFromUrl = searchParams.get('id')
    const [audit, setAudit] = useState<SeoAudit | null>(null)
    const [urlInput, setUrlInput] = useState("")
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        if (auditIdFromUrl && !audit) {
            const fetchAudit = async () => {
                const { data, error } = await supabase
                    .from('seo_audits')
                    .select('*')
                    .eq('id', auditIdFromUrl)
                    .single()
                
                if (data && !error) {
                    setAudit(data as any)
                    addLog("Loaded existing audit from Orchestrator.")
                }
            }
            fetchAudit()
        }
    }, [auditIdFromUrl, supabase, audit])

    useEffect(() => {
        const channel = supabase
            .channel('naver-seo-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'seo_audits' },
                (payload) => {
                    if (payload.new && (payload.new as SeoAudit).id === audit?.id) {
                        setAudit(payload.new as SeoAudit)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, audit?.id])

    const startAudit = async () => {
        if (!urlInput) return
        setLogs([])
        addLog(`Crawling: ${urlInput.slice(0, 30)}...`)

        // 1. Create Task
        const created = await createSEOAudit({ target_url: urlInput })

        if (!created.success) {
            addLog(`ERROR: ${created.error?.message || 'Failed to create audit'}`)
            return
        }

        const createdAudit = created.audit as SeoAudit
        setAudit(createdAudit)
        addLog(`Audit Initialized. ID: ${createdAudit.id.slice(0, 8)}`)

        try {
            addLog("CRAWLER: Fetching page content (Headless Mode)...")
            await processSEOAudit(createdAudit.id)
            addLog("ANALYZER: Report generated successfully.")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            addLog(`ERROR: ${message}`)
        }
    }

    const resetDemo = () => {
        setAudit(null)
        setLogs([])
        setUrlInput("")
    }

    const step = audit?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-green-500/30 text-green-400">Blueprint #4</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-100 to-green-500">
                        NaverSEO Pro
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Smart Store Optimizer: Beat the Naver Algorithm.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        New Audit
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Input */}
                <Card className="bg-black/40 border-slate-800 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-green-400" />
                            Target URL
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Naver Smart Store Link</Label>
                            <Input
                                placeholder="https://smartstore.naver.com/..."
                                className="bg-slate-900 border-slate-700"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                disabled={step !== 'IDLE'}
                            />
                            <Button
                                onClick={startAudit}
                                disabled={step !== 'IDLE' || !urlInput}
                                className="w-full bg-green-600 hover:bg-green-500"
                            >
                                Start Audit <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-8 space-y-2">
                            <h4 className="text-xs font-mono uppercase text-muted-foreground">Crawler Logs</h4>
                            <div className="h-32 overflow-y-auto p-3 bg-black/50 rounded-lg font-mono text-xs text-green-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                                {logs.length === 0 && <span className="text-slate-700">Ready...</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT: Analysis */}
                <div className="lg:col-span-2 relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 'ANALYZING' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-xl">
                                <ThinkingProcess />
                            </div>
                        )}

                        {audit?.status === 'COMPLETED' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-3 gap-4">
                                    {(() => {
                                        const report = getOptimizationReport(audit.optimization_report)
                                        const metrics = getCurrentMetrics(audit.current_metrics)
                                        return (
                                            <>
                                    <Card className="bg-slate-900/50 border-slate-800 p-4 text-center">
                                        <div className="text-muted-foreground text-xs uppercase">Optimization Score</div>
                                        <div className="text-4xl font-bold text-yellow-400 mt-2">{report.score}/100</div>
                                    </Card>
                                    <Card className="bg-slate-900/50 border-slate-800 p-4 text-center">
                                        <div className="text-muted-foreground text-xs uppercase">Keyword Density</div>
                                        <div className="text-xl font-bold text-white mt-2">{metrics.keyword_density}</div>
                                    </Card>
                                    <Card className="bg-slate-900/50 border-slate-800 p-4 text-center">
                                        <div className="text-muted-foreground text-xs uppercase">Images</div>
                                        <div className="text-xl font-bold text-white mt-2">{metrics.image_count}</div>
                                    </Card>
                                            </>
                                        )
                                    })()}
                                </div>

                                <Card className="bg-black/40 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-green-400">
                                            <Lightbulb className="h-5 w-5" /> Action Plan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {getOptimizationReport(audit.optimization_report).suggestions.map((s, i) => (
                                            <div key={i} className="flex gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                                <AlertCircle className={`h-5 w-5 shrink-0 ${s.type === 'critical' ? 'text-red-400' :
                                                    s.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                                    }`} />
                                                <span className="text-sm text-slate-300">{s.msg}</span>
                                            </div>
                                        ))}

                                        <div className="mt-6 pt-6 border-t border-slate-800">
                                            <div className="text-xs text-muted-foreground uppercase mb-2">Recommended Title Strategy</div>
                                            <div className="p-3 bg-green-950/20 border border-green-500/30 rounded text-green-300 font-mono text-sm">
                                                {getOptimizationReport(audit.optimization_report).optimized_title_candidate}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            step === 'IDLE' && (
                                <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                    Waiting for URL input...
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
