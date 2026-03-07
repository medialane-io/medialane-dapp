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
        <div className={cn("w-full pt-20 md:pt-28 pb-10 md:pb-14", className)} {...props}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
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
