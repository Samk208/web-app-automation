"use client"

import { approveBusinessPlan } from "@/actions/business-plan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

interface ReviewClientProps {
    plan: any
}

export function ReviewClient({ plan }: ReviewClientProps) {
    const [sections, setSections] = useState(plan.sections_generated || {})
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSectionChange = (category: string, field: string, value: string) => {
        setSections((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }))
    }

    const handleApprove = () => {
        startTransition(async () => {
            try {
                const result = await approveBusinessPlan(plan.id, sections)
                if (result.success) {
                    toast.success("Plan Approved", {
                        description: "Business plan approved and finalized successfully.",
                    })
                    // Refresh to show COMPLETED status
                    router.refresh()
                    router.push(`/dashboard/business-plan-master`)
                }
            } catch (error: any) {
                toast.error("Approval Failed", {
                    description: error.message || "Failed to approve plan.",
                })
            }
        })
    }

    // Helper to render editable fields for a section
    const renderFields = (category: string, fields: Record<string, string>) => {
        return Object.entries(fields).map(([key, value]) => (
            <div key={key} className="space-y-2 mb-4">
                <label className="text-sm font-medium capitalize text-muted-foreground">
                    {key.replace(/_/g, " ")}
                </label>
                <Textarea
                    value={value}
                    onChange={(e) => handleSectionChange(category, key, e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                />
            </div>
        ))
    }

    if (plan.status === 'COMPLETED') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Approved & Finalized
                    </CardTitle>
                    <CardDescription>
                        This plan has been approved. You can download the final document from the dashboard.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Review Draft</h2>
                    <p className="text-muted-foreground">
                        Review and edit the AI-generated content before finalizing.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finalizing...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Approve & Finalize
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="problem" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="problem">1. Problem</TabsTrigger>
                    <TabsTrigger value="solution">2. Solution</TabsTrigger>
                    <TabsTrigger value="scale_up">3. Scale-Up</TabsTrigger>
                    <TabsTrigger value="team">4. Team</TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Problem & Market</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sections.problem && renderFields("problem", sections.problem)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="solution" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Solution & Tech</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sections.solution && renderFields("solution", sections.solution)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="scale_up" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Model & Scale-up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sections.scale_up && renderFields("scale_up", sections.scale_up)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team & ESG</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sections.team && renderFields("team", sections.team)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
