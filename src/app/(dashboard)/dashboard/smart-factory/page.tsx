"use client"

import { processSafetyLog } from "@/actions/safety-guardian"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEMO_ORG_ID } from "@/lib/org"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Activity, Factory, Gauge, ShieldCheck, Siren } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SafetyLog {
    id: string
    timestamp: string
    factory_zone: string
    sensor_type: string
    reading_value: number
    status: 'NORMAL' | 'WARNING' | 'CRITICAL'
    compliance_note: string
}

export default function SmartFactoryPage() {
    const supabase = createClient()
    const [safetyLogs, setSafetyLogs] = useState<SafetyLog[]>([])
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [systemStatus, setSystemStatus] = useState<'SAFE' | 'ALERT'>('SAFE')
    const [orgId, setOrgId] = useState<string | null>(null)

    // We'll simulate a stream here since we don't have real IoT sensors connected
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Subscribe to real inserts (which we will simulate via simulated API calls or local mock)
        const channel = supabase
            .channel('factory-demo')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'safety_logs' },
                (payload) => {
                    const newLog = payload.new as SafetyLog
                    setSafetyLogs(prev => [newLog, ...prev].slice(0, 10))
                    if (newLog.status === 'CRITICAL') setSystemStatus('ALERT')
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [supabase])

    useEffect(() => {
        const loadOrg = async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const userId = sessionData.session?.user?.id
            if (userId) {
                const { data: membership } = await supabase
                    .from('memberships')
                    .select('organization_id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .single()
                if (membership?.organization_id) {
                    setOrgId(membership.organization_id)
                    return
                }
            }
            setOrgId(DEMO_ORG_ID)
        }
        loadOrg()
    }, [supabase])

    const toggleMonitoring = () => {
        if (isMonitoring) {
            setIsMonitoring(false)
            setSystemStatus('SAFE')
            if (intervalRef.current) clearInterval(intervalRef.current)
        } else {
            setIsMonitoring(true)
            // Start simulated stream
            intervalRef.current = setInterval(async () => {
                const isCritical = Math.random() > 0.8
                const temp = isCritical ? 85 + Math.random() * 20 : 40 + Math.random() * 10

                // For normal readings, we just update local state to show "Real-time" effect
                // For CRITICAL readings, we invoke the AI Agent to perform a "Compliance Audit"

                if (isCritical) {
                    try {
                        if (!orgId) throw new Error("No organization context")
                        await processSafetyLog('TEMP', parseFloat(temp.toFixed(1)), 'Zone-A (Compressor)', { organizationId: orgId })
                        // The real-time subscription will catch the insert and update the UI
                    } catch {
                        setSystemStatus('ALERT')
                    }
                } else {
                    // Visualize normal data flow without DB spam (optional, or insert simple logs)
                    // For demo purposes, we might want to insert EVERYTHING if we want a full chart, 
                    // but to save quota/latency, let's just let the AI handle the criticals, 
                    // and maybe insert "Normal" logs via standard supabase client if needed.
                    // For this verification, we rely on the Agent log appearing.
                }
            }, 2000)
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-red-500/30 text-red-400">Blueprint #8</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-100 to-red-500 text-shadow-red">
                        Safety Guardian
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Industrial IoT Agent: Compliance logging for Smart Factories.
                    </p>
                </div>
                <Button
                    variant={isMonitoring ? "destructive" : "default"}
                    onClick={toggleMonitoring}
                    className={isMonitoring ? "animate-pulse" : "bg-red-600 hover:bg-red-500"}
                >
                    {isMonitoring ? "Stop Monitoring" : "Start Live Stream"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Live Dashboard */}
                <div className="space-y-6">
                    <Card className={`bg-black/40 border-slate-800 transition-all duration-500 ${systemStatus === 'ALERT' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-400" />
                                Real-Time Sensor Stream
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-800 mb-6">
                                {isMonitoring ? (
                                    <div className="text-center">
                                        <Gauge className={`h-24 w-24 mx-auto mb-4 transition-colors duration-300 ${systemStatus === 'ALERT' ? 'text-red-500' : 'text-emerald-500'}`} />
                                        <div className="text-4xl font-mono font-bold text-white mb-2">
                                            {safetyLogs[0]?.reading_value || 42.0}°C
                                        </div>
                                        <div className="text-sm text-muted-foreground">Zone A: Compressor Temp</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-600 flex flex-col items-center">
                                        <Factory className="h-16 w-16 mb-2 opacity-20" />
                                        <p>System Offline</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                    <div className="text-xs text-slate-400">Active Sensors</div>
                                    <div className="text-2xl font-bold text-white">48/50</div>
                                </div>
                                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                    <div className="text-xs text-slate-400">Compliance Rate Daily</div>
                                    <div className="text-2xl font-bold text-emerald-400">99.8%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Log */}
                <Card className="bg-black/40 border-slate-800 h-full max-h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-red-400" />
                            Compliance Audit Trail
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            <AnimatePresence initial={false}>
                                {safetyLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded border text-sm ${log.status === 'CRITICAL'
                                            ? 'bg-red-950/30 border-red-500/50 text-red-200'
                                            : 'bg-slate-900/50 border-slate-800 text-slate-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-mono text-xs opacity-70">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            {log.status === 'CRITICAL' && <Siren className="h-4 w-4 text-red-500 animate-pulse" />}
                                        </div>
                                        <div className="font-bold mb-1">{log.sensor_type}: {log.reading_value}°C</div>
                                        <div className="text-xs opacity-80 italic">{log.compliance_note}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {safetyLogs.length === 0 && (
                                <div className="text-center text-slate-600 mt-20">
                                    <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No incidents recorded today.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
