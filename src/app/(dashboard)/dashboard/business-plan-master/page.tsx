"use client"

import { processBusinessPlan } from "@/actions/business-plan"
import { getHwpJobStatus } from "@/actions/hwp-converter"
import { getActiveOrg } from "@/actions/org-context"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Download, FileText, Languages, PenTool } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'

type PlanStatus = 'PROCESSING' | 'GENERATING' | 'REVIEW_REQUIRED' | 'COMPLETED' | 'FAILED'

interface BusinessPlan {
    id: string
    status: PlanStatus
    input_materials: string
    sections_generated: {
        title_kr: string
        content_kr: string
    }[]
}

interface ApprovalRequest {
    id: string
    status: "pending" | "approved" | "rejected"
    summary: string | null
    reviewer_note?: string | null
}

interface HwpJob {
    id: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    input_url: string
    output_url?: string | null
    error_message?: string | null
}

export default function BusinessPlanMasterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BusinessPlanMasterContent />
        </Suspense>
    )
}

function BusinessPlanMasterContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const planIdFromUrl = searchParams.get('id')
    const [plan, setPlan] = useState<BusinessPlan | null>(null)
    const [rawInput, setRawInput] = useState("")
    const [logs, setLogs] = useState<string[]>([])
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
    const [hwpJob, setHwpJob] = useState<HwpJob | null>(null)
    const hwpEnabled = process.env.NEXT_PUBLIC_ENABLE_HWP_CONVERTER === "true"

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        if (planIdFromUrl && !plan) {
            const fetchPlan = async () => {
                const { data, error } = await supabase
                    .from('business_plans')
                    .select('*')
                    .eq('id', planIdFromUrl)
                    .single()
                
                if (data && !error) {
                    setPlan(data as any)
                    addLog("Loaded existing plan from Orchestrator.")
                }
            }
            fetchPlan()
        }
    }, [planIdFromUrl, supabase, plan])

    useEffect(() => {
        const channel = supabase
            .channel('writer-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'business_plans' },
                (payload) => {
                    if (payload.new && (payload.new as BusinessPlan).id === plan?.id) {
                        setPlan(payload.new as BusinessPlan)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, plan?.id])

    useEffect(() => {
        const fetchApprovals = async () => {
            if (!plan?.id) return
            const { data } = await supabase
                .from('approval_requests')
                .select('id,status,summary')
                .eq('resource_id', plan.id)
                .order('created_at', { ascending: false })
                .limit(5)
            if (data) setApprovals((data as any).map((d: any) => ({ ...d, reviewer_note: null })))
        }
        fetchApprovals()
    }, [supabase, plan?.id, plan?.status])

    // Poll for HWP Job Status
    useEffect(() => {
        if (plan?.status !== 'COMPLETED' || !(plan as any).document_url) {
            setHwpJob(null)
            return
        }

        const pollHwp = async () => {
            const docUrl = (plan as any).document_url
            if (!docUrl) return

            // Only poll if enabled
            if (!hwpEnabled) return

            const job = await getHwpJobStatus(docUrl)
            if (job) {
                setHwpJob(job as HwpJob)
            }
        }

        pollHwp() // Initial fetch
        const interval = setInterval(pollHwp, 3000)
        return () => clearInterval(interval)
    }, [plan?.status, (plan as any)?.document_url, hwpEnabled])

    const startGeneration = async () => {
        if (!rawInput) return
        setLogs([])
        setErrorMsg(null)
        addLog("Ingesting English Pitch Deck content...")

        const { organization_id } = await getActiveOrg()

        const { data } = await supabase
            .from('business_plans')
            .insert({
                input_materials: rawInput,
                target_program: 'TIPS',
                status: 'PROCESSING',
                organization_id
            })
            .select()
            .single()

        if (data) {
            setPlan(data as any)
            addLog("Uploaded. Waiting for AI...")

            try {
                addLog("TRANSLATOR: Converting to 'Gov Standard' Korean...")
                await processBusinessPlan(data.id)
                addLog("WRITER: HWP Sections Generated.")
            } catch (error: any) {
                addLog(`ERROR: ${error.message}`)
                setErrorMsg(error.message || "Generation failed")
            }
        }
    }

    const approveDraft = async (approvalId: string, status: "approved" | "rejected") => {
        try {
            const res = await fetch(`/api/reviews/${approvalId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) {
                addLog(`Review update failed (${status})`)
                return
            }
            addLog(`Review marked ${status}`)
            const { data } = await supabase
                .from('approval_requests')
                .select('id,status,summary,reviewer_note')
                .eq('resource_id', plan?.id || "")
                .order('created_at', { ascending: false })
                .limit(5)
            if (data) setApprovals(data as any)
        } catch (err: any) {
            addLog(`Review action error: ${err.message}`)
        }
    }

    const resetDemo = () => {
        setPlan(null)
        setLogs([])
        setRawInput("")
        setApprovals([])
        setErrorMsg(null)
    }

    const step = plan?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-orange-500/30 text-orange-400">Blueprint #10</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-100 to-orange-500">
                        Business Plan Master
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gov-Tech Writer: English Pitch Deck to Korean HWP Proposal.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Start New
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Column */}
                <Card className="bg-black/40 border-slate-800 h-full max-h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Languages className="h-5 w-5 text-orange-400" />
                            English Source Material
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        <Textarea
                            placeholder="Paste your Pitch Deck content here... e.g., 'We assist SMEs with AI automation. Our unique selling point is...'"
                            className="flex-1 bg-slate-900 border-slate-700 font-mono text-sm resize-none"
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                            disabled={step !== 'IDLE'}
                        />

                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-500"
                            onClick={startGeneration}
                            disabled={!rawInput || step !== 'IDLE'}
                        >
                            Generate HWP Draft <PenTool className="ml-2 h-4 w-4" />
                        </Button>

                        {errorMsg && (
                            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                                {errorMsg.includes("budget") ? "Budget limit hit: " : "Error: "}{errorMsg}
                            </div>
                        )}

                        {logs.length > 0 && (
                            <div className="mt-4 p-3 bg-black/50 rounded-lg font-mono text-xs text-orange-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output Column */}
                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {(step === 'PROCESSING' || step === 'GENERATING') && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <ThinkingProcess />
                                <p className="text-sm text-orange-300 animate-pulse">
                                    Translating & Adapting to Govt Standards...
                                </p>
                            </motion.div>
                        )}

                        {step === 'REVIEW_REQUIRED' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <Card className="bg-slate-900 border-orange-500/50 p-6 max-w-md w-full shadow-lg shadow-orange-900/20">
                                    <CardHeader>
                                        <CardTitle className="text-orange-400 flex items-center gap-2">
                                            <PenTool className="h-5 w-5" />
                                            Review Required
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-slate-300 text-sm">
                                            The AI has generated the initial draft. A human expert must review and approve the content before the final HWP is generated.
                                        </p>
                                        <Button
                                            className="w-full bg-orange-600 hover:bg-orange-500 font-bold"
                                            onClick={() => router.push(`/dashboard/business-plan-master/${plan?.id}/review`)}
                                        >
                                            Proceed to Review
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {plan?.status === 'COMPLETED' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full space-y-4"
                            >
                                <Card className="bg-slate-50 text-slate-900 border-none shadow-xl h-full overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
                                        <span className="font-bold text-sm text-slate-700">Generated Proposal.hwp</span>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs bg-white hover:bg-slate-50"
                                                disabled={!(plan as any).document_url}
                                                onClick={() => (plan as any).document_url && window.open((plan as any).document_url, '_blank')}
                                            >
                                                <Download className="h-3 w-3 mr-1" /> DOCX
                                            </Button>

                                            {hwpEnabled ? (
                                                hwpJob?.status === 'COMPLETED' && hwpJob.output_url ? (
                                                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white border-none" onClick={() => window.open(hwpJob.output_url!, '_blank')}>
                                                        <Download className="h-3 w-3 mr-1" /> HWP (Final)
                                                    </Button>
                                                ) : hwpJob?.status === 'FAILED' ? (
                                                    <Badge variant="destructive" className="h-8">HWP Failed</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="h-8 bg-blue-50 text-blue-600 border-blue-200 animate-pulse">
                                                        Converting HWP...
                                                    </Badge>
                                                )
                                            ) : (
                                                <Badge variant="outline" className="h-8 bg-slate-100 text-slate-700 border-slate-300">
                                                    HWP converter disabled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">1. Motivation (개발 동기)</h3>
                                            <ReactMarkdown>{(plan.sections_generated as any).motivation || (plan.sections_generated as any).problem?.background || ""}</ReactMarkdown>
                                        </div>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">2. Market Analysis (시장 분석)</h3>
                                            <ReactMarkdown>{(plan.sections_generated as any).market_analysis || (plan.sections_generated as any).problem?.target_market || ""}</ReactMarkdown>
                                        </div>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">3. Execution Plan (사업화 전략)</h3>
                                            <ReactMarkdown>{(plan.sections_generated as any).execution_plan || (plan.sections_generated as any).scale_up?.business_model || ""}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            step === 'IDLE' && (
                                <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <FileText className="h-16 w-16 opacity-20" />
                                    <p>Paste content to generate HWP draft</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {
                plan?.id && (
                    <div className="mt-8">
                        <Card className="bg-black/40 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Review Queue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {approvals.length === 0 && (
                                    <p className="text-sm text-slate-500">No review items yet.</p>
                                )}
                                {approvals.map((ap) => (
                                    <div key={ap.id} className="flex items-center justify-between rounded border border-slate-800 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{ap.summary || "Business plan draft"}</p>
                                            <p className="text-xs text-slate-500">Status: {ap.status}</p>
                                        </div>
                                        {ap.status === "pending" ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => approveDraft(ap.id, "approved")}>Approve</Button>
                                                <Button size="sm" variant="ghost" onClick={() => approveDraft(ap.id, "rejected")}>Reject</Button>
                                            </div>
                                        ) : (
                                            <Badge variant="outline">{ap.status}</Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </div >
    )
}
