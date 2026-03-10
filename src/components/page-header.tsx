"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { M3_STAGGER_CONTAINER, M3_STAGGER_ITEM } from "@/lib/m3-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"

interface BreadcrumbStep {
    label: string
    href?: string
}

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode
    description?: React.ReactNode
    children?: React.ReactNode
    notInLayoutPx?: boolean
    variant?: "default" | "expressive"
    breadcrumbs?: BreadcrumbStep[]
    showBackButton?: boolean
    backHref?: string
    statusBadge?: React.ReactNode
    primaryAction?: React.ReactNode
    utilityContent?: React.ReactNode
}

export function PageHeader({
    title,
    description,
    children,
    className,
    notInLayoutPx = false,
    variant = "default",
    breadcrumbs,
    showBackButton = false,
    backHref = "..",
    statusBadge,
    primaryAction,
    utilityContent,
    ...props
}: PageHeaderProps) {
    const isExpressive = variant === "expressive"

    return (
        <div
            className={cn(
                "w-full flex flex-col justify-center relative",
                isExpressive ? "pt-6 pb-2" : "py-10",
                className
            )}
            {...props}
        >
            <motion.div
                className={cn("w-full mx-auto", !notInLayoutPx && "layout-px")}
                variants={isExpressive ? M3_STAGGER_CONTAINER : undefined}
                initial={isExpressive ? "hidden" : undefined}
                animate={isExpressive ? "visible" : undefined}
            >
                {/* MODULAR COMMAND CARD (M3 XL TOKENS) */}
                <div
                    className={cn(
                        "relative w-full transition-all duration-500",
                        isExpressive
                            ? "bg-m3-surface-container-low border border-m3-outline-variant/20 shadow-m3-1 rounded-[28px] overflow-hidden p-5 md:p-7"
                            : "bg-transparent"
                    )}
                >
                    <div className="flex flex-col gap-6">
                        {/* 1. TOP INFO STRIP (Compact) */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {(breadcrumbs || showBackButton) && (
                                <motion.div
                                    className="flex items-center gap-3 text-m3-on-surface-variant/40"
                                    variants={isExpressive ? M3_STAGGER_ITEM : undefined}
                                >
                                    {showBackButton && (
                                        <Link
                                            href={backHref}
                                            className="p-1 rounded-full hover:bg-m3-surface-variant/10 transition-colors text-m3-on-surface-variant/60 group"
                                        >
                                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                        </Link>
                                    )}

                                    {breadcrumbs && (
                                        <Breadcrumb>
                                            <BreadcrumbList className="text-[9px] font-black uppercase tracking-[0.2em]">
                                                {breadcrumbs.map((step, i) => (
                                                    <React.Fragment key={i}>
                                                        <BreadcrumbItem>
                                                            {step.href ? (
                                                                <BreadcrumbLink asChild>
                                                                    <Link href={step.href} className="hover:text-m3-primary transition-colors">{step.label}</Link>
                                                                </BreadcrumbLink>
                                                            ) : (
                                                                <BreadcrumbPage className="text-m3-on-surface/40">{step.label}</BreadcrumbPage>
                                                            )}
                                                        </BreadcrumbItem>
                                                        {i < breadcrumbs.length - 1 && <BreadcrumbSeparator className="opacity-10 scale-75" />}
                                                    </React.Fragment>
                                                ))}
                                            </BreadcrumbList>
                                        </Breadcrumb>
                                    )}
                                </motion.div>
                            )}

                            {statusBadge && isExpressive && (
                                <motion.div variants={isExpressive ? M3_STAGGER_ITEM : undefined}>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-m3-primary/5 border border-m3-primary/10">
                                        <div className="h-1 w-1 rounded-full bg-m3-primary animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-m3-primary/70">
                                            {statusBadge}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* 2. DASHBOARD WORKSPACE: Title (Compact) + Primary Tool */}
                        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                            <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-1">
                                <motion.h1
                                    className={cn(
                                        "font-black tracking-tight text-m3-on-surface uppercase",
                                        isExpressive
                                            ? "text-3xl md:text-4xl lg:text-5xl leading-[0.9]"
                                            : "text-3xl md:text-4xl"
                                    )}
                                    variants={isExpressive ? M3_STAGGER_ITEM : undefined}
                                >
                                    {title}
                                </motion.h1>

                                {description && (
                                    <motion.p
                                        className={cn(
                                            "text-m3-on-surface-variant/70 leading-relaxed max-w-lg font-medium",
                                            isExpressive ? "text-sm md:text-base" : "text-sm"
                                        )}
                                        variants={isExpressive ? M3_STAGGER_ITEM : undefined}
                                    >
                                        {description}
                                    </motion.p>
                                )}
                            </div>

                            <div className="lg:col-span-6 xl:col-span-5 w-full">
                                {primaryAction && (
                                    <motion.div
                                        className="w-full"
                                        variants={isExpressive ? M3_STAGGER_ITEM : undefined}
                                    >
                                        {primaryAction}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* 3. FUNCTIONAL STRIP: Tools + Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-m3-outline-variant/10">
                            <div className="flex flex-wrap items-center gap-2">
                                {utilityContent}
                            </div>

                            {children && (
                                <motion.div
                                    className="flex items-center justify-start sm:justify-end gap-3"
                                    variants={isExpressive ? M3_STAGGER_ITEM : undefined}
                                >
                                    {children}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
