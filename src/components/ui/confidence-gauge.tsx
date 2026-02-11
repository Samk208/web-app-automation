"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ConfidenceGaugeProps {
    score: number
    className?: string
    size?: number
    strokeWidth?: number
}

export function ConfidenceGauge({
    score,
    className,
    size = 64,
    strokeWidth = 6,
}: ConfidenceGaugeProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference

    // Determine color based on score "active learning" logic
    // High confidence = Standard Blue/Green
    // Low confidence = Warning Amber (needs human review)
    const colorClass =
        score >= 90 ? "text-emerald-400" :
            score >= 70 ? "text-indigo-400" :
                "text-amber-400"

    const glowClass =
        score >= 90 ? "shadow-emerald-500/20" :
            score >= 70 ? "shadow-indigo-500/20" :
                "shadow-amber-500/20"

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-slate-800"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <motion.circle
                    className={cn("transition-colors duration-500", colorClass)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>

            {/* Text Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-sm font-bold font-mono tracking-tighter", colorClass)}>
                    {score}%
                </span>
            </div>

            {/* Glow Effect Layer */}
            <div className={cn("absolute inset-0 rounded-full blur-xl opacity-20", glowClass, "bg-current")} />
        </div>
    )
}
