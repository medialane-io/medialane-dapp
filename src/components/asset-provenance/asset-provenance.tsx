"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRight,
  Calendar,
  FileText,
  CheckCircle,
  Hash,
  Lock,
  Zap,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Clock,
  MapPin,
  Fingerprint,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  Activity,
  User,
  Tag,
  ShoppingCart,
  Gavel,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { AddressLink } from "@/components/ui/address-link"
import Image from "next/image"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface ProvenanceEvent {
  id: string
  type: "mint" | "transfer" | "license" | "modification" | "verification" | "dispute" | "list" | "sale" | "offer" | "cancel" | "accept"
  title: string
  description: string
  from?: string
  to?: string
  price?: string
  date?: string
  timestamp: string
  transactionHash?: string
  blockNumber?: number
  gasUsed?: number
  memo?: string
  verified: boolean
  location?: string
  metadata?: Record<string, any>
}

interface AssetInfo {
  id: string
  name: string
  type: string
  creator: {
    name: string
    address: string
    avatar?: string
    verified: boolean
  }
  currentOwner: {
    name: string
    address: string
    avatar?: string
    verified: boolean
  }
  creationDate: string
  registrationDate: string
  blockchain: string
  contract: string
  tokenId: string
  image: string
  description: string
  fingerprint: string
  fileSize?: string
  dimensions?: string
  format?: string
}

interface AssetProvenanceProps {
  asset: AssetInfo
  events: ProvenanceEvent[]
  showActions?: boolean
  compact?: boolean
}

