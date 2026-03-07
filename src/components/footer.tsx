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
        "w-full border-t z-40 transition-colors duration-m3-medium ease-m3-standard",
        "bg-m3-surface-container-lowest border-m3-outline-variant/30"
      )}
      role="contentinfo"
      aria-label="Medialane Footer"
    >
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 py-16">

        {/* Core Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Column 1: Brand & Mission */}
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="text-sm font-medium text-m3-on-surface-variant leading-relaxed max-w-[280px]">
              The premier decentralized protocol for programmable intellectual property. Create, trade, and monetize on the Integrity Web.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href="https://x.com/medialane_io"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-m3-full text-m3-on-surface-variant hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12 transition-colors duration-m3-short"
              >
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://github.com/medialane-io"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-m3-full text-m3-on-surface-variant hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12 transition-colors duration-m3-short"
              >
                <Github className="w-4 h-4" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://t.me/integrityweb"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-m3-full text-m3-on-surface-variant hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12 transition-colors duration-m3-short"
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Telegram</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Protocol */}
          <div className="flex flex-col gap-6 lg:pl-8">
            <h4 className="text-sm font-bold text-m3-on-surface">Protocol</h4>
            <nav className="flex flex-col gap-4">
              {navigation.main.filter(item => item.title !== "Start").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-on-surface transition-colors duration-m3-short w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-m3-on-surface">Resources</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/docs" className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-on-surface transition-colors duration-m3-short w-fit">Documentation</Link>
              <Link href="/docs/security" className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-on-surface transition-colors duration-m3-short w-fit">Security</Link>
              <Link href="/docs/privacy-policy" className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-on-surface transition-colors duration-m3-short w-fit">Privacy Policy</Link>
              <Link href="/docs/terms-of-use" className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-on-surface transition-colors duration-m3-short w-fit">Terms of Use</Link>
            </nav>
          </div>

          {/* Column 4: System */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-m3-on-surface">System Engine</h4>
            <div className="flex flex-col gap-5">
              {/* Network Status */}
              <div className="flex items-center gap-3 w-fit px-4 py-2.5 border border-m3-outline-variant/30 bg-m3-surface-container rounded-m3-lg">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight text-m3-on-surface">Starknet Mainnet</span>
                  <span className="text-[10px] text-m3-on-surface-variant font-mono">Status: Operational</span>
                </div>
              </div>

              {/* Command Menu Trigger */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent("openCommandMenu"))}
                className="flex items-center justify-between w-full p-2 px-4 h-10 gap-2 rounded-m3-full border border-m3-outline-variant/30 bg-m3-surface-container hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12 transition-colors duration-m3-short text-m3-on-surface group"
              >
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium">Command Menu</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-m3-sm border border-m3-outline-variant px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">⌘K</span>
                </kbd>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-m3-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-m3-on-surface-variant">
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