"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, TrendingUp, CheckCircle, ArrowRight, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

interface CreationOptionDetailsProps {
  option: {
    id: string
    title: string
    description: string
    estimatedTime: string
    estimatedFee: number
    complexity: string
    benefits?: string[]
    process?: string[]
    useCase?: string
    href: string
  }
}

export function CreationOptionDetails({ option }: CreationOptionDetailsProps) {
  // Guard against undefined option
  if (!option) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select an option to see details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <Card className="glass-panel border-outrun-cyan/30 bg-card/5 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {option.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{option.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-outrun-cyan/10 ring-1 ring-outrun-cyan/30">
              <Clock className="h-4 w-4 mx-auto mb-1 text-outrun-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
              <div className="text-sm font-medium">{option.estimatedTime}</div>
              <div className="text-xs text-muted-foreground">Est. Time</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-outrun-magenta/10 ring-1 ring-outrun-magenta/30">
              <Users className="h-4 w-4 mx-auto mb-1 text-outrun-magenta drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]" />
              <div className="text-sm font-medium">{option.complexity}</div>
              <div className="text-xs text-muted-foreground">Complexity</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neon-cyan/5 ring-1 ring-neon-cyan/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
              <span className="text-sm font-medium">Estimated Fee</span>
            </div>
            <Badge variant="secondary" className="bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-glow-sm shadow-neon-cyan/10">
              {option.estimatedFee} STRK
            </Badge>
          </div>

          <Link href={option.href} className="block mt-4">
            <Button className="w-full gradient-vivid shadow-glow-sm shadow-neon-cyan/20 hover:shadow-neon-cyan/40 hover:scale-[1.02] transition-all text-white font-bold tracking-wider" size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Benefits */}
      {option.benefits && option.benefits.length > 0 && (
        <Card className="glass-panel border-outrun-cyan/20 bg-card/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-outrun-cyan">Key Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {option.benefits.slice(0, 4).map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-foreground/90">
                <CheckCircle className="h-4 w-4 text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Process */}
      {option.process && option.process.length > 0 && (
        <Card className="glass-panel border-outrun-magenta/20 bg-card/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-outrun-magenta">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {option.process.slice(0, 4).map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-outrun-magenta/20 border border-outrun-magenta/50 text-outrun-magenta text-xs flex items-center justify-center font-bold shadow-glow-sm shadow-neon-magenta/20">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground/80">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Use Case */}
      {option.useCase && (
        <Card className="glass-panel border-outrun-yellow/20 bg-card/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-outrun-yellow">Perfect For</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">{option.useCase}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
