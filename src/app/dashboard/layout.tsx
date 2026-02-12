import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Protects /dashboard/* routes that live outside the (dashboard) route group.
 * If you're adding new dashboard pages, prefer placing them in src/app/(dashboard)/dashboard/ instead.
 */
export default async function ProtectedDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return <>{children}</>;
}
