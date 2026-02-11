import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ReviewInterface } from "./review-interface"

export default async function GrantReviewPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: application, error } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !application) {
        notFound()
    }

    // Security check: Ensure the user belongs to the organization
    // (In a real app, we would do a stricter join check, relying on RLS here for demo simplicity)

    if (application.status !== 'REVIEW_REQUIRED' && application.status !== 'COMPLETED') {
        // If it's still analyzing or failed, show a different state? 
        // For now, we assume this page is accessed via a notification for review.
    }

    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Proprosal Review (HITL)</h1>
                <p className="text-muted-foreground mt-2">
                    Review and edit the AI-generated grant proposal before final submission.
                    <br />
                    <span className="text-sm rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 mt-1 inline-block">
                        Status: {application.status}
                    </span>
                </p>
            </div>

            <ReviewInterface
                applicationId={application.id}
                initialDraft={application.generated_draft || ""}
                matchedPrograms={application.matched_programs || []}
            />
        </div>
    )
}
