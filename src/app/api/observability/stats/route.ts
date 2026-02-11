import { getCostAnalytics } from "@/lib/ai/cost-tracker"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

    if (!member) {
        return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    try {
        const stats = await getCostAnalytics(member.organization_id)
        return NextResponse.json(stats)
    } catch (error) {
        console.error("Failed to fetch observability stats", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
