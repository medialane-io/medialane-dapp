"use client"

import Link from "next/link"
import { Github, Twitter, Send, Globe, Command } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Logo } from "@/components/header/logo"
import { navigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function Footer() {
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer
      className={cn(
        "w-full border-t z-40 transition-all duration-500",
        "bg-transparent backdrop-blur-xl shadow-glass border-white/5 dark:border-white/10"
      )}
      role="contentinfo"
      aria-label="Medialane Footer"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-20 py-16">

        {/* Core Footer Grid (Standard 4-Column Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Column 1: Brand & Mission */}
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[280px]">
              The premier decentralized protocol for programmable intellectual property. Create, trade, remix, and monetize on the Integrity Web.
            </p>
            {/* Social Icons matching Header Button logic */}
            <div className="flex items-center gap-2 mt-2">
              <Link
                href="https://x.com/medialane_io"
                target="_blank"
                className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-neon-cyan/20 hover:text-neon-cyan transition-all duration-300 text-muted-foreground"
              >
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://github.com/medialane-io"
                target="_blank"
                className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-neon-cyan/20 hover:text-neon-cyan transition-all duration-300 text-muted-foreground"
              >
                <Github className="w-4 h-4" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://t.me/integrityweb"
                target="_blank"
                className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-neon-cyan/20 hover:text-neon-cyan transition-all duration-300 text-muted-foreground"
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Telegram</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Protocol (Main Nav) */}
          <div className="flex flex-col gap-6 lg:pl-8">
            <h4 className="text-sm font-bold text-foreground">Protocol</h4>
            <nav className="flex flex-col gap-4">
              {navigation.main.filter(item => item.title !== "Start").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Resources (Legal/Docs) */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-foreground">Resources</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 w-fit">Documentation</Link>
              <Link href="/docs/security" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 w-fit">Security</Link>
              <Link href="/docs/privacy-policy" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 w-fit">Privacy Policy</Link>
              <Link href="/docs/terms-of-use" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 w-fit">Terms of Use</Link>
            </nav>
          </div>

          {/* Column 4: System Utilities */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-foreground">System Engine</h4>
            <div className="flex flex-col gap-5">
              {/* Visual Status Indicator matching existing styling */}
              <div className="flex items-center gap-3 w-fit px-4 py-2 border border-border/40 bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight">Starknet Mainnet</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Status: Operational</span>
                </div>
              </div>

              {/* Command Menu Trigger identical to Header mobile implementation */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent("openCommandMenu"))}
                className="flex items-center justify-between w-full p-2 px-4 h-10 gap-2 rounded-full border border-white/20 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-neon-cyan/20 transition-all duration-300 text-foreground group"
              >
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-neon-cyan transition-colors" />
                  <span className="text-sm font-medium">Command Menu</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 dark:border-white/10 px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘K</span>
                </kbd>
              </button>
            </div>
          </div>

        </div>

        {/* Global Bottom Bar */}
        <div className="pt-8 border-t border-white/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>© {currentYear} Medialane Labs</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-50">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Distributed Network</span>
          </div>
        </div>

      </div>
    </footer>
  )
}