"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, Database, FileText, Globe, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

// Mock Node Data
const NODES = [
    { id: "trigger", type: "trigger", x: 50, y: 150, icon: MessageSquare, label: "Inbound Email" },
    { id: "analyze", type: "agent", x: 250, y: 150, icon: Bot, label: "Intent Classifier" },
    { id: "research", type: "agent", x: 450, y: 50, icon: Globe, label: "Researcher" },
    { id: "db", type: "tool", x: 450, y: 250, icon: Database, label: "CRM Lookup" },
    { id: "draft", type: "agent", x: 650, y: 150, icon: FileText, label: "Drafter" },
    { id: "send", type: "tool", x: 850, y: 150, icon: Mail, label: "Send Reply" },
];

const EDGES = [
    { from: "trigger", to: "analyze" },
    { from: "analyze", to: "research" },
    { from: "analyze", to: "db" },
    { from: "research", to: "draft" },
    { from: "db", to: "draft" },
    { from: "draft", to: "send" },
];

export function WorkflowVisualizer({ className }: { className?: string }) {
    const [activeNode, setActiveNode] = useState<string | null>(null);

    return (
        <div className={cn("relative w-full h-[400px] border border-slate-800 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl", className)}>

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            {/* SVG Layer for Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {EDGES.map((edge, i) => {
                    const start = NODES.find(n => n.id === edge.from)!;
                    const end = NODES.find(n => n.id === edge.to)!;

                    return (
                        <g key={`${edge.from}-${edge.to}`}>
                            {/* Base Line */}
                            <path
                                d={`M ${start.x + 40} ${start.y + 40} C ${start.x + 100} ${start.y + 40}, ${end.x - 100} ${end.y + 40}, ${end.x} ${end.y + 40}`}
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="2"
                            />
                            {/* Animated Token Pulse */}
                            <motion.circle
                                r="3"
                                fill="#3b82f6"
                                initial={{ offsetDistance: "0%" }}
                                animate={{
                                    offsetDistance: "100%",
                                    opacity: [0, 1, 0]
                                }}
                                style={{ offsetPath: `path("M ${start.x + 40} ${start.y + 40} C ${start.x + 100} ${start.y + 40}, ${end.x - 100} ${end.y + 40}, ${end.x} ${end.y + 40}")` }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: i * 0.5
                                }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Nodes Layer */}
            <div className="absolute inset-0">
                {NODES.map((node) => (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", delay: Math.random() * 0.5 }}
                        className="absolute cursor-pointer"
                        style={{ left: node.x, top: node.y }}
                        onClick={() => setActiveNode(node.id)}
                    >
                        <div className={cn(
                            "relative w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 group",
                            activeNode === node.id
                                ? "bg-slate-800 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110 z-10"
                                : "bg-[#111] border-slate-700 hover:border-slate-500 hover:bg-slate-900"
                        )}>
                            <node.icon className={cn(
                                "h-8 w-8 transition-colors",
                                node.type === "agent" ? "text-purple-400" :
                                    node.type === "tool" ? "text-yellow-400" : "text-blue-400"
                            )} />
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{node.label}</span>

                            {/* Status Dot */}
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[#111]" />
                        </div>

                        {/* Popover Detail (Simple) */}
                        {activeNode === node.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-24 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 p-3 rounded-lg z-20 shadow-xl"
                            >
                                <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                                    <node.icon className="h-4 w-4 text-slate-400" />
                                    <span className="font-bold text-xs text-white">{node.label}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>Status</span>
                                        <span className="text-green-400">Idle</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>Model</span>
                                        <span className="text-slate-300">GPT-4-Turbo</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>Tools</span>
                                        <span className="text-slate-300">3</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Controls Mockup */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="h-8 px-3 rounded bg-slate-800 border border-slate-700 flex items-center text-xs text-slate-300">+</div>
                <div className="h-8 px-3 rounded bg-slate-800 border border-slate-700 flex items-center text-xs text-slate-300">-</div>
            </div>
        </div>
    );
}
