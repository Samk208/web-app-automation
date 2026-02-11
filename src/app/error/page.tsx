'use client'

import { useSearchParams } from "next/navigation"

export default function ErrorPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('message')

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-50">
            <div className="w-full max-w-md space-y-4 rounded-lg border border-red-900 bg-red-950/20 p-6 text-center">
                <h2 className="text-xl font-bold text-red-500">Authentication Error</h2>
                <p className="text-sm text-slate-300">
                    Something went wrong during the authentication process.
                </p>
                <div className="rounded bg-black/50 p-2 text-xs font-mono text-red-200">
                    {error || "An unknown error occurred. Please check your Supabase connection."}
                </div>
                <a
                    href="/login"
                    className="inline-block rounded bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
                >
                    Try Again
                </a>
            </div>
        </div>
    )
}
