"use client"

import { createProgramMatch, processStartupMatch } from "@/actions/k-startup"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Building2, Calendar, Compass, Wallet } from "lucide-react"
import { useEffect, useState } from "react"

type MatchStatus = 'ANALYZING' | 'COMPLETED'

interface ProgramMatch {
    id: string
    status: MatchStatus
    startup_profile: unknown
    matched_results: {
        program_name: string
        fit_score: number
        reason: string
        deadline: string
        amount: string
    }[]
}

export default function KStartupNavigatorPage() {
    const supabase = createClient()
    const [match, setMatch] = useState<ProgramMatch | null>(null)
    const [industry, setIndustry] = useState("")
    const [stage, setStage] = useState("")
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        const channel = supabase
            .channel('navigator-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'program_matches' },
                (payload) => {
                    if (payload.new && (payload.new as ProgramMatch).id === match?.id) {
                        setMatch(payload.new as ProgramMatch)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, match?.id])

    const startMatching = async () => {
        if (!industry || !stage) return
        setLogs([])
        addLog(`Analyzing Startup Profile: ${industry} / ${stage}...`)

        const created = await createProgramMatch({
            startup_profile: { industry, stage }
        })

        if (!created.success) {
            addLog(`ERROR: ${created.error?.message || 'Failed to create match task'}`)
            return
        }

        const createdMatch = created.match as ProgramMatch
        if (!createdMatch) return

        setMatch(createdMatch)
        addLog("RULES ENGINE: Scanning Government Programs...")

        try {
            await processStartupMatch(createdMatch.id)
            addLog("RANKING: Fit scores calculated.")
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            addLog(`ERROR: ${message}`)
        }
    }

    const resetDemo = () => {
        setMatch(null)
        setLogs([])
        setIndustry("")
        setStage("")
    }

    const step = match?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-teal-500/30 text-teal-400">Blueprint #9</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-100 to-teal-500">
                        K-Startup Navigator
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Funding Strategy Agent: Intelligent Government Program Matching.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Reset
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Input */}
                <Card className="bg-black/40 border-slate-800 md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-teal-400" />
                            Startup Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Industry Sector</label>
                            <Select onValueChange={setIndustry}>
                                <SelectTrigger className="bg-slate-900 border-slate-700" disabled={step !== 'IDLE'}>
                                    <SelectValue placeholder="Select Sector" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AI">AI & Deep Tech</SelectItem>
                                    <SelectItem value="Bio">BioHealth</SelectItem>
                                    <SelectItem value="SaaS">SaaS / Platform</SelectItem>
                                    <SelectItem value="Commerce">E-commerce</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Growth Stage</label>
                            <Select onValueChange={setStage}>
                                <SelectTrigger className="bg-slate-900 border-slate-700" disabled={step !== 'IDLE'}>
                                    <SelectValue placeholder="Select Stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Idea">Idea / Pre-Incorp</SelectItem>
                                    <SelectItem value="Seed">Seed (Pre-Revenue)</SelectItem>
                                    <SelectItem value="SeriesA">Series A (Growth)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full bg-teal-600 hover:bg-teal-500 mt-4"
                            onClick={startMatching}
                            disabled={!industry || !stage || step !== 'IDLE'}
                        >
                            Find Funding <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        {logs.length > 0 && (
                            <div className="mt-4 p-3 bg-black/50 rounded-lg font-mono text-xs text-teal-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Column */}
                <div className="md:col-span-2 relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {step === 'ANALYZING' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <ThinkingProcess />
                                <p className="text-sm text-teal-300 animate-pulse">
                                    Cross-referencing 142 Programs...
                                </p>
                            </motion.div>
                        )}

                        {match?.status === 'COMPLETED' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <h3 className="text-xl font-bold flex items-center gap-2 text-teal-100">
                                    <Compass className="h-6 w-6 text-teal-500" />
                                    Strategic Funding Roadmap
                                </h3>

                                {match.matched_results.map((result, i) => (
                                    <Card key={i} className="bg-teal-950/20 border-teal-500/20 hover:border-teal-500/40 transition-colors">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-bold text-teal-300">{result.program_name}</h4>
                                                        <Badge className="bg-teal-600/80 hover:bg-teal-600">{result.fit_score}% Fit</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mt-1">{result.reason}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center text-emerald-400 font-mono font-bold">
                                                        <Wallet className="h-4 w-4 mr-2" />
                                                        {result.amount}
                                                    </div>
                                                    <div className="flex items-center text-slate-500 text-xs mt-1 justify-end">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Due: {result.deadline}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-teal-500/10 flex justify-between items-center">
                                                <div className="text-xs text-slate-500">
                                                    Required: <span className="text-slate-400">Pitch Deck, Biz License</span>
                                                </div>
                                                <Button size="sm" variant="outline" className="border-teal-500/30 text-teal-400 hover:bg-teal-950">
                                                    Start Application
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </motion.div>
                        )}

                        {step === 'IDLE' && (
                            <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <Compass className="h-16 w-16 opacity-20" />
                                <p>Select industry & stage to generate roadmap</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
