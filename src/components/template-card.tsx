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
  const IconComponent = getIconComponent(template.icon)
  const colorClasses = getColorClasses(template.color)
  const isPopular = template.id === "audio" || template.id === "art" || template.id === "nft"

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-m3-medium ease-m3-standard hover:shadow-m3-3 hover:-translate-y-1 group relative",
        "bg-m3-surface-container border-m3-outline-variant/15 shadow-m3-1",
        isSelected ? "ring-2 ring-m3-primary ring-offset-2 ring-offset-background shadow-m3-3" : "",
      )}
      onClick={onSelect}
    >
      {/* Gradient top border */}
      <div className={cn("h-1 bg-gradient-to-r", colorClasses.borderGradient)} />

      {/* Status Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
        {isPopular && (
          <Badge className="bg-m3-tertiary-container text-m3-on-tertiary-container border-0 text-[10px] tracking-wider uppercase">
            <Sparkles className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-m3-lg transition-transform duration-m3-short group-hover:scale-110",
              colorClasses.iconBg
            )}
          >
            <IconComponent className={cn("h-7 w-7", colorClasses.iconColor)} />
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors duration-m3-short">{template.name}</h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-m3-outline-variant text-m3-on-surface-variant">
              {template.category}
            </Badge>
          </div>

          <p className="text-sm text-m3-on-surface-variant line-clamp-2 leading-relaxed">{template.description}</p>
        </div>

        {/* Features Preview */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-m3-on-surface-variant uppercase tracking-wider">Key Features</h4>
          <div className="flex flex-wrap gap-1.5">
            {template.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-[10px] bg-m3-surface-container-highest text-m3-on-surface-variant border-0">
                {feature}
              </Badge>
            ))}
            {template.features.length > 2 && (
              <Badge variant="secondary" className="text-[10px] bg-m3-surface-container-highest text-m3-on-surface-variant border-0">
                +{template.features.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/create/templates/${template.id}`} onClick={(e) => e.stopPropagation()} className="block w-full">
            <Button
              className="w-full gap-2 font-bold tracking-wider active:scale-[0.98] transition-transform"
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

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "Music": return Music
    case "Palette": return Palette
    case "FileText": return FileText
    case "Hexagon": return Hexagon
    case "Video": return Video
    case "Award": return Award
    case "MessageSquare": return MessageSquare
    case "BookOpen": return BookOpen
    case "Building": return Building
    case "Code": return Code
    case "Settings": return Settings
    default: return FileText
  }
}

function getColorClasses(color: string) {
  switch (color) {
    case "blue":
    case "sky":
    case "indigo":
      return {
        borderGradient: "from-blue-500 to-blue-700",
        iconBg: "bg-m3-primary-container",
        iconColor: "text-m3-on-primary-container",
      }
    case "teal":
    case "emerald":
      return {
        borderGradient: "from-green-500 to-green-700",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      }
    case "purple":
    case "violet":
      return {
        borderGradient: "from-purple-500 to-purple-700",
        iconBg: "bg-m3-secondary-container",
        iconColor: "text-m3-on-secondary-container",
      }
    case "amber":
    case "orange":
      return {
        borderGradient: "from-amber-500 to-amber-700",
        iconBg: "bg-m3-tertiary-container",
        iconColor: "text-m3-on-tertiary-container",
      }
    case "red":
      return {
        borderGradient: "from-orange-500 to-red-500",
        iconBg: "bg-m3-error-container",
        iconColor: "text-m3-on-error-container",
      }
    case "slate":
    case "gray":
    default:
      return {
        borderGradient: "from-gray-500 to-gray-700",
        iconBg: "bg-m3-surface-variant",
        iconColor: "text-m3-on-surface-variant",
      }
  }
}
