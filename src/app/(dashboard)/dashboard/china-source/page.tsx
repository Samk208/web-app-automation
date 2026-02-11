"use client"

import { createSourcingTask, processSourcing } from "@/actions/sourcing"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Languages, ShoppingCart } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { z } from "zod"

type SourcingStatus = 'PENDING' | 'SEARCHING' | 'CALCULATING' | 'COMPLETED'

interface SourcingTask {
    id: string
    source_url: string
    status: SourcingStatus
    product_data: unknown
    landed_cost_analysis: unknown
    translated_content: unknown
}

const ProductDataSchema = z.object({
    image_url: z.string().url(),
})

const LandedCostSchema = z.object({
    unit_price_cny: z.number(),
    unit_price_krw: z.number(),
    margin_percent: z.number(),
    suggested_retail: z.number(),
})

const TranslatedContentSchema = z.object({
    title_kr: z.string(),
    key_selling_points: z.array(z.string()),
})

function getProductData(value: unknown) {
    const fallback = { image_url: '' }
    const parsed = ProductDataSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

function getLandedCost(value: unknown) {
    const fallback = { unit_price_cny: 0, unit_price_krw: 0, margin_percent: 0, suggested_retail: 0 }
    const parsed = LandedCostSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

function getTranslatedContent(value: unknown) {
    const fallback = { title_kr: '', key_selling_points: [] as string[] }
    const parsed = TranslatedContentSchema.safeParse(value)
    return parsed.success ? parsed.data : fallback
}

export default function ChinaSourcePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChinaSourceContent />
        </Suspense>
    )
}

function ChinaSourceContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const taskIdFromUrl = searchParams.get('id')
    const [task, setTask] = useState<SourcingTask | null>(null)
    const [urlInput, setUrlInput] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        if (taskIdFromUrl && !task) {
            const fetchTask = async () => {
                const { data, error } = await supabase
                    .from('sourcing_tasks')
                    .select('*')
                    .eq('id', taskIdFromUrl)
                    .single()
                
                if (data && !error) {
                    setTask(data as any)
                    addLog("Loaded existing sourcing task from Orchestrator.")
                }
            }
            fetchTask()
        }
    }, [taskIdFromUrl, supabase, task])

    useEffect(() => {
        const channel = supabase
            .channel('china-source-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sourcing_tasks' },
                (payload) => {
                    if (payload.new && (payload.new as SourcingTask).id === task?.id) {
                        setTask(payload.new as SourcingTask)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, task?.id])

    const startSourcing = async () => {
        if (!urlInput) return
        setLogs([])
        setIsProcessing(true)
        addLog(`Initiating Agent for: ${urlInput.slice(0, 30)}...`)

        // 1. Create Task
        const created = await createSourcingTask({
            source_url: urlInput,
            platform: '1688',
        })

        if (!created.success) {
            addLog(`ERROR: ${created.error?.message || 'Failed to create task'}`)
            setIsProcessing(false)
            return
        }

        const createdTask = created.task as SourcingTask
        setTask(createdTask)
        addLog(`Task created. ID: ${createdTask.id.slice(0, 8)}`)

        try {
            addLog("AGENT: Initializing scraping protocol...")
            await processSourcing(createdTask.id)
            addLog("AGENT: Analysis Complete. Data persisted.")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            addLog(`ERROR: ${message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const resetDemo = () => {
        setTask(null)
        setLogs([])
        setUrlInput("")
        setIsProcessing(false)
    }

    const step = task?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-orange-500/30 text-orange-400">Blueprint #3</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-100 to-orange-500">
                        ChinaSource Pro
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Automated Sourcing: 1688 to Naver Smart Store Bridge.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Reset Demo
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Input & Logs */}
                <div className="space-y-6">
                    <Card className="bg-black/40 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-orange-400" />
                                1688 Sourcing Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Product URL (1688/Taobao)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://detail.1688.com/offer/..."
                                        className="bg-slate-900 border-slate-700"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        disabled={step !== 'IDLE'}
                                    />
                                    <Button
                                        onClick={startSourcing}
                                        disabled={step !== 'IDLE' || !urlInput || isProcessing}
                                        className="bg-orange-600 hover:bg-orange-500"
                                    >
                                        Analyze <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Try: <span className="text-slate-400 font-mono">https://detail.1688.com/offer/620188.html</span>
                                </p>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">Agent Operation Log</h4>
                                <div className="h-48 overflow-y-auto p-3 bg-black/50 rounded-lg font-mono text-xs text-orange-400/80 space-y-1">
                                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                                    {logs.length === 0 && <span className="text-slate-700">Waiting for input...</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: Results */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 'IDLE' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 space-y-4"
                            >
                                <ShoppingCart className="h-12 w-12 opacity-20" />
                                <p>Insert 1688 Link to Start Sourcing Logic</p>
                            </motion.div>
                        )}

                        {(step === 'SEARCHING' || step === 'CALCULATING') && (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10"
                            >
                                <ThinkingProcess />
                            </motion.div>
                        )}

                        {task?.status === 'COMPLETED' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Report Card */}
                                <Card className="bg-slate-900/50 border-orange-500/30 overflow-hidden">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={getProductData(task.product_data).image_url} alt="Product" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <Badge className="bg-orange-500 text-white mb-2">High Margin Potential</Badge>
                                            <h2 className="text-xl font-bold text-white leading-tight">{getTranslatedContent(task.translated_content).title_kr}</h2>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                                <div className="text-xs text-muted-foreground mb-1">Buy Price (CN)</div>
                                                <div className="text-xl font-mono text-white">¥{getLandedCost(task.landed_cost_analysis).unit_price_cny}</div>
                                                <div className="text-xs text-slate-500">~₩{getLandedCost(task.landed_cost_analysis).unit_price_krw}</div>
                                            </div>
                                            <div className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/30">
                                                <div className="text-xs text-emerald-400 mb-1">Est. Profit</div>
                                                <div className="text-xl font-mono text-emerald-400">{getLandedCost(task.landed_cost_analysis).margin_percent}%</div>
                                                <div className="text-xs text-emerald-500/70">Retail: ₩{getLandedCost(task.landed_cost_analysis).suggested_retail.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Languages className="h-4 w-4" />
                                                Naver Optimization Strategy
                                            </h4>
                                            <ul className="space-y-2">
                                                {getTranslatedContent(task.translated_content).key_selling_points.map((point, i) => (
                                                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Button className="w-full mt-6 bg-green-600 hover:bg-green-500">
                                            Push to Naver Smart Store
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
