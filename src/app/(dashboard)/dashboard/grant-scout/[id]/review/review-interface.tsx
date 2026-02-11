"use client"

import { approveGrantDraft } from "@/actions/grant-scout"; // We need to create this
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface ReviewInterfaceProps {
    applicationId: string
    initialDraft: string
    matchedPrograms: any[]
}

export function ReviewInterface({ applicationId, initialDraft, matchedPrograms }: ReviewInterfaceProps) {
    const [draft, setDraft] = useState(initialDraft)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleApprove = async () => {
        setIsSubmitting(true)
        try {
            const result = await approveGrantDraft(applicationId, draft)
            if (result.success) {
                toast.success("Draft approved successfully! HWP generation queued.")
                router.push("/dashboard/grant-scout")
            } else {
                toast.error("Failed to approve draft: " + result.error)
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Matched Program
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {matchedPrograms.length > 0 ? (
                        <div className="space-y-4">
                            {matchedPrograms.map((program: any, idx: number) => (
                                <div key={idx} className="p-4 border rounded-lg bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-lg">{program.name}</h3>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
                                            Fit Score: {program.fit_score}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{program.reason}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No specific program matched.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Edit Proposal Draft
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="min-h-[500px] font-mono text-sm leading-relaxed"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleApprove} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                    {isSubmitting ? "Finalizing..." : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Generate HWP
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
