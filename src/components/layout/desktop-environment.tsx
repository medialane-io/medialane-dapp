"use client"

import * as React from "react"
import { BottomNavBar } from "@/components/layout/dock"

export function DesktopEnvironment({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full relative overflow-x-hidden text-foreground selection:bg-m3-primary/20">
            {/* M3 Surface Background */}
            <div className="fixed inset-0 z-[-1] bg-m3-surface" />

            {/* Main Workspace Content */}
            <main className="relative z-10 w-full min-h-screen pb-24 lg:pb-0 pt-6 px-4 md:px-8 max-w-[1920px] mx-auto">
                {children}
            </main>

            {/* M3 Navigation Bar */}
            <BottomNavBar />
        </div>
    )
}
