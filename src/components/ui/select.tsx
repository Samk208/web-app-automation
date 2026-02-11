"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import * as React from "react"

// Simple mock implementation of Radix Select for build success
// In a real app, you'd install @radix-ui/react-select

const SelectContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
} | null>(null)

interface SelectProps {
    children: React.ReactNode
    onValueChange?: (value: string) => void
    value?: string
    defaultValue?: string
}

export const Select = ({ children, onValueChange, value: controlledValue, defaultValue }: SelectProps) => {
    const [value, setValue] = React.useState(defaultValue || "")
    const [open, setOpen] = React.useState(false)

    const handleValueChange = (v: string) => {
        setValue(v)
        if (onValueChange) onValueChange(v)
    }

    return (
        <SelectContext.Provider value={{ value: controlledValue || value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        const ctx = React.useContext(SelectContext)
        return (
            <button
                type="button"
                ref={ref}
                onClick={() => ctx?.setOpen(!ctx.open)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const ctx = React.useContext(SelectContext)
    return <span>{ctx?.value || placeholder}</span>
}

export const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx?.open) return null
    return (
        <div className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-slate-900 text-slate-100 shadow-md animate-in fade-in-80", className)}>
            <div className="p-1">{children}</div>
        </div>
    )
}

export const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
    const ctx = React.useContext(SelectContext)
    return (
        <div
            className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-800 focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-800", className)}
            onClick={() => {
                ctx?.onValueChange(value)
                ctx?.setOpen(false)
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {ctx?.value === value && <span className="text-emerald-500">✓</span>}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
}
