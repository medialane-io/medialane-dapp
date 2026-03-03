"use client"

import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
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
        <div className={cn("pt-24 pb-8 mb-8 border-b border-border/10", className)} {...props}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col space-y-3 max-w-3xl">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground/90">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
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
