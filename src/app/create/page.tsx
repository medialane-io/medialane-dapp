"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Shield,
  Music,
  Palette,
  FileText,
  Video,
  Code,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreationOptionCard } from "@/components/create/creation-option-card"
import { CreationOptionDetails } from "@/components/create/creation-option-details"
import { CreatorStatsBar } from "@/components/create/creator-stats-bar"
import { PageHeader } from "@/components/page-header"

const creationOptions = [
  {
    id: "asset",
    title: "Create Asset: Programmable IP",
    description: "Register and protect your intellectual property with comprehensive metadata and licensing options.",
    icon: "Shield",
    color: "blue",
    category: "core",
    trending: true,
    popular: true,
    estimatedTime: "1-5 min",
    estimatedFee: 0.001,
    userCount: "75",
    benefits: [
      "Comprehensive IP protection",
      "Decentralized Authorship",
      "Proof of Ownership",
      "Global Reach and Recognition",
    ],
    process: [
      "Upload your asset and add basic information",
      "Configure metadata and licensing terms",
      "Review and confirm registration",
      "Self custody your IP onchain",
    ],
    href: "/create/asset",
    useCase: "Perfect for creators who want to customize their Programmable IP.",
    gradient: "from-blue-500 to-blue-700",
    iconColor: "text-blue-500",
    requirements: ["Original work", "Metadata"],
    timeEstimate: "1-5 min",
    tags: ["IP", "Asset", "Protection"],
    featured: true,
    complexity: "Intermediate",
    useCases: ["Custom IP registration", "Metadata management"],
    popularity: 75,
  },
  {
    id: "templates",
    title: "Create With Template",
    description: "Choose from optimized IP templates designed for specific types of content.",
    icon: "Grid3X3",
    color: "purple",
    category: "advanced",
    trending: true,
    popular: false,
    estimatedTime: "1-5 min",
    estimatedFee: 0.001,
    userCount: "25",
    benefits: [
      "Pre-configured for your asset type",
      "Industry-specific metadata fields",
      "Optimized licensing templates",
      "Faster registration process",
    ],
    process: [
      "Select the template that matches your asset type",
      "Fill in template-specific information",
      "Customize licensing and metadata",
      "Complete registration with optimized settings",
    ],
    href: "/create/templates",
    useCase: "Ideal for creators working with specific asset types who want streamlined registration.",
    gradient: "from-purple-500 to-purple-700",
    iconColor: "text-purple-500",
    requirements: ["Template selection"],
    timeEstimate: "2-5 min",
    tags: ["Template", "IP", "Creator"],
    featured: false,
    complexity: "Beginner",
    useCases: ["Music", "Publications", "Videos", "Software"],
    popularity: 45,
  },
  {
    id: "collection",
    title: "Create Collection",
    description: "Group related assets together for better organization and batch management.",
    icon: "BookOpen",
    color: "green",
    category: "core",
    trending: false,
    popular: true,
    estimatedTime: "1-2 min",
    estimatedFee: 0.001,
    userCount: "95",
    benefits: ["Manage assets", "Showcase IP", "Unified branding", "Powerful features"],
    process: [
      "Define collection details and theme",
      "Set collection-wide licensing terms",
      "Open and collaborative collections",
      "Publish and manage your collection",
    ],
    href: "/create/collection",
    useCase: "Great for creators with multiple related works or series of assets.",
    gradient: "from-green-500 to-green-700",
    iconColor: "text-green-500",
    requirements: ["Multiple assets"],
    timeEstimate: "1-2 min",
    tags: ["Collection", "Batch", "Creators"],
    featured: false,
    complexity: "Beginner",
    useCases: ["Showcase assets", "Portfolio organization"],
    popularity: 95,
  },
  {
    id: "collection-drop",
    title: "Collection Drop",
    description: "Launch a premium NFT drop with a dedicated landing page.",
    icon: "Sparkles",
    color: "amber",
    category: "advanced",
    trending: true,
    popular: true,
    estimatedTime: "2-5 min",
    estimatedFee: 0.05,
    userCount: "120",
    benefits: ["Dedicated landing page", "Minting mechanics", "Visual storytelling", "Premium experience"],
    process: [
      "Configure drop details (price, supply)",
      "Upload assets and metadata",
      "Set up roadmap and team info",
      "Launch your public drop page",
    ],
    href: "/launchpad/collection-drop",
    useCase: "Perfect for high-profile NFT launches and community building.",
    gradient: "from-amber-500 to-amber-700",
    iconColor: "text-amber-500",
    requirements: ["Assets", "Roadmap"],
    timeEstimate: "2-5 min",
    tags: ["Drop", "NFT", "Launch"],
    featured: true,
    complexity: "Advanced",
    useCases: ["NFT Drops", "Community Launch"],
    popularity: 90,
  },
]

