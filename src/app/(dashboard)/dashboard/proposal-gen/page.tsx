"use client"

import { getActiveOrg } from "@/actions/org-context"
import { processProposal } from "@/actions/proposal"
import { ThinkingProcess } from "@/components/features/ThinkingProcess"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import { Building, FileText, PenTool, Send, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import { toast } from "sonner"

type ProposalStatus = 'RESEARCHING' | 'DRAFTING' | 'COMPLETED'

interface Proposal {
    id: string
    status: ProposalStatus
    scraped_brand_voice: any
    retrieved_knowledge: any
    generated_content: string
}

export default function ProposalGenPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProposalGenContent />
        </Suspense>
    )
}

function ProposalGenContent() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const proposalIdFromUrl = searchParams.get('id')
    const [proposal, setProposal] = useState<Proposal | null>(null)
    const [clientUrl, setClientUrl] = useState("")
    const [scope, setScope] = useState("")
    const [logs, setLogs] = useState<string[]>([])
    const [isAccepting, setIsAccepting] = useState(false)

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))

    useEffect(() => {
        if (proposalIdFromUrl && !proposal) {
            const fetchProposal = async () => {
                const { data, error } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('id', proposalIdFromUrl)
                    .single()
                
                if (data && !error) {
                    setProposal(data as any)
                    addLog("Loaded existing proposal from Orchestrator.")
                }
            }
            fetchProposal()
        }
    }, [proposalIdFromUrl, supabase, proposal])

    useEffect(() => {
        const channel = supabase
            .channel('proposal-demo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'proposals' },
                (payload) => {
                    if (payload.new && (payload.new as Proposal).id === proposal?.id) {
                        setProposal(payload.new as Proposal)
                    }
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [supabase, proposal?.id])

    const generateProposal = async () => {
        if (!clientUrl || !scope) return
        setLogs([])
        addLog(`Analyzing Client: ${clientUrl}...`)

        const { organization_id } = await getActiveOrg()

        const { data } = await supabase
            .from('proposals')
            .insert({
                client_url: clientUrl,
                project_scope: scope,
                status: 'RESEARCHING',
                organization_id
            })
            .select()
            .single()

        if (data) {
            setProposal(data)
            addLog("Job Created. Files queued.")

            try {
                addLog("RAG: Retrieving case studies from Vector DB...")
                // Call Server Action
                await processProposal(data.id)
                addLog("WRITER: Markdown proposal generated.")
            } catch (error: any) {
                addLog(`ERROR: ${error.message}`)
                console.error(error)
            }
        }
    }

    const acceptProposal = async () => {
        if (!proposal) return
        setIsAccepting(true)
        try {
            const res = await fetch(`/api/proposals/${proposal.id}/accept`, { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("Deal Closed! Invoice sent to client.")
            // Ideally redirect to Stripe Portal or show success state
        } catch (err: any) {
            toast.error(err.message || "Failed to accept proposal")
        } finally {
            setIsAccepting(false)
        }
    }

    const resetDemo = () => {
        setProposal(null)
        setLogs([])
        setClientUrl("")
        setScope("")
    }

    const step = proposal?.status || 'IDLE'

    return (
        <div className="container mx-auto p-8 max-w-6xl text-slate-200">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Badge variant="outline" className="mb-2 border-purple-500/30 text-purple-400">Blueprint #6</Badge>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-purple-500">
                        Proposal Architect
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Consulting Automation: RAG-Powered RFP Response Writer.
                    </p>
                </div>
                {step !== 'IDLE' && (
                    <Button variant="ghost" onClick={resetDemo} className="text-slate-500 hover:text-white">
                        <Sparkles className="mr-2 h-4 w-4" /> New Proposal
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Column */}
                <Card className="bg-black/40 border-slate-800 lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-purple-400" />
                            Project Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Client Website</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="https://client-corp.com"
                                    className="bg-slate-900 border-slate-700 pl-9"
                                    value={clientUrl}
                                    onChange={(e) => setClientUrl(e.target.value)}
                                    disabled={step !== 'IDLE'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Scope / Requirements</Label>
                            <Textarea
                                placeholder="- Cloud Migration&#10;- 3 Month Timeline&#10;- Budget: $50k"
                                className="bg-slate-900 border-slate-700 h-32"
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                disabled={step !== 'IDLE'}
                            />
                        </div>

                        <Button
                            onClick={generateProposal}
                            disabled={step !== 'IDLE' || !clientUrl || !scope}
                            className="w-full bg-purple-600 hover:bg-purple-500"
                        >
                            Generate Proposal <Send className="ml-2 h-4 w-4" />
                        </Button>

                        {logs.length > 0 && (
                            <div className="mt-4 p-3 bg-black/50 rounded-lg font-mono text-xs text-purple-400/80 space-y-1">
                                {logs.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Output Column */}
                <div className="lg:col-span-2 relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {(step === 'RESEARCHING' || step === 'DRAFTING') && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-xl"
                            >
                                <ThinkingProcess />
                            </motion.div>
                        )}

                        {proposal?.status === 'COMPLETED' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 text-slate-900 rounded-xl p-8 shadow-2xl h-full overflow-y-auto"
                            >
                                <div className="prose prose-slate max-w-none">
                                    <ReactMarkdown>{proposal.generated_content}</ReactMarkdown>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">Tone: {proposal.scraped_brand_voice.tone}</Badge>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">RAG Sources: {proposal.retrieved_knowledge.length}</Badge>
                                    </div>
                                    <Button variant="outline" size="sm">Download PDF</Button>
                                    <Button size="sm" onClick={acceptProposal} disabled={isAccepting} className="bg-green-600 hover:bg-green-500 text-white">
                                        {isAccepting ? "Processing..." : "Accept & Start Project"}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            step === 'IDLE' && (
                                <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <FileText className="h-16 w-16 opacity-20" />
                                    <p>Enter project details to generate a draft</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
