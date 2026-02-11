"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface LogEntry {
    id: string
    timestamp: string
    level: "INFO" | "WARN" | "ERROR" | "EXEC" | "DEBUG"
    message: string
}

interface LiveLogViewerProps {
    className?: string
    variant?: "default" | "matrix"
}

export function LiveLogViewer({ className, variant = "default" }: LiveLogViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    // Mock data generator
    useEffect(() => {
        const events = [
            { level: "INFO", msg: "Initializing agent runtime environment..." },
            { level: "DEBUG", msg: "Loading context from vector store: shard_01" },
            { level: "EXEC", msg: "Tool call: search_web(query='latest custom regulations')" },
            { level: "INFO", msg: "Retrieved 12 documents. Relevance score: 0.89" },
            { level: "EXEC", msg: "Analyzing document structure..." },
            { level: "WARN", msg: "Ambiguous entity detected: 'Product X'. Requesting clarification." },
            { level: "INFO", msg: "Human feedback received. Resuming." },
            { level: "EXEC", msg: "Generating final report..." },
            { level: "INFO", msg: "Task completed successfully." }
        ] as const

        let i = 0
        const interval = setInterval(() => {
            const event = events[i % events.length]
            const newLog: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString().split('T')[1].split('.')[0],
                level: event.level,
                message: event.msg
            }

            setLogs(prev => [...prev.slice(-20), newLog]) // Keep last 20
            i++
        }, 1200)

        return () => clearInterval(interval)
    }, [])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const getLevelColor = (level: LogEntry['level']) => {
        switch (level) {
            case "INFO": return "text-blue-400"
            case "WARN": return "text-amber-400"
            case "ERROR": return "text-red-400"
            case "EXEC": return "text-emerald-400"
            case "DEBUG": return "text-slate-500"
            default: return "text-white"
        }
    }

    return (
        <div className={cn(
            "rounded-xl border bg-[#0d1117] overflow-hidden font-mono text-xs shadow-2xl",
            variant === "matrix" ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-slate-800",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <span className="text-slate-500 ml-2">live_stream.log</span>
                </div>
                <div className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                    variant === "matrix" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                )}>
                    Live
                </div>
            </div>

            {/* Log Stream */}
            <div
                ref={scrollRef}
                className="h-64 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-opacity-90"
            >
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-2 transition-colors">
                        <span className="text-slate-600 shrink-0 select-none">{log.timestamp}</span>
                        <span className={cn("font-bold w-12 shrink-0 select-none", getLevelColor(log.level))}>
                            {log.level}
                        </span>
                        <span className={cn("break-all", variant === "matrix" && "text-emerald-300 drop-shadow-[0_0_2px_rgba(110,231,183,0.5)]")}>
                            {log.message}
                        </span>
                    </div>
                ))}
                {/* Typing cursor effect */}
                <div className="animate-pulse w-2 h-4 bg-slate-500 mt-2" />
            </div>
        </div>
    )
}