const templates = [
  {
    id: "audio",
    name: "Audio",
    icon: "Music",
    description: "Music, podcasts, sound effects, and audio content",
    color: "blue",
    category: "media",
    count: "42",
  },
  {
    id: "art",
    name: "Art",
    icon: "Palette",
    description: "Digital art, illustrations, paintings, and visual creations",
    color: "purple",
    category: "media",
    count: "12",
  },
  {
    id: "video",
    name: "Video",
    icon: "Video",
    description: "Films, animations, tutorials, and video content",
    color: "red",
    category: "media",
    count: "61",
  },
  {
    id: "software",
    name: "Software",
    icon: "Code",
    description: "Applications, code, algorithms, and digital tools",
    color: "violet",
    category: "tech",
    count: "37",
  },
  {
    id: "documents",
    name: "Documents",
    icon: "FileText",
    description: "Contracts, agreements, manuals, and written content",
    color: "gray",
    category: "legal",
    count: "29",
  },
  {
    id: "nft",
    name: "NFT",
    icon: "Hexagon",
    description: "Non-fungible tokens and blockchain assets",
    color: "teal",
    category: "blockchain",
    count: "84",
  },
]

const categories = [
  { id: "all", name: "All", count: 6 },
  { id: "core", name: "Core", count: 3 },
  { id: "advanced", name: "Advanced", count: 2 },
]

