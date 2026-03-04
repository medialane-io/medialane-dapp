"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  CheckCircle2,
  ArrowRight,
  Music,
  Palette,
  FileText,
  Hexagon,
  Video,
  Award,
  MessageSquare,
  BookOpen,
  Building,
  Code,
  Settings,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  name: string
  icon: string
  description: string
  color: string
  category: string
  features: string[]
}

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: () => void
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  // Map template icon string to the actual icon component
  const IconComponent = getIconComponent(template.icon)

  // Map color string to Tailwind color classes
  const colorClasses = getColorClasses(template.color)

  const isPopular = template.id === "audio" || template.id === "art" || template.id === "nft"

  return (
    <Card
      className={cn(
        "glass-panel overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.12)] hover:-translate-y-2 group relative",
        "border-border/50 hover:border-outrun-cyan/30",
        isSelected ? "ring-2 ring-outrun-cyan ring-offset-2 ring-offset-background shadow-lg shadow-outrun-cyan/20" : "",
      )}
      onClick={onSelect}
    >
      {/* Gradient top border matching CreationOptionCard */}
      <div className={cn("h-1 bg-gradient-to-r", colorClasses.borderGradient)} />
      {/* Status Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
        {isPopular && (
          <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/50 text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)] backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Header (No background block, just icon matching CreationOptionCard) */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-transform group-hover:scale-110",
              colorClasses.iconBg
            )}
          >
            <IconComponent className={cn("h-7 w-7", colorClasses.iconColor)} />
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{template.name}</h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-transparent text-foreground/80">
              {template.category}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{template.description}</p>
        </div>

        {/* Features Preview */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Features</h4>
          <div className="flex flex-wrap gap-1.5">
            {template.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-[10px] bg-card/50 dark:bg-black/20 border border-white/10 dark:border-white/5 text-foreground/80">
                {feature}
              </Badge>
            ))}
            {template.features.length > 2 && (
              <Badge variant="secondary" className="text-[10px] bg-card/50 dark:bg-black/20 border border-white/10 dark:border-white/5 text-foreground/80">
                +{template.features.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/create/templates/${template.id}`} onClick={(e) => e.stopPropagation()} className="block w-full">
            <Button
              className="w-full gap-2 transition-all duration-300 gradient-vivid shadow-glow-sm shadow-neon-cyan/20 hover:scale-[1.02] text-white font-bold tracking-wider"
              size="lg"
            >
              Use Template <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

      </CardContent>
    </Card>
  )
}

// Helper function to get the icon component based on the icon name
function getIconComponent(iconName: string) {
  switch (iconName) {
    case "Music":
      return Music
    case "Palette":
      return Palette
    case "FileText":
      return FileText
    case "Hexagon":
      return Hexagon
    case "Video":
      return Video
    case "Award":
      return Award
    case "MessageSquare":
      return MessageSquare
    case "BookOpen":
      return BookOpen
    case "Building":
      return Building
    case "Code":
      return Code
    case "Settings":
      return Settings
    default:
      return FileText
  }
}

// Helper function to get Tailwind color classes based on the color name
function getColorClasses(color: string) {
  // Mapping the old abstract colors to the explicit Tailwind gradient classes used in CreationOptionCard for consistency
  switch (color) {
    case "blue":
    case "sky":
    case "indigo":
      return {
        borderGradient: "from-blue-500 to-blue-700",
        iconBg: "bg-outrun-cyan/10 ring-1 ring-outrun-cyan/30",
        iconColor: "text-outrun-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]",
      }
    case "teal":
    case "emerald":
      return {
        borderGradient: "from-green-500 to-green-700",
        iconBg: "bg-green-500/10 ring-1 ring-green-500/30",
        iconColor: "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]",
      }
    case "purple":
    case "violet":
      return {
        borderGradient: "from-purple-500 to-purple-700",
        iconBg: "bg-outrun-purple/10 ring-1 ring-outrun-purple/30",
        iconColor: "text-outrun-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
      }
    case "amber":
    case "orange":
      return {
        borderGradient: "from-amber-500 to-amber-700",
        iconBg: "bg-outrun-yellow/10 ring-1 ring-outrun-yellow/30",
        iconColor: "text-outrun-yellow drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]",
      }
    case "red":
      return {
        borderGradient: "from-orange-500 to-red-500",
        iconBg: "bg-orange-500/10 ring-1 ring-orange-500/30",
        iconColor: "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]",
      }
    case "slate":
    case "gray":
    default:
      return {
        borderGradient: "from-gray-500 to-gray-700",
        iconBg: "bg-muted/50 ring-1 ring-muted",
        iconColor: "text-muted-foreground",
      }
  }
}

