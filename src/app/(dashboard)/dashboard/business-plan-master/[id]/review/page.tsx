import { requireResourceAccess } from "@/lib/auth/authorization"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ReviewClient } from "./review-client"

export const metadata = {
    title: "Review Business Plan Draft",
}

interface PageProps {
    params: {
        id: string
    }
}

export default async function ReviewPage({ params }: PageProps) {
    // 1. Authorization
    const auth = await requireResourceAccess('business_plans', params.id)
    const supabase = await createClient()

    // 2. Fetch Plan Data
    const { data: plan, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', params.id)
        .eq('organization_id', auth.organizationId)
        .single()

    if (error || !plan) {
        notFound()
    }

    // 3. Status Guard
    // If status is not REVIEW_REQUIRED or COMPLETED, redirect to dashboard
    if (plan.status !== 'REVIEW_REQUIRED' && plan.status !== 'COMPLETED') {
        redirect('/dashboard/business-plan-master')
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Plan Review</h2>
            </div>
            <ReviewClient plan={plan} />
        </div>
    )
}
