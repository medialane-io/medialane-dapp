import { Plus, Send, GitBranch, Activity as ActivityIcon, Tag, Gavel, ShoppingCart, XCircle, type LucideIcon } from "lucide-react"
import { format } from "date-fns"
import { normalizeStarknetAddress } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/lib/constants"

export const ACTIVITY_LABELS: Record<string, string> = {
  mint: "Minted",
  transfer: "Transferred",
  collection: "Created Collection",
  listing: "Listed",
  offer: "Offered",
  sale: "Sold",
  cancel: "Cancelled",
}

export function getActivityIcon(type: string): LucideIcon {
  switch (type) {
    case "mint":
      return Plus
    case "transfer":
      return Send
    case "collection":
      return Plus
    case "listing":
      return Tag
    case "offer":
      return Gavel
    case "sale":
      return ShoppingCart
    case "cancel":
      return XCircle
    default:
      return ActivityIcon
  }
}

export function getActivityColor(type: string): { badge: string; icon: string } {
  switch (type) {
    case "mint":
      return {
        badge: "bg-outrun-cyan/10 text-outrun-cyan border-outrun-cyan/20 hover:bg-outrun-cyan/20",
        icon: "text-outrun-cyan",
      }
    case "transfer":
      return {
        badge: "bg-outrun-magenta/10 text-outrun-magenta border-outrun-magenta/20 hover:bg-outrun-magenta/20",
        icon: "text-outrun-magenta",
      }
    case "collection":
      return {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
        icon: "text-purple-400",
      }
    case "listing":
      return {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
        icon: "text-emerald-400",
      }
    case "offer":
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
        icon: "text-blue-400",
      }
    case "sale":
      return {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
        icon: "text-amber-400",
      }
    case "cancel":
      return {
        badge: "bg-muted text-muted-foreground border-border/20",
        icon: "text-muted-foreground",
      }
    default:
      return {
        badge: "bg-muted text-muted-foreground border-border/20",
        icon: "text-muted-foreground",
      }
  }
}

export function formatTimeAgo(timestamp: string): string {
  try {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return format(time, "MMM d")
  } catch {
    return "Recent"
  }
}

/** Format a unix timestamp (seconds) as a human-readable relative time string. */
export function formatTimeAgoFromUnix(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function getGradient(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradients = [
    "from-outrun-cyan to-outrun-magenta",
    "from-outrun-magenta to-outrun-orange",
    "from-outrun-orange to-violet-500",
    "from-violet-500 to-outrun-cyan",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-cyan-400",
  ]
  return gradients[hash % gradients.length]
}

export function shouldShowGradient(type: string, assetImage: string): boolean {
  const gradientTypes = ["collection", "listing", "offer", "sale", "cancel"]
  return gradientTypes.includes(type) &&
    (!assetImage || assetImage === "/placeholder.svg" || assetImage.includes("placeholder"))
}

export function formatPrice(raw: string, decimals: number): string {
  try {
    const value = Number(BigInt(raw)) / 10 ** decimals
    return decimals === 6 ? value.toFixed(2) : value.toFixed(4)
  } catch {
    return "0"
  }
}

export function lookupToken(address: string): { symbol: string; decimals: number } | null {
  const normalized = normalizeStarknetAddress(address.toLowerCase())
  for (const t of SUPPORTED_TOKENS) {
    if (normalizeStarknetAddress(t.address.toLowerCase()) === normalized) {
      return { symbol: t.symbol, decimals: t.decimals }
    }
  }
  return null
}
