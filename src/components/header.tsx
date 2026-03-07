"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils"
import { ShoppingBag, Rocket, User, Command, Boxes } from "lucide-react";
import { Logo } from "@/components/header/logo"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { useCart } from "@/store/use-cart"
import { CartDrawer } from "@/components/cart-drawer"

const WalletConnect = dynamic(() => import("./header/wallet-connect").then(mod => mod.WalletConnect), {
  ssr: false,
});

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { items, setIsOpen } = useCart()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openCommandMenu = (filter?: string) => {
    document.dispatchEvent(new CustomEvent("openCommandMenu", { detail: { filter } }))
  }

  return (
    <header
      className="fixed top-0 z-50 w-full transition-all duration-m3-medium ease-m3-standard bg-transparent border-none"
    >
      <div className="w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between h-16">

        {/* Left: Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCommandMenu("marketplace")}
            className="gap-2 px-4  hover:text-m3-on-surface"
          >
            <Boxes className="w-4 h-4" />
            <span>Explore</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCommandMenu("launchpad")}
            className="gap-2 px-4  hover:text-m3-on-surface"
          >
            <Rocket className="w-4 h-4" />
            <span>Launchpad</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCommandMenu("portfolio")}
            className="gap-2 px-4  hover:text-m3-on-surface"
          >
            <User className="w-4 h-4" />
            <span>Portfolio</span>
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Desktop Action Group */}
          <div className="hidden md:flex items-center gap-1">
            {/* Cart Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative  hover:text-m3-on-surface"
            >
              <ShoppingBag className="w-4 h-4" />
              {mounted && items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-m3-tertiary text-m3-on-tertiary text-[9px] font-bold h-4 w-4 rounded-m3-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Button>

            <WalletConnect />
            <ThemeToggle />
          </div>

          {/* Command Menu Trigger (Desktop) */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex gap-2 px-3 "
            onClick={() => document.dispatchEvent(new CustomEvent("openCommandMenu"))}
          >
            <Command className="h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-m3-sm border border-m3-outline-variant bg-m3-surface-container px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">K</span>
            </kbd>
          </Button>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative "
            >
              <ShoppingBag className="w-4 h-4" />
              {mounted && items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-m3-tertiary text-m3-on-tertiary text-[9px] font-bold h-4 w-4 rounded-m3-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className=""
              onClick={() => document.dispatchEvent(new CustomEvent("openCommandMenu"))}
            >
              <Command className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
      <CartDrawer />
    </header>
  )
}
