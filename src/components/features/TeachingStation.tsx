"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowRight, BrainCircuit, CheckCircle2, Save } from "lucide-react"
import { useState } from "react"

interface TeachingStationProps {
    className?: string
    initialScenario?: {
        input: string
        agentOutput: string
        confidence: number
        correctionNeeded: boolean
    }
    onResolved?: () => void
}

export function TeachingStation({
    className,
    initialScenario = {
        input: "Classify: 'High-performance drill bits, tungsten carbide tip'",
        agentOutput: "HS Code: 8207.50 (Tools for drilling, other than for rock drilling)",
        confidence: 65,
        correctionNeeded: true
    },
    onResolved
}: TeachingStationProps) {
    const [step, setStep] = useState<"review" | "correct" | "learning" | "saved">("review")
    const [correction, setCorrection] = useState("")

    const handleCorrect = () => {
        setStep("learning")
        // Simulate learning delay
        setTimeout(() => {
            setStep("saved")
        }, 2500)
    }

    return (
        <Card className={cn("w-full max-w-2xl mx-auto glass-panel border-indigo-500/20", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="text-indigo-400" />
                            Teaching Station
                        </CardTitle>
                        <CardDescription>Review low-confidence predictions to improve agent accuracy.</CardDescription>
                    </div>
                    <Badge variant={step === "saved" ? "deep-tech" : "secondary"}>
                        {step === "saved" ? "Knowledge Updated" : "Review Required"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Scenario Display */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Input Data</span>
                        <div className="p-3 rounded-md bg-slate-900 border border-slate-800 font-mono text-sm text-slate-300">
                            {initialScenario.input}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Agent Prediction</span>
                            <span className={cn("text-xs font-bold", initialScenario.confidence > 80 ? "text-emerald-400" : "text-amber-400")}>
                                {initialScenario.confidence}% Confidence
                            </span>
                        </div>
                        <div className={cn(
                            "p-3 rounded-md border text-sm font-mono transition-colors",
                            step === "saved" ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-300"
                        )}>
                            {step === "saved" ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    <span>Updated Rule: {correction || "HS Code: 8207.19 (Rock drilling or earth boring tools)"}</span>
                                </div>
                            ) : (
                                initialScenario.agentOutput
                            )}
                        </div>
                    </div>
                </div>

                {/* Interaction Area */}
                <AnimatePresence mode="wait">
                    {step === "review" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="flex gap-4 pt-2"
                        >
                            <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setStep("saved")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                Looks Good
                            </Button>
                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500" onClick={() => setStep("correct")}>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Fix Mistake
                            </Button>
                        </motion.div>
                    )}

                    {step === "correct" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Correct Answer</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., HS Code: 8207.19 (Rock drilling...)"
                                    value={correction}
                                    onChange={(e) => setCorrection(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setStep("review")}>Cancel</Button>
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-500"
                                    disabled={!correction}
                                    onClick={handleCorrect}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Model
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "learning" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 space-y-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                                <BrainCircuit className="h-12 w-12 text-indigo-400 animate-spin-slow relative z-10" />
                            </div>
                            <div className="text-center space-y-1">
                                <h4 className="text-lg font-medium text-white">Re-indexing Vector Store...</h4>
                                <p className="text-sm text-slate-500">Generating embeddings for new rule</p>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full max-w-xs h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === "saved" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-emerald-200">Knowledge Base Updated</p>
                                    <p className="text-xs text-emerald-500/80">This correction will apply to future tasks.</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => {
                                if (onResolved) onResolved()
                                setStep("review")
                                setCorrection("")
                            }}>
                                {onResolved ? "Resume Workflow" : "Next Task"} <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
