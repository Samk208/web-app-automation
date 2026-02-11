"use client"

import { AnimatePresence, motion } from "framer-motion"
import { BrainCircuit, CheckCircle2, Eraser, PenLine } from "lucide-react"
import { useEffect, useState } from "react"

type Phase = "drafting" | "critiquing" | "refining" | "complete"

export function ThinkingProcess() {
    const [phase, setPhase] = useState<Phase>("drafting")

    // Simulate the loop
    useEffect(() => {
        const loop = async () => {
            setPhase("drafting")
            await new Promise((r) => setTimeout(r, 2000))
            setPhase("critiquing")
            await new Promise((r) => setTimeout(r, 2000))
            setPhase("refining")
            await new Promise((r) => setTimeout(r, 2000))
            setPhase("complete")
        }
        loop()
    }, [])

    const steps = {
        drafting: { label: "Drafting Response...", icon: PenLine, color: "text-blue-400" },
        critiquing: { label: "Critiquing draft against Trade Rules...", icon: BrainCircuit, color: "text-amber-400" },
        refining: { label: "Refining & Self-Correcting...", icon: Eraser, color: "text-purple-400" },
        complete: { label: "Optimized Output Ready", icon: CheckCircle2, color: "text-emerald-400" },
    }

    const currentStep = steps[phase]
    const Icon = currentStep.icon

    return (
        <div className="flex items-center space-x-3 p-4 bg-slate-900/50 rounded-lg border border-white/5 backdrop-blur-sm w-full max-w-md">
            <div className="relative">
                <motion.div
                    animate={{ rotate: phase !== "complete" ? 360 : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className={currentStep.color}
                >
                    <Icon size={24} />
                </motion.div>

                {phase === "critiquing" && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-900"
                    />
                )}
            </div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-sm font-medium font-mono ${currentStep.color}`}
                    >
                        {currentStep.label}
                    </motion.p>
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        className={`h-full ${currentStep.color.replace('text-', 'bg-')}`}
                        initial={{ width: "0%" }}
                        animate={{
                            width: phase === "drafting" ? "30%" :
                                phase === "critiquing" ? "60%" :
                                    phase === "refining" ? "90%" : "100%"
                        }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    )
}
