import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Factory } from "lucide-react"
import Link from "next/link"
import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <Link href="/" className="flex items-center gap-2 text-primary">
                        <Factory className="h-8 w-8" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to access the console
                    </p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                        <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button formAction={login}>Sign In</Button>
                        <Button formAction={signup} variant="outline">Sign Up</Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        Note: For this MVP, verify your email if required by Supabase settings.
                    </p>
                </form>
            </div>
        </div>
    )
}
