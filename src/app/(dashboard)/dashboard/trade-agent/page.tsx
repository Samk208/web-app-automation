"use client"

import { TeachingStation } from "@/components/features/TeachingStation"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Package, ShieldAlert } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Types matching our DB schema
type OrderStatus = 'PENDING' | 'ANALYZING' | 'BLOCKED' | 'APPROVED' | 'REJECTED'

interface Order {
    id: string
    customer_name: string
    item_description: string
    destination_country: string
    status: OrderStatus
    risk_score: number | null
    classification_result: any
}

export default function TradeAgentPage() {
    const supabase = createClient()
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    // Scroll logs to bottom
    const logsEndRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [logs])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-8))

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('trade-agent-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Change received!', payload)
                    if (payload.new && (payload.new as Order).id === currentOrder?.id) {
                        const updated = payload.new as Order
                        setCurrentOrder(updated)

                        // Log status changes
                        if (updated.status !== (payload.old as Order)?.status) {
                            addLog(`STATUS UPDATE: ${updated.status}`)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, currentOrder?.id])

    const startDemo = async () => {
        setLogs([])
        setIsProcessing(true)
        addLog("Initializing New Order Integration...")

        // 1. Create Order in DB
        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_name: "Hanwha Ocean",
                item_description: "Pro-Spec BLDC Motor 1000kV",
                destination_country: "South Korea",
                status: 'ANALYZING',
                risk_score: 0.1 // Start low
            })
            .select()
            .single()

        if (error) {
            addLog(`ERR: Failed to create order: ${error.message}`)
            return
        }

        if (data) {
            setCurrentOrder(data as Order)
            addLog(`Order #${data.id.slice(0, 8)} created.`)
            addLog("Agent 'Compliance_Bot_01' assigned.")

            // Simulate Agent "Thinking" Time (in a real app, this would be a server-side Edge Function)
            setTimeout(async () => {
                addLog("WARN: Flagged as Dual-Use Item (Category 8, Aerospace).")

                await supabase
                    .from('orders')
                    .update({
                        status: 'BLOCKED',
                        risk_score: 0.65
                    })
                    .eq('id', data.id)
            }, 4000)
        }
    }

    const handleHumanResolution = async () => {
        if (!currentOrder) return

        addLog("Human Operator provided classification override.")
        addLog("Resuming workflow...")

        // Update DB
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'APPROVED',
                risk_score: 0.05,
                classification_result: { hs_code: "8501.31.0000", rationale: "Civilian use verified" }
            })
            .eq('id', currentOrder.id)

        if (error) addLog(`ERR: ${error.message}`)
    }

    const resetDemo = () => {
        setCurrentOrder(null)
        setIsProcessing(false)
        setLogs([])
    }

    // UI Derived State
    const step = currentOrder?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-indigo-500/30 text-indigo-400">Blueprint #1</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Compliance Guardian: Export Control
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Real-time Supabase Integration.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        Reset Demo
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Order Context */}
                <div className="space-y-6">
                    <Card className="bg-black/40 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-400" />
                                Incoming Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID:</span>
                                    <span className="font-mono">{currentOrder ? `#${currentOrder.id.slice(0, 6)}` : "waiting..."}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span>Hanwha Ocean</span>
                                </div>
                                <div className="border-t border-slate-800 my-2 pt-2">
                                    <span className="text-xs text-muted-foreground uppercase">Line Item</span>
                                    <p className="font-medium text-white">Pro-Spec BLDC Motor 1000kV</p>
                                    <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        High RPM Component
                                    </p>
                                </div>
                            </div>

                            {step === 'IDLE' && (
                                <Button onClick={startDemo} className="w-full bg-indigo-600 hover:bg-indigo-500">
                                    Start Simulation <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Logs */}
                    <Card className="bg-black/40 border-slate-800 h-[300px] overflow-hidden flex flex-col">
                        <CardHeader className="py-3 px-4 border-b border-white/5">
                            <CardTitle className="text-xs font-mono text-muted-foreground uppercase">System Logs (Public Schema)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 font-mono text-xs space-y-1 text-green-400/80 flex-1 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                            <div ref={logsEndRef} />
                        </CardContent>
                    </Card>
                </div>

                {/* MIDDLE & RIGHT: Agent Workflow */}
                <div className="lg:col-span-2 space-y-6">

                    <AnimatePresence mode="wait">
                        {step === "ANALYZING" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key="analyzing"
                            >
                                <ThinkingProcess />
                            </motion.div>
                        )}

                        {step === "BLOCKED" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                                key="blocked"
                                className="space-y-6"
                            >
                                <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/30 flex items-start gap-4">
                                    <ShieldAlert className="h-6 w-6 text-red-400 mt-1" />
                                    <div>
                                        <h3 className="text-red-400 font-bold">Compliance Concept Drift Detected</h3>
                                        <p className="text-sm text-red-200/70 mt-1">
                                            RLS Policy flagged risk score {currentOrder?.risk_score} (Threshold: 0.50).
                                            Database state locked until verification.
                                        </p>
                                    </div>
                                </div>

                                <TeachingStation
                                    onResolved={handleHumanResolution}
                                />
                            </motion.div>
                        )}

                        {step === "APPROVED" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 space-y-4"
                            >
                                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Workflow Completed</h2>
                                <p className="text-muted-foreground">
                                    Item classified as <strong>EAR99 (Verified)</strong>.<br />
                                    Record persisted to Supabase `orders` table.
                                </p>
                                <div className="flex justify-center gap-4 pt-4">
                                    <Button variant="outline" className="border-slate-700" onClick={resetDemo}>
                                        Run Next Order
                                    </Button>
                                    <Button variant="secondary" className="gap-2">
                                        <FileText className="h-4 w-4" /> View Documents
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === "IDLE" && (
                        <div className="h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
                            Waiting to start simulation...
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