export function AssetProvenance({ asset, events, showActions = true, compact = false }: AssetProvenanceProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showAllEvents, setShowAllEvents] = useState(false)

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${asset.name} - Asset Provenance`,
          text: `View the onchain history of ${asset.name}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopy(window.location.href, "url")
    }
  }

  const getEventIcon = (type: ProvenanceEvent["type"]) => {
    switch (type) {
      case "mint":
        return <Zap className="h-5 w-5" />
      case "transfer":
        return <ArrowRight className="h-5 w-5" />
      case "license":
        return <Lock className="h-5 w-5" />
      case "list":
        return <Tag className="h-5 w-5" />
      case "sale":
      case "accept":
        return <ShoppingCart className="h-5 w-5" />
      case "offer":
        return <Gavel className="h-5 w-5" />
      case "cancel":
        return <XCircle className="h-5 w-5" />
      case "modification":
        return <Fingerprint className="h-5 w-5" />
      case "verification":
        return <CheckCircle className="h-5 w-5" />
      case "dispute":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getEventColorCode = (type: ProvenanceEvent["type"]) => {
    switch (type) {
      case "mint": return "from-blue-500/80 to-indigo-600/80 dark:from-blue-600/80 dark:to-indigo-700/80 shadow-m3-1"
      case "transfer": return "from-emerald-500/80 to-teal-600/80 dark:from-emerald-600/80 dark:to-teal-700/80 shadow-m3-1"
      case "sale":
      case "accept": return "from-green-500/80 to-emerald-600/80 dark:from-green-600/80 dark:to-emerald-700/80 shadow-m3-1"
      case "cancel": return "from-red-500/80 to-rose-600/80 dark:from-red-600/80 dark:to-rose-700/80 shadow-m3-1"
      case "offer":
      case "license": return "from-purple-500/80 to-pink-600/80 dark:from-purple-600/80 dark:to-pink-700/80 shadow-m3-1"
      case "list": return "from-blue-400/80 to-indigo-500/80 dark:from-blue-500/80 dark:to-indigo-600/80 shadow-m3-1"
      case "verification": return "from-cyan-500/80 to-blue-600/80 shadow-m3-1"
      default: return "from-orange-500/80 to-red-600/80 dark:from-orange-600/80 dark:to-red-700/80 shadow-m3-1"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Recently"
    }
  }

  const truncateAddress = (address: string) => {
    if (!address) return "0x00...0000"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const displayEvents = showAllEvents ? events : events.slice(0, 5)
  const hasMoreEvents = events.length > 5

  return (
    <div className="relative space-y-12 pb-20">
      {/* Main Asset Section - Focus on Ownership */}
      <section className="relative transition-colors animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 min-h-[500px]">
          {/* Main Hero Image - Half width flex */}
          <div className="flex-shrink-0 relative group w-full lg:w-1/2 h-[400px] lg:h-[500px] overflow-hidden rounded-2xl border border-border/10 bg-muted/10">
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full"
            >
              <Image
                src={asset.image || "/placeholder.svg"}
                alt={asset.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
          </div>

          {/* Content & Ownership Details */}
          <div className="flex-1 flex flex-col justify-center space-y-10 lg:py-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-foreground">
                  {asset.name}
                </h1>
                <p className="text-base lg:text-lg text-muted-foreground mt-4 font-light leading-relaxed max-w-lg">
                  {asset.description}
                </p>
              </motion.div>
            </div>

            {/* Ownership Focus Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Creator Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Creator</p>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/10 group hover:bg-muted/50 transition-all duration-300">
                  <div className="min-w-0">
                    <AddressLink address={asset.creator.address} className="font-mono block text-foreground" />
                  </div>
                </div>
              </div>

              {/* Current Owner Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Owner</p>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-all duration-300">
                  <div className="min-w-0">
                    <AddressLink address={asset.currentOwner.address} className="font-mono block text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Minor Metadata Footer */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Token ID</span>
                <span className="font-mono text-sm font-bold text-foreground/80">#{asset.tokenId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Network</span>
                <span className="text-sm font-bold text-foreground/80">{asset.blockchain}</span>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-border/20 bg-muted/10 font-medium text-foreground">
                  ERC-721
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Timeline Content */}
      <section className="w-full mx-auto space-y-12">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-3xl font-black text-foreground">Onchain History</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-light">
            Explore the immutable cryptographic lineage of this asset.
          </p>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-8 rounded-[2.5rem] bg-card/30 border border-border border-dashed relative overflow-hidden text-center"
          >
            <div className="w-20 h-20 rounded-xl bg-foreground/5 flex items-center justify-center mb-6">
              <Clock className="h-10 w-10 text-muted-foreground/50 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-foreground/80">History in the making...</h3>
            <p className="text-muted-foreground mt-2 max-w-sm font-light">
              We're polling the network for new events. Provenance records will appear here as they are indexed.
            </p>
          </motion.div>
        ) : (
          <div className="relative space-y-6 px-4 sm:px-0">
            {/* Visual Continuity Line */}
            <div className="absolute left-[19px] sm:left-[23px] top-8 bottom-4 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />

            <AnimatePresence mode="popLayout">
              {displayEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="relative pl-12 sm:pl-14 group"
                >
                  {/* Event Icon */}
                  <div className={`absolute left-0 top-1 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${getEventColorCode(event.type)} flex items-center justify-center z-10 shadow-m3-2 group-hover:scale-105 group-hover:shadow-glow-mixed transition-all duration-300`}>
                    <div className="text-white">
                      {getEventIcon(event.type)}
                    </div>
                  </div>

                  {/* Event Card */}
                  <div className="p-5 sm:p-6 rounded-2xl glass-panel shadow-m3-1 hover:shadow-m3-2 hover:border-border/30 transition-shadow duration-300">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                          {event.type === "mint" && (
                            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0">
                              Genesis
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                      </div>

                      {event.transactionHash && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(event.transactionHash!, "tx")}
                          >
                            {truncateAddress(event.transactionHash)}
                            <Copy className="h-3 w-3 ml-1.5 opacity-50" />
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online"}/tx/${event.transactionHash}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                          </Button>
                        </div>
                      )}
                    </div>

                    {/* From → To */}
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-foreground/5 flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                          {event.from && event.from !== "0x0" ? event.from.substring(2, 4).toUpperCase() : "Ø"}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground truncate">
                          {event.from && BigInt(event.from) !== 0n ? truncateAddress(event.from) : "Genesis"}
                        </span>
                      </div>

                      {event.to && (
                        <>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                              {event.to.substring(2, 4).toUpperCase()}
                            </div>
                            <span className="font-mono text-xs text-foreground/80 truncate">
                              {truncateAddress(event.to)}
                            </span>
                          </div>
                        </>
                      )}

                      {event.price && (
                        <>
                          <div className="h-3 w-px bg-border max-sm:hidden" />
                          <div className="flex items-center font-semibold text-foreground">
                            {event.price}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMoreEvents && (
              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-6 text-xs font-medium"
                >
                  {showAllEvents ? "Show Less" : `View ${events.length - 5} More`}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modern Digital Fingerprint - Premium Glassmorphism style */}
      <section className="relative overflow-hidden pt-8 border-t border-border/10">
        <div className="absolute top-0 right-0 w-64 h-64 -z-10 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-foreground">Proof of Ownership</h3>
            <p className="text-muted-foreground font-light leading-relaxed max-w-md">
              Each asset is immutable, secured by a unique cryptographic hash, ensuring integrity.
            </p>
            <Button className="w-full h-14 rounded-2xl font-bold bg-foreground text-background hover:bg-foreground/90 hover:shadow-glow-mixed transition-all shadow-m3-3" asChild>
              <Link href={`/proof-of-ownership/${asset.contract}`}>
                <Shield className="h-4 w-4 mr-3" />
                View Proof of Ownership
              </Link>
            </Button>
          </div>

          <div className="space-y-6">

            <Button variant="outline" className="w-full h-14 rounded-2xl" asChild>
              <Link href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online"}/nft/${asset.contract}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-3" />
                View asset on External Explorer
              </Link>
            </Button>

            <div className="bg-muted/10 border border-border/20 rounded-2xl p-6 group hover:border-border/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Metadata</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-primary" onClick={() => handleCopy(asset.fingerprint, "fp")}>
                  {copied === "fp" ? "COPIED" : "COPY"}
                </Button>
              </div>
              <code className="block w-full break-all font-mono text-sm text-foreground/80 leading-relaxed tracking-tight select-all">
                {asset.fingerprint}
              </code>
            </div>


          </div>
        </div>
      </section>
    </div>
  )
}
