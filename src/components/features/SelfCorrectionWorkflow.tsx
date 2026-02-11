"use client"

import { TeachingStation } from "@/components/features/TeachingStation"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"

export function SelfCorrectionWorkflow() {
    const [state, setState] = useState<"thinking" | "uncertain" | "learning" | "resolved">("thinking")
    const [cycleCount, setCycleCount] = useState(0)

    // Simulation loop
    useEffect(() => {
        if (state === "thinking") {
            const timer = setTimeout(() => {
                setState("uncertain")
            }, 4000) // Think for 4s
            return () => clearTimeout(timer)
        }
    }, [state])

    const handleReset = () => {
        setState("thinking")
        setCycleCount(c => c + 1)
    }

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">

            {/* Workflow Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Badge variant={state === "thinking" ? "default" : "outline"} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/50">
                        Step 1: Reasoning
                    </Badge>
                    <div className="h-px w-8 bg-slate-700" />
                    <Badge variant={state === "uncertain" ? "destructive" : "outline"} className={state === "uncertain" ? "bg-amber-500/10 text-amber-400 border-amber-500/50" : ""}>
                        Step 2: Uncertainty Detected
                    </Badge>
                    <div className="h-px w-8 bg-slate-700" />
                    <Badge variant={state === "resolved" ? "deep-tech" : "outline"}>
                        Step 3: Knowledge Update
                    </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-white">
                    <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reset Demo
                </Button>
            </div>

            {/* Dynamic Content Area */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {state === "thinking" && (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0"
                        >
                            <Card className="glass-panel h-full border-indigo-500/30">
                                <CardHeader>
                                    <CardTitle>Agent Worker #09</CardTitle>
                                    <CardDescription>Analyzing complex trade document...</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center p-12">
                                    <ThinkingProcess />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {(state === "uncertain" || state === "learning" || state === "resolved") && (
                        <motion.div
                            key="teaching"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-10"
                        >
                            <TeachingStation
                                initialScenario={{
                                    input: "Invoice item: 'Autonomous drone motor, >1000W output'",
                                    agentOutput: "HS Code: 8501.32 (Motors > 37.5kW) - [Confidence: 42%]",
                                    confidence: 42,
                                    correctionNeeded: true
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
