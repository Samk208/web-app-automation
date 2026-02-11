import { cn } from "@/lib/utils"
import * as React from "react"

// Since I didn't install class-variance-authority, I'll allow myself to install it or just write plain logic.
// Plan said "framer-motion, clsx, tailwind-merge". It didn't mention CVA.
// I will rewrite this WITHOUT CVA to stick to the installed dependencies, using simple maps.

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "deep-tech"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "deep-tech": "border-transparent bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)] border border-indigo-500/20"
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
