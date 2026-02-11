"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { BrainCircuit, CheckCircle2, ShieldCheck, Terminal } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
    {
        id: "stateful",
        title: "Stateful Workflows",
        subtitle: "Not Brittle Scripts",
        description: "Most agent frameworks reset when they fail. Our Persistent State Engine saves every thought, tool call, and result to the database. Fix bugs in real-time.",
        icon: Terminal,
        color: "blue",
        visual: "terminal"
    },
    {
        id: "human",
        title: "Human-in-the-Loop",
        subtitle: "Native Architecture",
        description: "Define Confidence Thresholds that automatically pause execution when agents are unsure. Review, edit, and approve critical actions before they happen.",
        icon: ShieldCheck,
        color: "orange",
        visual: "approval"
    },
    {
        id: "learning",
        title: "Active Learning",
        subtitle: "Smarter Over Time",
        description: "When you correct an agent, it doesn't just fix the output—it updates its vector ruleset. The system gets smarter with every interaction.",
        icon: BrainCircuit,
        color: "emerald",
        visual: "learning"
    }
]

export function ScrollytellingFeatures() {
    const [activeFeature, setActiveFeature] = useState(0)

    // Refs for each section to track visibility
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const handleScroll = () => {
            // Simple proximity check: which section is closest to center of screen
            const scrollY = window.scrollY + window.innerHeight / 3

            // Find the section that is currently "active"
            let current = 0
            sectionRefs.current.forEach((ref, index) => {
                if (ref && ref.offsetTop <= scrollY) {
                    current = index
                }
            })
            setActiveFeature(current)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <section className="relative py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* Left Column: Scrolling Text */}
                    <div className="space-y-[40vh] py-[10vh]">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                ref={el => { sectionRefs.current[index] = el }}
                                className={cn(
                                    "transition-opacity duration-500 min-h-[40vh] flex flex-col justify-center",
                                    activeFeature === index ? "opacity-100" : "opacity-30 blur-sm"
                                )}
                            >
                                <div className={cn(
                                    "inline-flex items-center rounded-lg border px-3 py-1 text-sm font-medium backdrop-blur-md mb-6 w-fit",
                                    feature.color === "blue" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                                        feature.color === "orange" ? "border-orange-500/20 bg-orange-500/10 text-orange-400" :
                                            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                )}>
                                    <feature.icon className="mr-2 h-4 w-4" /> {feature.id.toUpperCase()}
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
                                    {feature.title} <br />
                                    <span className="text-muted-foreground">{feature.subtitle}</span>
                                </h2>

                                <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Sticky Visual */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-24 h-[calc(100vh-120px)] w-full flex items-center justify-center">
                            <div className="relative w-full aspect-square max-h-[600px] rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Background Gradients */}
                                <div className={cn(
                                    "absolute inset-0 transition-colors duration-700 opacity-20",
                                    activeFeature === 0 ? "bg-blue-600/20" :
                                        activeFeature === 1 ? "bg-orange-600/20" :
                                            "bg-emerald-600/20"
                                )} />

                                {/* Content Container */}
                                <div className="absolute inset-0 p-8 flex items-center justify-center">

                                    {/* Visual 1: Terminal */}
                                    <div className={cn(
                                        "absolute inset-0 p-8 transition-all duration-700 transform",
                                        activeFeature === 0 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                                    )}>
                                        <MockTerminal />
                                    </div>

                                    {/* Visual 2: Approval */}
                                    <div className={cn(
                                        "absolute inset-0 p-8 transition-all duration-700 transform",
                                        activeFeature === 1 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                                    )}>
                                        <MockApproval />
                                    </div>

                                    {/* Visual 3: Learning */}
                                    <div className={cn(
                                        "absolute inset-0 p-8 transition-all duration-700 transform",
                                        activeFeature === 2 ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                                    )}>
                                        <MockLearning />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function MockTerminal() {
    return (
        <div className="w-full h-full rounded-xl bg-[#0d1117] border border-slate-800 shadow-inner overflow-hidden flex flex-col font-mono text-xs">
            <div className="h-8 border-b border-slate-800 flex items-center px-4 gap-2 bg-[#161b22]">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
                <div className="ml-auto text-slate-500">execution.log</div>
            </div>
            <div className="p-6 space-y-3 text-slate-400">
                <div className="flex gap-2"><span className="text-blue-400">INFO</span><span>Initializing workflow: "Export_Doc_Gen"</span></div>
                <div className="flex gap-2"><span className="text-green-400">EXEC</span><span>Fetching HS Codes for "Semiconductor Parts"</span></div>
                <div className="flex gap-2 opacity-70 pl-4 border-l border-slate-800 ml-1"><span>&gt; Found 8542.31 (Processors)</span></div>
                <div className="flex gap-2 opacity-70 pl-4 border-l border-slate-800 ml-1"><span>&gt; Found 8542.32 (Memories)</span></div>
                <div className="flex gap-2"><span className="text-red-400">ERR</span><span>Ambiguous description detected. Pausing.</span></div>
                <div className="flex gap-2 text-yellow-300"><span>Creating snaphot state: 0x8F2A... Saved.</span></div>
            </div>
        </div>
    )
}

function MockApproval() {
    return (
        <div className="w-full max-w-sm mx-auto bg-[#0d1117] border border-slate-800 rounded-xl p-6 shadow-2xl relative top-1/2 -translate-y-1/2">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Approval Required</h4>
                        <p className="text-xs text-slate-500">Confidence: 68% (&lt; 90%)</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="text-sm text-slate-400">Agent Question:</div>
                <div className="bg-slate-900 p-3 rounded border border-slate-800 text-sm text-slate-200">
                    Is "8542.31" the correct HS Code for "M1 Pro Chips"?
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="h-9 rounded bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-300">Override</div>
                <div className="h-9 rounded bg-green-600 flex items-center justify-center text-sm font-medium text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]">Confirm</div>
            </div>
        </div>
    )
}

function MockLearning() {
    return (
        <div className="w-full h-full p-8 flex flex-col justify-center">
            <div className="space-y-6">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">User Correction</div>
                        <div className="text-white">"Always use HS 8542.39 for custom ASICs"</div>
                    </div>
                </motion.div>

                <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-slate-700 to-emerald-500/50" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/30"
                >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <BrainCircuit size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-emerald-500 uppercase tracking-widest font-semibold">Knowledge Updated</div>
                        <div className="text-emerald-200 text-sm">New rule added to vector store (ID: #9921)</div>
                    </div>
                    <CheckCircle2 className="ml-auto text-emerald-500" size={20} />
                </motion.div>
            </div>
        </div>
    )
}
