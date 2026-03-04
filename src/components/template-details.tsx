"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
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
  CheckCircle,
  Shield,
  Sparkles,
  ExternalLink,
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

interface TemplateDetailsProps {
  template: Template
}

export function TemplateDetails({ template }: TemplateDetailsProps) {
  // Map template icon string to the actual icon component
  const IconComponent = getIconComponent(template.icon)

  // Map color string to Tailwind color classes
  const colorClasses = getColorClasses(template.color)

  const isPopular = template.id === "audio" || template.id === "art" || template.id === "nft"

  return (
    <Card className="glass-panel overflow-hidden relative border-border/50">
      {/* Gradient top border matching the new card style */}
      <div className={cn("absolute top-0 inset-x-0 h-1 bg-gradient-to-r", colorClasses.borderGradient)} />

      <CardHeader className="pt-8 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl backdrop-blur-md border", colorClasses.iconBg)}>
            <IconComponent className={cn("h-7 w-7", colorClasses.iconColor)} />
          </div>
          <div className="flex flex-col gap-1">
            {isPopular && (
              <Badge className="gap-1 bg-outrun-yellow/20 text-outrun-yellow border-outrun-yellow/30 shadow-[0_0_10px_rgba(255,255,0,0.2)] text-[10px] tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-2xl mb-2 font-bold">{template.name}</CardTitle>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="text-xs uppercase tracking-wider bg-transparent text-foreground/80">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <p className="text-muted-foreground leading-relaxed">{template.description}</p>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Key Features
          </h4>
          <div className="grid gap-2">
            {template.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className={cn("rounded-lg p-4 text-sm", colorClasses.bgLight)}>
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", colorClasses.iconBg)}>
              <Shield className={cn("h-4 w-4", colorClasses.iconColor)} />
            </div>
            <div>
              <p className="font-semibold mb-1">Blockchain Protection</p>
              <p className="text-xs opacity-90 leading-relaxed">
                This template includes specialized fields and validation designed for optimal{" "}
                {template.name.toLowerCase()}
                intellectual property registration and blockchain-based proof of ownership.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Template Documentation
          </Button>
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
        bgLight: "bg-outrun-cyan/5 border border-outrun-cyan/20",
      }
    case "teal":
    case "emerald":
      return {
        borderGradient: "from-green-500 to-green-700",
        iconBg: "bg-green-500/10 ring-1 ring-green-500/30",
        iconColor: "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]",
        bgLight: "bg-green-500/5 border border-green-500/20",
      }
    case "purple":
    case "violet":
      return {
        borderGradient: "from-purple-500 to-purple-700",
        iconBg: "bg-outrun-purple/10 ring-1 ring-outrun-purple/30",
        iconColor: "text-outrun-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
        bgLight: "bg-outrun-purple/5 border border-outrun-purple/20",
      }
    case "amber":
    case "orange":
      return {
        borderGradient: "from-amber-500 to-amber-700",
        iconBg: "bg-outrun-yellow/10 ring-1 ring-outrun-yellow/30",
        iconColor: "text-outrun-yellow drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]",
        bgLight: "bg-outrun-yellow/5 border border-outrun-yellow/20",
      }
    case "red":
      return {
        borderGradient: "from-orange-500 to-red-500",
        iconBg: "bg-orange-500/10 ring-1 ring-orange-500/30",
        iconColor: "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]",
        bgLight: "bg-orange-500/5 border border-orange-500/20",
      }
    case "slate":
    case "gray":
    default:
      return {
        borderGradient: "from-gray-500 to-gray-700",
        iconBg: "bg-muted/50 ring-1 ring-muted",
        iconColor: "text-muted-foreground",
        bgLight: "bg-muted/30 border border-border",
      }
  }
}

