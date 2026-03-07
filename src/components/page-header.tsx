"use client"

import { cn } from "@/lib/utils"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode
    description?: React.ReactNode
    children?: React.ReactNode
    notInLayoutPx?: boolean
}

export function PageHeader({
    title,
    description,
    children,
    className,
    notInLayoutPx = false,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("w-full flex flex-col justify-center py-10", className)} {...props}>
            <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-8", !notInLayoutPx && "layout-px")}>
                <div className="flex flex-col space-y-3.5 max-w-4xl">
                    <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-m3-on-surface">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex flex-shrink-0 items-center justify-start md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pb-1">
                        {children}
                    </div>
                )}
            </div>
        </div>
    )
}
