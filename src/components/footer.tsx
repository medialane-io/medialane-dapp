"use client"

import Link from "next/link"
import { Globe, Command, ArrowRight } from "lucide-react"
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
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 py-20">

        {/* High-Density Sitemap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">

          {/* Column 1: Identity & Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <Logo />
              <p className="text-sm font-medium text-m3-on-surface-variant leading-relaxed max-w-sm">
                Monetization hub for creators and IP owners.
              </p>

              {/* Socials */}
              <div className="flex items-center gap-2">
                {navigation.socials.map((social) => (
                  <Link
                    key={social.title}
                    href={social.href}
                    target="_blank"
                    className="flex items-center justify-center h-10 w-10 rounded-m3-full text-m3-on-surface-variant hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12 transition-colors duration-m3-short"
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="sr-only">{social.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Network Status & Quick Search */}
            <div className="flex flex-col gap-4">


              <button
                onClick={() => document.dispatchEvent(new CustomEvent("openCommandMenu"))}
                className="flex items-center justify-between w-full max-w-[240px] px-4 h-11 rounded-m3-full border border-m3-outline-variant/30 bg-m3-surface-container hover:bg-m3-on-surface/8 transition-all duration-m3-short text-m3-on-surface group"
              >
                <div className="flex items-center gap-2.5">
                  <Command className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  <span className="text-sm font-medium">Command Menu</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-m3-xs border border-m3-outline-variant px-1.5 font-mono text-[9px] font-bold uppercase opacity-60">
                  <span>⌘K</span>
                </kbd>
              </button>
            </div>
          </div>

          {/* Column 2: Explore (Marketplace) */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-m3-on-surface opacity-80">Explore</h4>
            <nav className="flex flex-col gap-4">
              {navigation.marketplace.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Tools (Launchpad & Create) */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-m3-on-surface opacity-80">Tools</h4>
            <nav className="flex flex-col gap-4">
              {navigation.create.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Account (Portfolio) */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-m3-on-surface opacity-80">Account</h4>
            <nav className="flex flex-col gap-4">
              {navigation.portfolio.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 5: Learn (Resources) */}
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-m3-on-surface opacity-80">Learn</h4>
            <nav className="flex flex-col gap-4">
              {navigation.resources.slice(0, 10).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors w-fit"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

        </div>

        {/* Bottom Bar: Legal & Global */}
        <div className="pt-10 border-t border-m3-outline-variant/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[11px] font-bold text-m3-on-surface-variant uppercase tracking-widest leading-none">
            <span className="text-m3-on-surface/40">© {currentYear} Medialane DAO</span>
            {navigation.resources.slice(-2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-m3-primary transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-m3-surface-container rounded-m3-full border border-m3-outline-variant/20 whitespace-nowrap">
            <Globe className="w-3.5 h-3.5 text-m3-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface-variant">Starknet</span>
          </div>
        </div>

      </div>
    </footer>
  )
}