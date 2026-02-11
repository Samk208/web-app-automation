import * as React from "react"

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block text-left">{children}</div>
export const DropdownMenuTrigger = ({ asChild, children }: any) => <>{children}</>
export const DropdownMenuContent = ({ children }: any) => <div className="hidden">{children}</div>
export const DropdownMenuItem = ({ children }: any) => <div>{children}</div>
export const DropdownMenuLabel = ({ children }: any) => <div>{children}</div>
export const DropdownMenuSeparator = () => <hr />
