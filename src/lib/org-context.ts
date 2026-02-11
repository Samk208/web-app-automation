import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_ORG_ID, OrgContext } from "./org";

// Fetch active org for the signed-in user. Falls back to DEMO_ORG_ID.
export async function getActiveOrg(): Promise<OrgContext> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // ignore for server components
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { organization_id: DEMO_ORG_ID };

    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

    if (membership?.organization_id) {
        return { organization_id: membership.organization_id, role: membership.role };
    }

    return { organization_id: DEMO_ORG_ID };
}

