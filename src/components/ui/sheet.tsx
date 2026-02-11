import * as React from "react"

export const Sheet = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SheetTrigger = ({ asChild, children }: any) => <>{children}</>
export const SheetContent = ({ children }: any) => <div className="hidden">{children}</div>
