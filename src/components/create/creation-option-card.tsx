"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  FolderPlus,
  FileText,
  Hexagon,
  Music,
  Video,
  ImageIcon,
  Code,
  FileCheck,
  TrendingUp,
  Star,
  Clock,
  Users,
  Shield,
  ChevronRight,
  Coins,
  Grid3X3,
  RefreshCw,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CreationOption {
  id: string
  title: string
  description: string
  icon: string
  href: string
  popular?: boolean
  trending?: boolean
  category: string
  gradient: string
  iconColor: string
  process: string[]
  benefits: string[]
  requirements: string[]
  timeEstimate: string
  complexity: string
  useCases: string[]
  ownershipRate?: number
  popularity: number
}

interface CreationOptionCardProps {
  option: CreationOption
  viewMode: "grid" | "list"
  isSelected: boolean
  onSelect: () => void
}

export function CreationOptionCard({ option, viewMode, isSelected, onSelect }: CreationOptionCardProps) {
  const IconComponent = getIconComponent(option.icon)

  return (
    <Card
      className={cn(
        "glass-panel overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.12)] hover:-translate-y-2 group relative",
        "border-border/50 hover:border-outrun-cyan/30",
        isSelected ? "ring-2 ring-outrun-cyan ring-offset-2 ring-offset-background shadow-lg shadow-outrun-cyan/20" : "",
      )}
      onClick={onSelect}
    >
      {/* Gradient top border */}
      <div className={cn("h-1 bg-gradient-to-r", option.gradient)} />

      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {option.popular && (
          <Badge className="gap-1 bg-outrun-yellow/20 text-outrun-yellow border-outrun-yellow/30 shadow-[0_0_10px_rgba(255,255,0,0.2)]">
            <Star className="h-3 w-3" />
            Popular
          </Badge>
        )}
        {option.trending && (
          <Badge
            className="gap-1 bg-outrun-magenta/20 text-outrun-magenta border-outrun-magenta/30 shadow-[0_0_10px_rgba(255,0,255,0.2)]"
          >
            <TrendingUp className="h-3 w-3" />
            Trending
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-transform group-hover:scale-110",
              getColorClasses(option.gradient).bgLight,
            )}
          >
            <IconComponent className={cn("h-7 w-7", option.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            {isSelected && (
              <div className="mb-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{option.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{option.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{option.timeEstimate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            <span>Zero Fee</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>100% Ownership</span>
          </div>
          <Badge variant="outline" className="text-xs justify-self-end">
            {option.complexity}
          </Badge>
        </div>

        {/* Action Button */}
        <Link href={option.href} className="block mt-2">
          <Button
            className="w-full gap-2 transition-all duration-300 gradient-vivid shadow-glow-sm shadow-neon-cyan/20 hover:scale-[1.02] text-white font-bold tracking-wider"
            size="lg"
          >
            Get Started
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "Shield":
      return Shield
    case "Grid3X3":
      return Grid3X3
    case "RefreshCw":
      return RefreshCw
    case "BookOpen":
      return BookOpen
    case "FolderPlus":
      return FolderPlus
    case "FileText":
      return FileText
    case "Hexagon":
      return Hexagon
    case "Music":
      return Music
    case "Video":
      return Video
    case "ImageIcon":
      return ImageIcon
    case "Code":
      return Code
    case "FileCheck":
      return FileCheck
    default:
      return FileText
  }
}

function getColorClasses(gradient: string) {
  switch (gradient) {
    case "from-blue-500 to-blue-700":
      return { bgLight: "bg-outrun-cyan/10 ring-1 ring-outrun-cyan/30 text-outrun-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" }
    case "from-green-500 to-green-700":
      return { bgLight: "bg-green-500/10 ring-1 ring-green-500/30 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" }
    case "from-purple-500 to-purple-700":
      return { bgLight: "bg-outrun-purple/10 ring-1 ring-outrun-purple/30 text-outrun-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" }
    case "from-rose-500 to-rose-700":
      return { bgLight: "bg-outrun-magenta/10 ring-1 ring-outrun-magenta/30 text-outrun-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" }
    case "from-amber-500 to-amber-700":
      return { bgLight: "bg-outrun-yellow/10 ring-1 ring-outrun-yellow/30 text-outrun-yellow drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]" }
    case "from-blue-500 to-cyan-500":
      return { bgLight: "bg-outrun-cyan/10 ring-1 ring-outrun-cyan/30 text-outrun-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" }
    case "from-purple-500 to-pink-500":
      return { bgLight: "bg-outrun-purple/10 ring-1 ring-outrun-purple/30 text-outrun-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" }
    case "from-orange-500 to-red-500":
      return { bgLight: "bg-orange-500/10 ring-1 ring-orange-500/30 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" }
    case "from-violet-500 to-purple-500":
      return { bgLight: "bg-purple-500/10 ring-1 ring-purple-500/30 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" }
    default:
      return { bgLight: "bg-muted/50 ring-1 ring-muted text-muted-foreground" }
  }
}
