"use client"

import { cn } from "@/lib/utils"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode
    description?: React.ReactNode
    children?: React.ReactNode
}

export function PageHeader({
    title,
    description,
    children,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("pt-8 pb-8 mb-8 border-b border-m3-outline-variant/15", className)} {...props}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col space-y-3 max-w-3xl">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    )
}
