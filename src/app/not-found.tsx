import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center space-y-8 max-w-lg">
                    {/* Glowing 404 */}
                    <div className="relative">
                        <h1 className="text-[10rem] font-bold leading-none tracking-tighter text-slate-800 select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-[10rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-50 select-none">
                                404
                            </h1>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-slate-200">
                            Page not found
                        </h2>
                        <p className="text-slate-400 text-base max-w-sm mx-auto">
                            The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            Let&apos;s get you back on track.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-transparent px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}
