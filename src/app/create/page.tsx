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
    id: "Remix",
    title: "Create Remix",
    description: "Create a remix of an existing asset.",
    icon: "RefreshCw",
    color: "rose",
    category: "advanced",
    trending: false,
    popular: true,
    estimatedTime: "1-2 min",
    estimatedFee: 0.001,
    userCount: "55",
    benefits: ["License assets", "Usecase IP", "Advanced trading", "New revenue streams"],
    process: [
      "Define remix details and theme",
      "Set remix-wide licensing terms",
      "Open and collaborative remix",
      "Publish and manage your remix",
    ],
    href: "/create/remix",
    useCase: "Great for creators with multiple related works or series of assets.",
    gradient: "from-rose-500 to-rose-700",
    iconColor: "text-rose-500",
    requirements: ["Multiple assets"],
    timeEstimate: "1-2 min",
    tags: ["Remix", "Licensing", "Advanced"],
    featured: false,
    complexity: "Beginner",
    useCases: ["Remix assets", "New revenue streams"],
    popularity: 55,
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
    <div className="min-h-screen pb-8 px-4 md:px-8">

      <main className="container mx-auto max-w-10xl">

        {/* Creator Stats */}
        <CreatorStatsBar />

        <PageHeader
          title="Create"
          description="Start your journey. Mint assets, launch collections, and build your IP portfolio."
        />

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creation options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 focus:border-outrun-cyan/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.12)] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popular</SelectItem>
                  <SelectItem value="time">Fastest</SelectItem>

                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden md:flex border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-8 whitespace-nowrap flex-shrink-0"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Options Grid */}
          <div className="lg:col-span-3">
            {sortedOptions.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No options found matching your search.</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {selectedOptionData ? (
                <CreationOptionDetails option={selectedOptionData} />
              ) : (
                <>
                  {/* Popular Templates */}
                  <Card className="glass-panel border-outrun-cyan/30 bg-card/5 backdrop-blur-md">
                    <CardHeader className="pb-3 border-b border-outrun-cyan/10">
                      <CardTitle className="text-base flex items-center gap-2 font-bold tracking-wide">
                        <TrendingUp className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
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
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-card/20 hover:bg-outrun-cyan/10 ring-1 ring-border/20 hover:ring-outrun-cyan/30 transition-all cursor-pointer">
                              <div className="p-1.5 rounded-md bg-outrun-cyan/10 text-outrun-cyan group-hover:shadow-glow-sm shadow-neon-cyan/20">
                                {getIconComponent(template.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground/90 group-hover:text-neon-cyan transition-colors">{template.name}</div>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        )
                      })}
                      <Link href="/create/templates" className="block mt-4">
                        <Button variant="outline" size="sm" className="w-full bg-transparent border-outrun-cyan/30 text-outrun-cyan hover:bg-outrun-cyan/10 hover:border-neon-cyan/50 hover:shadow-glow-sm hover:shadow-neon-cyan/20 transition-all font-bold">
                          View All Templates
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Help Card 
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Need Help?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        New to IP protection? Our guide will help you choose the right option for your needs.
                      </p>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Getting Started Guide
                      </Button>
                    </CardContent>
                  </Card>*/}

                  {/* Benefits */}
                  <Card className="glass-panel border-outrun-magenta/30 bg-card/5 backdrop-blur-md">
                    <CardContent className="p-5">
                      <h4 className="font-bold mb-4 text-outrun-magenta tracking-wide">Why tokenize with Medialane?</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <CheckCircle className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] mt-0.5 shrink-0" />
                          <span>Zero fees protocol and dapp</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <CheckCircle className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] mt-0.5 shrink-0" />
                          <span>Full ownership onchain</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <CheckCircle className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] mt-0.5 shrink-0" />
                          <span>Instant tokenization</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <CheckCircle className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] mt-0.5 shrink-0" />
                          <span>Powered on Starknet Blockchain</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main >
    </div >
  )
}
