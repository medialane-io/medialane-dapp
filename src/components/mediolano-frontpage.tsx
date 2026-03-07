import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlusCircle,
  GitBranch,
  Activity,
  ArrowRight,
  Grid,
  Gem,
  Scroll,
  Rocket,
  ShoppingBag,
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface FeatureCardProps extends Feature { }

export function MediolanoFrontpage() {

  const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
    <div className="group p-6 rounded-2xl border bg-card/20 backdrop-blur-sm hover:bg-card/40 hover:shadow-sm transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-blue-500" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )

  const features: Feature[] = [
    {
      icon: Rocket,
      title: "Creator Launchpad",
      description: "Launch IP Coins, Creator Coins, and Collection Drops with 2% fee.",
    },
    {
      icon: ShoppingBag,
      title: "NFT Marketplace",
      description: "Trade and license tokenized assets with 1% fee.",
    },
    {
      icon: Shield,
      title: "Sovereign Capital",
      description: "Complete ownership over assets and decentralized identity.",
    },
    {
      icon: Scroll,
      title: "Programmable Licensing",
      description: "Precise control over usage and remix terms with auto-generated contracts.",
    },
    {
      icon: Zap,
      title: "Zero Tokenization Fees",
      description: "Mint programmable IP with Mediolano Protocol at zero cost.",
    },
    {
      icon: TrendingUp,
      title: "Revenue Streams",
      description: "Memberships, subscriptions, IP Tickets, and IP Clubs.",
    },
  ]


  return (
    <>

      <section className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto space-y-10 mt-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">

          <h2 className="text-1xl md:text-3xl text-balance">Creators Capital Markets</h2>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            Launch, trade, and monetize your intellectual property on the Integrity Web
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>


      <section className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 mb-20">

        <Link href="/create" className="group">
          <div className="relative overflow-hidden p-8 rounded-2xl border bg-card/20 hover:bg-card/40 hover:shadow-sm transition-all duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <Rocket className="relative w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="relative text-xl font-semibold mb-2">Creator Launchpad</h3>
            <p className="relative text-muted-foreground mb-4 leading-relaxed">
              Launch IP Coins, Creator Coins, and Collection Drops
            </p>
            <div className="relative flex items-center text-primary font-medium">
              Start Launching <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>


        <Link href="/collections" className="group">
          <div className="relative overflow-hidden p-8 rounded-2xl border bg-card/20 hover:bg-card/40 hover:shadow-sm transition-all duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <ShoppingBag className="relative w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="relative text-xl font-semibold mb-2">NFT Marketplace</h3>
            <p className="relative text-muted-foreground mb-4 leading-relaxed">
              Trade and license tokenized creator assets
            </p>
            <div className="relative flex items-center text-primary font-medium">
              Browse Marketplace <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>


      </section>



    </>
  );
}