"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { Brain, ChevronRight, RefreshCw, Shield } from "lucide-react"
import { useEffect, useState } from "react"

const slides = [
    {
        id: "autonomous",
        title: "Autonomous Reasoning",
        description: "Agents that don't just follow scripts. They plan, critique, and adapt strategies in real-time based on obstacle detection.",
        icon: Brain,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    },
    {
        id: "self-healing",
        title: "Self-Healing Workflows",
        description: "Zero downtime. When a node fails, the orchestration engine triggers an automatic recovery protocol to retry or reroute.",
        icon: RefreshCw,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        id: "security",
        title: "Enterprise Grade Security",
        description: "Bank-level encryption, complete audit trails, and granular RBAC built into the core operational substrate.",
        icon: Shield,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    }
]

export function DeepTechShowcase() {
    const [active, setActive] = useState(0)
    const [autorun, setAutorun] = useState(true)

    useEffect(() => {
        if (!autorun) return
        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [autorun])

    return (
        <section className="py-24 bg-black/20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-300">Architecture</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Complexity</h2>
                    <p className="text-muted-foreground text-lg">
                        Standard automation tools break under pressure. Our "Deep Tech" stack gets stronger.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">

                    {/* Controls / List */}
                    <div className="space-y-4">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                onClick={() => {
                                    setActive(index)
                                    setAutorun(false)
                                }}
                                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${active === index
                                        ? "bg-white/5 border-white/10 shadow-lg"
                                        : "bg-transparent border-transparent hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${slide.bg} ${slide.color}`}>
                                        <slide.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold text-lg mb-1 ${active === index ? "text-white" : "text-slate-400"}`}>
                                            {slide.title}
                                        </h3>
                                        {active === index && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="text-slate-400 text-sm leading-relaxed"
                                            >
                                                {slide.description}
                                            </motion.p>
                                        )}
                                    </div>
                                    {active === index && (
                                        <motion.div layoutId="active-arrow">
                                            <ChevronRight className="w-5 h-5 text-indigo-400" />
                                        </motion.div>
                                    )}
                                </div>
                                {/* Progress Bar for active item */}
                                {active === index && autorun && (
                                    <motion.div
                                        className="h-1 bg-indigo-500/30 mt-4 rounded-full overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="h-full bg-indigo-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Visualizer Display */}
                    <div className="relative h-[400px] w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0"
                            >
                                <Card className={`h-full border ${slides[active].border} bg-black/40 backdrop-blur-xl overflow-hidden`}>
                                    <CardContent className="h-full flex flex-col items-center justify-center p-8 relative">
                                        {/* Abstract Visual Representation */}
                                        <div className={`absolute inset-0 ${slides[active].bg} opacity-20`} />

                                        <div className="relative z-10 p-8 rounded-full bg-black/50 border border-white/10 mb-8">
                                            {(() => {
                                                const Icon = slides[active].icon
                                                return <Icon className={`w-16 h-16 ${slides[active].color}`} />
                                            })()}
                                        </div>

                                        <div className="text-center relative z-10 max-w-sm">
                                            <h4 className="text-2xl font-bold mb-3">{slides[active].title}</h4>
                                            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                SYSTEM_ONLINE
                                                <span className="opacity-50">|</span>
                                                LATENCY: 12ms
                                            </div>
                                        </div>

                                        {/* Decorative scanning lines */}
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" style={{ animationDuration: '3s' }} />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    )
}
