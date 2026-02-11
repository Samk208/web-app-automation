"use client"

import { createReconciliationJob, processReconciliation } from "@/actions/reconciliation"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { AlertOctagon, ArrowRightLeft, Check, FileSpreadsheet, Receipt, RefreshCw, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"

type RecJobStatus = 'UPLOADED' | 'PROCESSING' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'FAILED'

interface RecJob {
    id: string
    status: RecJobStatus
    bank_statement_data: unknown
    receipt_data: unknown
    match_results: unknown
}

const MatchResultSchema = z.object({
    bank_id: z.string(),
    receipt_id: z.string(),
    confidence: z.number(),
    notes: z.string(),
})

const DiscrepancySchema = z.object({
    type: z.enum(['bank_only', 'receipt_only']),
    id: z.string(),
    desc: z.string(),
    amount: z.number(),
    reason: z.string(),
})

const MatchResultsSchema = z.object({
    matched: z.array(MatchResultSchema),
    unreconciled: z.array(DiscrepancySchema),
})

type MatchResults = z.infer<typeof MatchResultsSchema>

function getMatchResults(value: unknown): MatchResults {
    const fallback: MatchResults = { matched: [], unreconciled: [] }
    const parsed = MatchResultsSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

export default function ReconciliationPage() {
    const supabase = createClient()
    const [job, setJob] = useState<RecJob | null>(null)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        const channel = supabase
            .channel('rec-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reconciliation_jobs' },
                (payload) => {
                    if (payload.new && (payload.new as RecJob).id === job?.id) {
                        setJob(payload.new as RecJob)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, job?.id])

    const startReconciliation = async () => {
        setLogs([])
        addLog("Analyzing uploaded files...")

        // Mock Data for Demo
        const mockBankData = [
            { id: "tx1", date: "2025-01-02", desc: "UBER * TRIP 8412", amount: -24500 },
            { id: "tx2", date: "2025-01-03", desc: "STARBUCKS KOREA", amount: -12800 },
            { id: "tx3", date: "2025-01-05", desc: "AWS CLOUD SERVICES", amount: -450000 },
        ]

        const mockReceipts = [
            { id: "rc1", vendor: "Uber Technologies", date: "2025-01-02", amount: 24500 },
            { id: "rc2", vendor: "Starbucks Coffee", date: "2025-01-03", amount: 12800 },
            // Missing AWS receipt
        ]

        const created = await createReconciliationJob({
            company_name: 'TechCorp Korea',
            bank_statement_data: mockBankData,
            receipt_data: mockReceipts,
        })

        if (!created.success) {
            addLog(`ERROR: ${created.error?.message || 'Failed to create job'}`)
            return
        }

        const createdJob = created.job as RecJob
        if (createdJob) {
            setJob(createdJob)
            addLog("Job Created. Files queued.")

            try {
                addLog("AGENT: Reading CSV and OCR data...")
                // Call Server Action
                const result = await processReconciliation(createdJob.id)
                if (result?.status === 'AWAITING_APPROVAL') {
                    addLog("MATCHER: Completed. Awaiting approval.")
                } else {
                    addLog("MATCHER: Reconciliation algorithm finished.")
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                addLog(`ERROR: ${message}`)
            }
        }
    }

    const resetDemo = () => {
        setJob(null)
        setLogs([])
    }

    const step = job?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-blue-500/30 text-blue-400">Blueprint #5</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-500">
                        Ledger Logic
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Intelligent Reconciliation Agent: Fuzzy Logic Financial Matching.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card className="bg-black/40 border-slate-800 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-slate-400" />
                            Data Input
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 transition-colors cursor-pointer" onClick={step === 'IDLE' ? startReconciliation : undefined}>
                            <FileSpreadsheet className="h-10 w-10 mb-2" />
                            <p>Upload Bank CSV</p>
                            <span className="text-xs text-slate-600">(Click to Simulate)</span>
                        </div>
                        <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 transition-colors cursor-pointer" onClick={step === 'IDLE' ? startReconciliation : undefined}>
                            <Receipt className="h-10 w-10 mb-2" />
                            <p>Upload Receipts Folder</p>
                            <span className="text-xs text-slate-600">(Click to Simulate)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Processing & Results */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 'PROCESSING' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <ThinkingProcess />
                                <div className="text-xs font-mono text-blue-300/70 p-4 border border-blue-900/30 bg-blue-950/20 rounded max-w-xs">
                                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                                </div>
                            </motion.div>
                        )}

                        {job?.status === 'COMPLETED' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                                    <Check className="h-6 w-6" /> Reconciliation Report
                                </h3>

                                {/* Matches */}
                                <div className="space-y-2">
                                    <h4 className="text-sm uppercase text-muted-foreground font-mono">Matched Transactions</h4>
                                    {getMatchResults(job.match_results).matched.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-emerald-950/20 border border-emerald-500/20 rounded">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">{(m.confidence * 100).toFixed(0)}% Match</Badge>
                                                <span className="text-sm font-medium text-slate-300">Transaction #{m.bank_id}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 italic">{m.notes}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Discrepancies */}
                                <div className="space-y-2 mt-6">
                                    <h4 className="text-sm uppercase text-muted-foreground font-mono">Discrepancies</h4>
                                    {getMatchResults(job.match_results).unreconciled.map((u, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-red-950/20 border border-red-500/20 rounded">
                                            <div className="flex items-center gap-3">
                                                <AlertOctagon className="h-5 w-5 text-red-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-300">{u.desc}</span>
                                                    <span className="text-xs text-red-400">{u.reason}</span>
                                                </div>
                                            </div>
                                            <div className="font-mono text-red-400 text-sm">₩{u.amount.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>

                                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500">
                                    Export to ERP
                                </Button>
                            </motion.div>
                        )}

                        {step === 'IDLE' && (
                            <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                                <ArrowRightLeft className="h-12 w-12 opacity-20 mr-4" />
                                <div>
                                    <p className="font-medium">Ready to Reconcile</p>
                                    <p className="text-sm">Click upload buttons to start demo</p>
                                </div>
                            </div>
                        )}

                        {step === 'AWAITING_APPROVAL' && (
                            <div className="h-full border border-blue-900/30 bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-200">
                                <div>
                                    <p className="font-medium">Awaiting Approval</p>
                                    <p className="text-sm text-blue-300/80">A review request was created for an admin/owner to approve financial reconciliation.</p>
                                </div>
                            </div>
                        )}

                        {step === 'FAILED' && (
                            <div className="h-full border border-red-900/30 bg-red-950/20 rounded-xl flex items-center justify-center text-red-200">
                                <div>
                                    <p className="font-medium">Job Failed</p>
                                    <p className="text-sm text-red-300/80">Please retry or check server logs.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
