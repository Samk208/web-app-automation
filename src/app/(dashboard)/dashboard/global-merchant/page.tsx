"use client"

import { createLocalizationTask, processLocalization } from "@/actions/merchant"

import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Languages, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

type LocalizationStatus = 'PENDING' | 'ANALYZING' | 'ADAPTING' | 'COMPLETED'

interface CulturalReasoning {
    strategy: string
    avoided: string[]
    improved?: string[]
    error?: string
}

interface LocalizationTask {
    id: string
    source_text: string
    target_market: string
    status: LocalizationStatus
    adapted_text: string | null
    cultural_reasoning: CulturalReasoning
}

export default function GlobalMerchantPage() {
    const supabase = createClient()
    const [task, setTask] = useState<LocalizationTask | null>(null)

    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('global-merchant-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'localizations' },
                (payload) => {
                    if (payload.new && (payload.new as LocalizationTask).id === task?.id) {
                        setTask(payload.new as LocalizationTask)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, task?.id])

    const startDemo = async () => {
        setLogs([])
        addLog("Ingesting Product Description...")

        // 1. Create Task

        const created = await createLocalizationTask({
            source_text: "DOMINATE the competition with the AGGRESSIVE power of the X-2000. CRUSH your goals!",
            target_market: "Japan",
        })

        if (!created.success) {
            addLog(`Error: ${created.error?.message || 'Failed to create task'}`)
            return
        }

        const createdTask = created.task as LocalizationTask
        setTask(createdTask)
        addLog(`Task ID: ${createdTask.id.slice(0, 6)}`)
        addLog("Target Market: Japan (High Context Culture)")

        // Trigger Agent
        addLog("Dispatching to Agent...")
        processLocalization(createdTask.id).catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Unknown error'
            addLog(`Error: ${message}`)
        })
    }

    const resetDemo = () => {
        setTask(null)
        setLogs([])
    }

    const step = task?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-emerald-500/30 text-emerald-400">Blueprint #2</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-500">
                        Global Merchant: Contextual Localization
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Adapting content not just by language, but by culture.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Reset Demo
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Input */}
                <Card className="bg-black/40 border-slate-800 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Languages className="h-5 w-5 text-slate-400" />
                            Source Content (US English)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 border-dashed text-lg leading-relaxed text-slate-300 italic">
                            &quot;DOMINATE the competition with the AGGRESSIVE power of the X-2000. CRUSH your goals!&quot;
                        </div>

                        {step === 'IDLE' && (
                            <Button onClick={startDemo} className="w-full mt-auto bg-emerald-600 hover:bg-emerald-500">
                                Localize for Japan <Globe className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        <div className="mt-8 space-y-2">
                            <h4 className="text-xs font-mono uppercase text-muted-foreground">Agent Analysis Stream</h4>
                            <div className="h-40 overflow-y-auto p-3 bg-black/50 rounded-lg font-mono text-xs text-emerald-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                                {logs.length === 0 && <span className="text-slate-700">Ready...</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT: Output */}
                <Card className="bg-black/40 border-slate-800 h-full flex flex-col relative overflow-hidden">
                    {step === 'ANALYZING' || step === 'ADAPTING' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                            <ThinkingProcess />
                        </div>
                    ) : null}

                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <Sparkles className="h-5 w-5" />
                            Localized Output (Japanese Market)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <AnimatePresence mode="wait">
                            {task?.status === 'COMPLETED' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-lg leading-relaxed text-white">
                                        &quot;{task.adapted_text}&quot;
                                    </div>

                                    <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
                                        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> Cultural Reasoning
                                        </h4>
                                        <p className="text-sm text-slate-300">
                                            {task.cultural_reasoning.strategy}
                                        </p>
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {task.cultural_reasoning.avoided.map((word: string) => (
                                                <Badge key={word} variant="secondary" className="bg-red-950/30 text-red-400 hover:bg-red-900/50 border-red-500/20">
                                                    Escalated: {word}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                                    Waiting for output...
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
