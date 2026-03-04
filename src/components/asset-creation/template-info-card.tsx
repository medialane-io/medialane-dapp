"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Shield,
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

interface TemplateInfoCardProps {
  template: Template
}

export function TemplateInfoCard({ template }: TemplateInfoCardProps) {
  // Map template icon string to the actual icon component
  const IconComponent = getIconComponent(template.icon)

  // Map color string to Tailwind color classes
  const colorClasses = getColorClasses(template.color)

  const isPopular = template.id === "audio" || template.id === "art" || template.id === "nft"

  return (
    <Card className="relative bg-card/40 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className={cn("pb-4 relative overflow-hidden/20", colorClasses.bgGradient)}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={cn("p-3 rounded-xl backdrop-blur-md border shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]", colorClasses.iconBg)}>
              <IconComponent className={cn("h-6 w-6", colorClasses.iconColor)} />
            </div>
            <div className="flex flex-col gap-1">
              {isPopular && (
                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/50 text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)] backdrop-blur-md">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          </div>

          <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
          <Badge variant="outline" className="text-[10px] bg-black/5 dark:bg-black/20 border border-white/10 dark:border-white/5 uppercase tracking-wider text-foreground/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            Template Features
          </h4>
          <div className="space-y-1">
            {template.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("rounded-lg p-3 text-sm", colorClasses.bgLight)}>
          <div className="flex items-start gap-2">
            <Shield className={cn("h-4 w-4 mt-0.5", colorClasses.iconColor)} />
            <div>
              <p className="font-medium text-xs">Blockchain Protection</p>
              <p className="text-xs opacity-90 leading-relaxed">
                Optimized for {template.name.toLowerCase()} IP registration with immutable proof of ownership.
              </p>
            </div>
          </div>
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
  switch (color) {
    case "blue":
      return {
        bgGradient: "bg-outrun-cyan/10",
        bgLight: "bg-outrun-cyan/5 border border-outrun-cyan/20",
        iconColor: "text-outrun-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]",
        iconBg: "bg-outrun-cyan/10 border-outrun-cyan/30",
      }
    case "purple":
    case "violet":
      return {
        bgGradient: "bg-outrun-magenta/10",
        bgLight: "bg-outrun-magenta/5 border border-outrun-magenta/20",
        iconColor: "text-outrun-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]",
        iconBg: "bg-outrun-magenta/10 border-outrun-magenta/30",
      }
    case "amber":
    case "orange":
      return {
        bgGradient: "bg-outrun-yellow/10",
        bgLight: "bg-amber-500/5 border border-amber-500/20",
        iconColor: "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]",
        iconBg: "bg-amber-500/10 border-amber-500/30",
      }
    case "teal":
    case "emerald":
      return {
        bgGradient: "bg-neon-cyan/10",
        bgLight: "bg-teal-500/5 border border-teal-500/20",
        iconColor: "text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]",
        iconBg: "bg-teal-500/10 border-teal-500/30",
      }
    case "red":
      return {
        bgGradient: "bg-red-500/10",
        bgLight: "bg-red-500/5 border border-red-500/20",
        iconColor: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
        iconBg: "bg-red-500/10 border-red-500/30",
      }
    case "sky":
    case "indigo":
      return {
        bgGradient: "bg-blue-500/10",
        bgLight: "bg-blue-500/5 border border-blue-500/20",
        iconColor: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
        iconBg: "bg-blue-500/10 border-blue-500/30",
      }
    case "slate":
    case "gray":
    default:
      return {
        bgGradient: "bg-muted/30",
        bgLight: "bg-muted/30 border border-border",
        iconColor: "text-foreground",
        iconBg: "bg-foreground/5 border-border",
      }
  }
}

