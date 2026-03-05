"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddressLink } from "@/components/ui/address-link"
import Image from "next/image"

import { Activity } from "@/hooks/use-activities"
import {
  ACTIVITY_LABELS,
  getActivityIcon,
  getActivityColor,
  formatTimeAgo,
  getGradient,
  shouldShowGradient,
} from "@/lib/activity-ui"

interface ActivityCardProps {
  activity: Activity
}

export const ActivityCard = React.memo(function ActivityCard({ activity }: ActivityCardProps) {
  const Icon = getActivityIcon(activity.type)
  const colors = getActivityColor(activity.type)
  const timeAgo = formatTimeAgo(activity.timestamp)
  const showGradient = shouldShowGradient(activity.type, activity.assetImage)

  return (
    <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short flex flex-col h-full overflow-hidden hover:shadow-[0_0_25px_rgba(0,255,255,0.1)] hover:scale-[1.02] transition-all duration-300 group">

      {/* Header: User & Action - Timeline Feel */}
      <div className="flex items-center gap-3 p-4 pb-3 border-b border-border/10">
        <div className={`p-2 rounded-full flex-shrink-0 ${colors.badge.split(' ')[0]}`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <AddressLink
              address={activity.user}
              className="font-semibold text-sm hover:text-primary transition-colors truncate max-w-[120px]"
              showFull={false}
            />
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs text-muted-foreground font-medium">{timeAgo}</span>
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {ACTIVITY_LABELS[activity.type] ?? activity.type}
          </div>
        </div>
      </div>

      {/* Body: Full Width Image */}
      <div className="relative w-full aspect-square bg-muted/20 border-y border-border/10 overflow-hidden">
        {showGradient ? (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(activity.assetName)} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
        ) : (
          <Image
            src={activity.assetImage || `/placeholder.svg?height=400&width=400&text=${activity.assetName}`}
            alt={activity.assetName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>

      {/* Footer: Metadata */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold tracking-tight text-base line-clamp-1 group-hover:text-primary transition-colors">
            {activity.assetName}
          </h4>
          {activity.tokenId && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal opacity-70">
              #{activity.tokenId}
            </Badge>
          )}
        </div>

        {activity.price && (
          <p className="text-sm font-semibold text-primary">{activity.price}</p>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {activity.details}
        </p>
      </div>
    </Card>
  )
})
