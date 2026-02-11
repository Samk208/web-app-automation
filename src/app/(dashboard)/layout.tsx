import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, CircleUser, LayoutDashboard, Network, Package2, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { DEMO_ORG_ID } from "@/lib/org";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";



export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Auto-Join Logic for MVP
    // Check if user is a member of the demo org
    const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', DEMO_ORG_ID)
        .single();

    if (!membership) {
        // Join the demo org
        await supabase.from('memberships').insert({
            organization_id: DEMO_ORG_ID,
            user_id: user.id,
            role: 'owner' // Give them owner power for the demo
        });
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-muted/10">
            <div className="hidden border-r bg-background md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                            <Package2 className="h-6 w-6" />
                            <span>Agentic Systems</span>
                        </Link>
                    </div>
                    <div className="flex-1 py-4">
                        <nav className="grid items-start px-4 text-sm font-medium gap-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary transition-all hover:text-primary"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Overview
                            </Link>

                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                                Core Agents
                            </div>

                            <Link
                                href="/dashboard/business-plan-master"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <Package2 className="h-4 w-4" />
                                Business Plan Master
                            </Link>
                            <Link
                                href="/dashboard/grant-scout"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <Network className="h-4 w-4" />
                                Grant Scout
                            </Link>
                            <Link
                                href="/dashboard/global-merchant"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <Network className="h-4 w-4" />
                                Global Merchant
                            </Link>
                            <Link
                                href="/dashboard/safety-guardian"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Safety Guardian
                            </Link>

                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                                System
                            </div>

                            <Link
                                href="/dashboard/orchestrator"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <Activity className="h-4 w-4" />
                                Orchestrator Chat
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="border-t p-4">
                        <div className="rounded-lg bg-muted/50 p-4 text-xs">
                            <p className="font-semibold mb-1">Status: Operational</p>
                            <p className="text-muted-foreground">System v0.1.0-alpha</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold md:hidden">Overview</h1>
                        {/* Search can go here */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <form action="/auth/signout" method="post">
                                    <button className="w-full text-left">Logout</button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-10 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
