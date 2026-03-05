"use client"

import * as React from "react"
import { BottomNavBar } from "@/components/layout/dock"

export function DesktopEnvironment({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full relative overflow-x-hidden text-foreground selection:bg-m3-primary/20">
            {/* M3 Surface Background with Ambient Premium Highlights */}
            <div className="fixed inset-0 z-[-1] bg-m3-surface">
                {/* Subtle Navy/Mauve radial glows in corners to break up flatness */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
            </div>

            {/* Main Workspace Content */}
            <main className="relative z-10 w-full min-h-screen pb-24 lg:pb-0 pt-6 px-4 md:px-8 max-w-[1920px] mx-auto">
                {children}
            </main>

            {/* M3 Navigation Bar */}
            <BottomNavBar />
        </div>
    )
}
