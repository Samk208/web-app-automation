import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { PenTool } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 rounded-full bg-muted/20 mb-6">
                    <PenTool className="h-10 w-10 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="mb-4">Blog</Badge>
                <h1 className="text-3xl font-bold tracking-tight mb-4">Insights Coming Soon</h1>
                <p className="text-muted-foreground max-w-md">
                    Deep dives into agentic architectures and case studies are being written.
                </p>
            </main>
            <SiteFooter />
        </div>
    );
}
