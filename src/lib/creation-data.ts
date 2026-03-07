import { Shield, Box, Grid3X3, RefreshCw } from "lucide-react"

// Defining the type locally to avoid circular dependencies if needed, 
// but sticking to the request import. 
// Ideally we should move the type to a separate file, but for now I will rely on the type being compatible.

export interface CinematicOption {
    id: string
    title: string
    description: string
    icon: any
    href: string
    gradient: string
    tags: string[]
    popular?: boolean
    trending?: boolean
}

export const creationOptions: CinematicOption[] = [
    {
        id: "asset",
        title: "Mint Programmable Asset",
        description: "Register your intellectual property onchain. Set automated royalty streams, define licensing terms, and self-custody your creative work.",
        icon: Shield,
        href: "/create/asset",
        gradient: "from-blue-600 to-indigo-600",
        tags: ["Core", "IP", "Royalty"],
        popular: true,
    },
    {
        id: "collection",
        title: "Deploy Collection Contract",
        description: "Launch a branded smart contract to organize your assets. Perfect for series, albums, or cohesive portfolios that need a unified identity.",
        icon: Box,
        href: "/create/collection",
        gradient: "from-emerald-600 to-teal-600",
        tags: ["Organization", "Contract", "Branding"],
    },
    {
        id: "templates",
        title: "Use IP Templates",
        description: "Start fast with pre-configured templates for Music, Art, Video, and Code. Optimized metadata structures for your specific medium.",
        icon: Grid3X3,
        href: "/create/templates",
        gradient: "from-orange-600 to-amber-600",
        tags: ["Fast", "Starter", "Simple"],
    },
]
