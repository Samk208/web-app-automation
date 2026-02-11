import { WelcomeChat } from "@/components/agents/WelcomeChat";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { Activity, Users } from "lucide-react";

// Demo Org ID
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000002';

export default async function DashboardPage() {
    const supabase = await createClient()

    // Parallel Data Fetching
    const [
        { count: systemsCount },
        { count: pipelinesCount }, // Using 'agent_systems' as proxy for pipelines/workflows for now or separate query
        { count: runsCount }
    ] = await Promise.all([
        supabase.from('agent_systems').select('*', { count: 'exact', head: true }).eq('organization_id', DEMO_ORG_ID),
        supabase.from('workflow_definitions').select('*', { count: 'exact', head: true }).eq('organization_id', DEMO_ORG_ID),
        supabase.from('workflow_runs').select('*', { count: 'exact', head: true }).eq('organization_id', DEMO_ORG_ID)
    ])

    // hardcoding pending for now as we don't have seeded pending runs
    const pendingCount = 0;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
                        <p className="text-muted-foreground mt-2">Start with a natural language request, then drill into specific agents and systems.</p>
                    </div>
                    <Button>Create New System</Button>
                </div>
                <WelcomeChat />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Card 1 */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Systems</h3>
                        <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{systemsCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Operational</p>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Pending Approvals</h3>
                        <Users className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-orange-600 font-medium">Requires attention</p>
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Runs</h3>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{runsCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime executions</p>
                    </div>
                </div>

                {/* Metric Card 4 */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Workflow Definitions</h3>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{pipelinesCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Templates available</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border border-dashed rounded-lg">
                        No recent activity logged.
                    </div>
                </div>
            </div>
        </div>
    )
}
