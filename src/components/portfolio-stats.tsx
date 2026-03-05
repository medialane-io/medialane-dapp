"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet, LayoutGrid } from "lucide-react"
import { useBlockchainPortfolio } from "@/hooks/use-blockchain-portfolio"
import { useMIP } from "@/hooks/contracts/use-mip"

interface PortfolioStatsProps { }

export function PortfolioStats({ }: PortfolioStatsProps) {
  const { address, balance, balanceError, isLoading } = useMIP();

  // Get blockchain data
  const {
    userAssets: blockchainAssets,
    userCollections: blockchainCollections,
    portfolioStats: blockchainStats,
  } = useBlockchainPortfolio()

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collections</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : blockchainCollections.length || "1"}
          </div>
          <p className="text-xs text-muted-foreground">IP Collections</p>
        </CardContent>
      </Card>

      <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {address && isLoading ? "Loading..." : balanceError ? "Error" : balance.toString()}
          </div>
          <p className="text-xs text-muted-foreground">Total IPs in your portfolio</p>
        </CardContent>
      </Card>

      <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Collection</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-1xl font-bold">
            {blockchainCollections.length > 0 ? blockchainCollections[0].name : "IP Collection"}
          </div>
          <p className="text-xs text-muted-foreground">
            {address && isLoading ? "" : "(New collections soon)"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-1xl font-bold">
            "No recorded activity"
          </div>
          <p className="text-xs text-muted-foreground">
            {address && isLoading ? "" : "(Preview)"}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

