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
        "bg-m3-surface-container overflow-hidden cursor-pointer transition-all duration-m3-medium ease-m3-standard hover:shadow-m3-3 hover:-translate-y-1 relative group",
        "border-m3-outline-variant/15 hover:border-blue-500/30",
        isSelected ? "ring-2 ring-m3-primary ring-offset-2 ring-offset-background shadow-m3-4" : "",
      )}
      onClick={onSelect}
    >
      {/* Gradient top border */}
      <div className={cn("h-1 bg-gradient-to-r", option.gradient)} />

      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {option.popular && (
          <Badge className="gap-1 bg-m3-tertiary-container text-m3-on-tertiary-container border-0">
            <Star className="h-3 w-3" />
            Popular
          </Badge>
        )}
        {option.trending && (
          <Badge className="gap-1 bg-m3-secondary-container text-m3-on-secondary-container border-0">
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
              "p-3 rounded-m3-xl transition-transform duration-m3-short group-hover:scale-110",
              getColorClasses(option.gradient).bgLight,
            )}
          >
            <IconComponent className={cn("h-7 w-7", option.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            {isSelected && (
              <div className="mb-2">
                <div className="h-6 w-6 rounded-m3-full bg-m3-primary flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-m3-on-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold group-hover:text-m3-primary transition-colors">{option.title}</h3>
          <p className="text-sm text-m3-on-surface-variant line-clamp-3 leading-relaxed">{option.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-m3-on-surface-variant">
            <Clock className="h-3.5 w-3.5" />
            <span>{option.timeEstimate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-m3-on-surface-variant">
            <Coins className="h-3.5 w-3.5" />
            <span>Zero Fee</span>
          </div>
          <div className="flex items-center gap-1.5 text-m3-on-surface-variant">
            <Shield className="h-3.5 w-3.5" />
            <span>100% Ownership</span>
          </div>
          <Badge variant="outline" className="text-xs justify-self-end text-m3-on-surface-variant border-m3-outline-variant/20 bg-m3-surface-variant">
            {option.complexity}
          </Badge>
        </div>

        {/* Action Button */}
        <Link href={option.href} className="block mt-2">
          <Button
            variant="premium"
            className="w-full gap-2 transition-all duration-m3-medium"
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
