"use client"

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Database, GitBranch, Lock, ShieldCheck, Zap } from "lucide-react";

const features = [
    {
        icon: GitBranch,
        title: "Orchestration Engine",
        description: "Design complex workflows DAGs. Handle parallelism, conditional branching, and error recovery natively.",
        color: "text-blue-400",
        border: "group-hover:border-blue-500/50",
        bg: "group-hover:bg-blue-500/10"
    },
    {
        icon: ShieldCheck,
        title: "Human-in-the-Loop",
        description: "Agents shouldn't run unchecked. Insert 'Approval' nodes to pause execution until a human reviews the output.",
        color: "text-emerald-400",
        border: "group-hover:border-emerald-500/50",
        bg: "group-hover:bg-emerald-500/10"
    },
    {
        icon: Activity,
        title: "Live Observability",
        description: "Watch your agents think in real-time. Full execution traces, token usage, and latency metrics for every step.",
        color: "text-amber-400",
        border: "group-hover:border-amber-500/50",
        bg: "group-hover:bg-amber-500/10"
    },
    {
        icon: Database,
        title: "State Persistence",
        description: "Every workflow run is stored in your database. Pause a run today, resume it next week. Zero state loss.",
        color: "text-purple-400",
        border: "group-hover:border-purple-500/50",
        bg: "group-hover:bg-purple-500/10"
    },
    {
        icon: Zap,
        title: "Instant Triggers",
        description: "Launch agents via Webhooks, Schedules (Cron), or direct API calls from your existing backend.",
        color: "text-cyan-400",
        border: "group-hover:border-cyan-500/50",
        bg: "group-hover:bg-cyan-500/10"
    },
    {
        icon: Lock,
        title: "Enterprise Security",
        description: "Role-Based Access Control (RBAC), API Key management, and full audit logs for every action.",
        color: "text-red-400",
        border: "group-hover:border-red-500/50",
        bg: "group-hover:bg-red-500/10"
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function FeaturesPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-indigo-500/30">
            <SiteHeader />
            <main className="flex-1 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />

                <div className="container py-24 px-4 sm:px-8 mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto text-center mb-20"
                    >
                        <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                            Deep Tech Capabilities
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            The OS for Autonomous Agents
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We provide the chassis, engine, and safety systems. <br className="hidden sm:block" />
                            You just provide the <span className="text-indigo-400 font-mono">driver</span>.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
                    >
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className={cn(
                                    "group p-1 rounded-2xl bg-gradient-to-b from-white/5 to-white/0 hover:from-indigo-500/20 hover:to-indigo-500/5 transition-all duration-300"
                                )}
                            >
                                <div className={cn(
                                    "h-full flex flex-col gap-4 p-6 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm transition-colors duration-300 relative overflow-hidden",
                                    feature.border
                                )}>
                                    {/* Hover Glow Effect */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                                        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"
                                    )} />

                                    <div className={cn(
                                        "h-12 w-12 rounded-lg flex items-center justify-center transition-colors duration-300",
                                        "bg-white/5 group-hover:bg-white/10",
                                        feature.color
                                    )}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground group-hover:text-slate-300 transition-colors leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mt-32 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/50 to-slate-950/50 p-12 text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl font-bold text-white">Ready to deploy?</h2>
                            <p className="text-slate-300 text-lg">
                                Start building autonomous workflows today. 14-day free trial, no credit card required.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="bg-white text-black hover:bg-slate-200 w-full sm:w-auto">
                                    Start Building <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/5 hover:text-white w-full sm:w-auto">
                                    Read Documentation
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