export default function CreatePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popularity")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const filteredOptions = creationOptions.filter((option) => {
    const matchesSearch =
      option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.useCase?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || option.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedOptions = [...filteredOptions].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return Number.parseInt(b.userCount.replace("k", "")) - Number.parseInt(a.userCount.replace("k", ""))
      case "time":
        return Number.parseInt(a.estimatedTime.split("-")[0]) - Number.parseInt(b.estimatedTime.split("-")[0])
      case "success":
        return b.estimatedFee - a.estimatedFee
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const selectedOptionData = creationOptions.find((opt) => opt.id === selectedOption)

  return (
    <div className="min-h-screen pb-8">
      <div className="h-16"></div>

      <main className="w-full mx-auto py-4">
        {/* Creator Stats */}
        <div className="layout-px mb-6">
          <CreatorStatsBar />
        </div>

        <PageHeader
          variant="expressive"
          title="Create"
          description="Start your journey. Mint assets, launch collections, and build your IP portfolio."
          statusBadge="Creator Workspace"
          primaryAction={
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-m3-on-surface-variant/50" />
              <input
                type="search"
                placeholder="Search creation options..."
                className="w-full h-12 md:h-14 pl-12 pr-4 bg-m3-surface-container border border-m3-outline-variant/20 focus:border-m3-primary/30 text-base transition-all rounded-full shadow-sm focus:shadow-md outline-none text-m3-on-surface placeholder:text-m3-on-surface-variant/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          }
          utilityContent={
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 w-[130px] rounded-full border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors text-xs font-bold text-m3-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-m3-primary" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs font-medium">
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[110px] rounded-full border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors text-xs font-bold text-m3-on-surface-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity" className="text-xs font-medium">Popular</SelectItem>
                  <SelectItem value="time" className="text-xs font-medium">Fastest</SelectItem>
                  <SelectItem value="name" className="text-xs font-medium">Name</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-4 w-px bg-m3-outline-variant/20 mx-1 hidden sm:block" />

              <div className="flex items-center p-1 rounded-full bg-m3-surface-container-high/20 border border-m3-outline-variant/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full transition-all",
                    viewMode === "grid" ? "bg-m3-primary text-m3-on-primary shadow-sm" : "text-m3-on-surface-variant/60 hover:text-m3-primary"
                  )}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full transition-all",
                    viewMode === "list" ? "bg-m3-primary text-m3-on-primary shadow-sm" : "text-m3-on-surface-variant/60 hover:text-m3-primary"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          }
        />

        <div className="layout-px py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {sortedOptions.length === 0 ? (
                <Card className="p-8 text-center bg-m3-surface-container-low border-dashed border-m3-outline-variant/20">
                  <div className="text-m3-on-surface-variant/60 mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium text-m3-on-surface">No options found matching your search.</p>
                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                  </div>
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-full">
                    Clear Search
                  </Button>
                </Card>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                  {sortedOptions.map((option) => (
                    <CreationOptionCard
                      key={option.id}
                      option={option}
                      viewMode={viewMode}
                      isSelected={selectedOption === option.id}
                      onSelect={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {selectedOptionData ? (
                  <CreationOptionDetails option={selectedOptionData} />
                ) : (
                  <>
                    <Card className="bg-m3-surface-container-low border border-m3-outline-variant/20 rounded-[24px] shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 border-b border-m3-outline-variant/10">
                        <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-wider text-m3-on-surface/70">
                          <TrendingUp className="h-4 w-4 text-m3-primary" />
                          Popular Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
                        {templates.slice(0, 4).map((template) => {
                          const getIconComponent = (iconName: string) => {
                            switch (iconName) {
                              case "Music":
                                return <Music className="h-4 w-4" />
                              case "Palette":
                                return <Palette className="h-4 w-4" />
                              case "Video":
                                return <Video className="h-4 w-4" />
                              case "Code":
                                return <Code className="h-4 w-4" />
                              default:
                                return <FileText className="h-4 w-4" />
                            }
                          }

                          return (
                            <Link key={template.id} href={`/create/templates/${template.id}`} className="block group">
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-m3-primary/5 transition-colors cursor-pointer">
                                <div className="p-1.5 rounded-md bg-m3-primary/10 text-m3-primary group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-colors">
                                  {getIconComponent(template.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs text-m3-on-surface-variant group-hover:text-m3-primary transition-colors">{template.name}</div>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-m3-on-surface-variant/40 group-hover:text-m3-primary group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </Link>
                          )
                        })}
                        <Link href="/create/templates" className="block mt-4">
                          <Button variant="outline" size="sm" className="w-full rounded-full border-m3-outline-variant/30 text-[10px] font-black uppercase tracking-widest hover:bg-m3-primary/5">
                            View All Templates
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-m3-surface-container-low border border-m3-outline-variant/20 rounded-[24px] shadow-sm">
                      <CardContent className="p-5">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-m3-primary/60">Why tokenize with Medialane?</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5 text-xs text-m3-on-surface font-bold">
                            <CheckCircle className="h-3.5 w-3.5 text-m3-primary mt-0.5 shrink-0" />
                            <span>Zero fees protocol and dapp</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs text-m3-on-surface font-bold">
                            <CheckCircle className="h-3.5 w-3.5 text-m3-primary mt-0.5 shrink-0" />
                            <span>Full ownership onchain</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs text-m3-on-surface font-bold">
                            <CheckCircle className="h-3.5 w-3.5 text-m3-primary mt-0.5 shrink-0" />
                            <span>Instant tokenization</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs text-m3-on-surface font-bold">
                            <CheckCircle className="h-3.5 w-3.5 text-m3-primary mt-0.5 shrink-0" />
                            <span>Powered by Starknet Blockchain</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
