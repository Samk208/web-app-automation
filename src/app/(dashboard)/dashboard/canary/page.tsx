"use client"

import { LiveLogViewer } from "@/components/features/LiveLogViewer"
import { SelfCorrectionWorkflow } from "@/components/features/SelfCorrectionWorkflow"
import { TeachingStation } from "@/components/features/TeachingStation"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfidenceGauge } from "@/components/ui/confidence-gauge"

export default function CanaryPage() {
    return (
        <div className="p-8 space-y-8 bg-black/20 min-h-screen text-slate-200">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-sans text-gradient">Deep Tech System Canary</h1>
                <p className="text-muted-foreground font-mono">Verifying core agentic primitives.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Thinking Process Demo */}
                <Card className="glass-panel border-indigo-500/20">
                    <CardHeader>
                        <CardTitle>Cognitive Architecture</CardTitle>
                        <CardDescription>Visualizing the Agent's reasoning loop.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                        <ThinkingProcess />
                    </CardContent>
                </Card>

                {/* Confidence Gauge Demo */}
                <Card className="glass-panel border-emerald-500/20">
                    <CardHeader>
                        <CardTitle>Reliability Metrics</CardTitle>
                        <CardDescription>Active Learning triggers based on confidence.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-8">
                        <div className="flex gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <ConfidenceGauge score={94} size={100} />
                                <Badge variant="deep-tech">High Certainty</Badge>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ConfidenceGauge score={45} size={100} />
                                <Badge variant="destructive">Needs Review</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Typography & Design Tokens */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Design Tokens</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 font-mono text-sm">
                        <div className="flex items-center justify-between p-2 rounded bg-background border">
                            <span>--font-sans (Inter)</span>
                            <span className="font-sans">The quick brown fox</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-background border">
                            <span>--font-mono (JetBrains)</span>
                            <span className="font-mono">print("Hello World")</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge variant="deep-tech">Deep Tech Badge</Badge>
                            <div className="h-2 w-24 rounded-full animate-shine bg-slate-800"></div>
                        </div>
                    </CardContent>
                </Card>


                <Card className="glass-panel col-span-1 md:col-span-2 lg:col-span-1 border-blue-500/20">
                    <CardHeader>
                        <CardTitle>Execution Stream</CardTitle>
                        <CardDescription>Real-time telemetry from the agent swarm.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LiveLogViewer />
                    </CardContent>
                </Card>

                {/* Teaching Station - Full Width */}
                <div className="col-span-1 md:col-span-2">
                    <TeachingStation />
                </div>

                {/* Self Correction Workflow Demo */}
                <div className="col-span-1 md:col-span-2 border-t border-white/10 pt-8 mt-8">
                    <h2 className="text-xl font-bold mb-4">Integrated Workflow Demo</h2>
                    <SelfCorrectionWorkflow />
                </div>


            </div>
        </div>
    )
}
