import { Button } from "@/components/ui/button";
import { Factory } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Factory className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight">Agentic Systems</span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
                        Documentation
                    </Link>
                    <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                        Blog
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                        Console
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Link href="/dashboard">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
