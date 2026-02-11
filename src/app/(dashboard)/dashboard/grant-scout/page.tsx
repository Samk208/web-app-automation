"use client"

import { createGrantApplication, processGrantMatch } from "@/actions/grant-scout"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Download, FileUp, Landmark } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import { z } from "zod"

type GrantStatus = 'ANALYZING' | 'DRAFTING' | 'COMPLETED'

interface GrantApp {
    id: string
    status: GrantStatus
    tech_sector: string
    matched_programs: unknown
    generated_draft: string
}

const MatchedProgramSchema = z.union([
    z.string(),
    z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        fit_score: z.number().optional(),
        reason: z.string().optional(),
    })
])

function getMatchedPrograms(value: unknown): Array<string> {
    const parsed = z.array(MatchedProgramSchema).safeParse(value)
    if (!parsed.success) return []

    return parsed.data.map((p) => {
        if (typeof p === 'string') return p
        return p.name || 'Program'
    })
}

export default function GrantScoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GrantScoutContent />
        </Suspense>
    )
}

function GrantScoutContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const appIdFromUrl = searchParams.get('id')
    const [app, setApp] = useState<GrantApp | null>(null)
    const [startupName, setStartupName] = useState("")
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        if (appIdFromUrl && !app) {
            const fetchApp = async () => {
                const { data, error } = await supabase
                    .from('grant_applications')
                    .select('*')
                    .eq('id', appIdFromUrl)
                    .single()
                
                if (data && !error) {
                    setApp(data as any)
                    addLog("Loaded existing application from Orchestrator.")
                }
            }
            fetchApp()
        }
    }, [appIdFromUrl, supabase, app])

    useEffect(() => {
        const channel = supabase
            .channel('grant-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'grant_applications' },
                (payload) => {
                    if (payload.new && (payload.new as GrantApp).id === app?.id) {
                        setApp(payload.new as GrantApp)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, app?.id])

    const startApplication = async () => {
        if (!startupName) return
        setLogs([])
        addLog(`Analyzing Pitch Deck for: ${startupName}...`)

        const created = await createGrantApplication({
            startup_name: startupName,
        })

        if (!created.success) {
            addLog(`ERROR: ${created.error?.message || 'Failed to create application'}`)
            return
        }

        const createdApp = created.application as GrantApp
        if (createdApp) {
            setApp(createdApp)
            addLog("Application Initialized.")

            try {
                addLog("SCANNED: Analyzing Tech Sector & Patents...")
                // Call Server Action
                await processGrantMatch(createdApp.id)
                addLog("WRITER: HWP Draft Generated.")
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                addLog(`ERROR: ${message}`)
            }
        }
    }

    const resetDemo = () => {
        setApp(null)
        setLogs([])
        setStartupName("")
    }

    const step = app?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-indigo-500/30 text-indigo-400">Blueprint #7</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-500">
                        R&D Grant Scout
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Deep Tech Funding: Automated TIPS Proposal Writer.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Restart
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="bg-black/40 border-slate-800 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-indigo-400" />
                            Startup Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Startup Name</label>
                            <Input
                                placeholder="e.g. Neural Dynamics Korea"
                                className="bg-slate-900 border-slate-700"
                                value={startupName}
                                onChange={(e) => setStartupName(e.target.value)}
                                disabled={step !== 'IDLE'}
                            />
                        </div>

                        <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 transition-colors cursor-pointer" onClick={step === 'IDLE' ? startApplication : undefined}>
                            <FileUp className="h-10 w-10 mb-2" />
                            <p>Upload Pitch Deck (PDF)</p>
                            <span className="text-xs text-slate-600">(Click to Simulate)</span>
                        </div>

                        {logs.length > 0 && (
                            <div className="mt-4 p-3 bg-black/50 rounded-lg font-mono text-xs text-indigo-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Processing & Results */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {(step === 'ANALYZING' || step === 'DRAFTING') && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <ThinkingProcess />
                                <p className="text-sm text-indigo-300 animate-pulse">
                                    {step === 'ANALYZING' ? "Matching with Govt Programs..." : "Drafting HWP Proposal..."}
                                </p>
                            </motion.div>
                        )}

                        {app?.status === 'COMPLETED' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <Card className="bg-indigo-950/20 border-indigo-500/30">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-indigo-300">Grant Match Success</h3>
                                                <div className="flex gap-2 mt-2">
                                                    {getMatchedPrograms(app.matched_programs).map((name, i) => (
                                                        <Badge key={i} className="bg-indigo-600 hover:bg-indigo-500">{name}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <Landmark className="h-8 w-8 text-indigo-400 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900 border-slate-800">
                                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                        <span className="text-sm font-medium text-slate-300">Generated Draft.hwpx</span>
                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                            <Download className="h-3 w-3 mr-1" /> Download
                                        </Button>
                                    </div>
                                    <CardContent className="p-6 prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{app.generated_draft}</ReactMarkdown>
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
