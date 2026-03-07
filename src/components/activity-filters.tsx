"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Filter, RefreshCw, X } from "lucide-react"

interface ActivityFiltersProps {
    searchQuery: string
    onSearchChange: (q: string) => void
    typeFilter: string
    onTypeChange: (t: string) => void
    onRefresh?: () => void
    isRefreshing?: boolean
    searchPlaceholder?: string
}

export function ActivityFilters({
    searchQuery,
    onSearchChange,
    typeFilter,
    onTypeChange,
    onRefresh,
    isRefreshing,
    searchPlaceholder = "Search activities...",
}: ActivityFiltersProps) {
    return (
        <div className="flex flex-col gap-3 md:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-foreground/10 focus:border-primary/50 transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-background/50 border-foreground/10 focus:border-primary/50">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-background/95">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="mint">Mint</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="collection">Collection</SelectItem>
                        <SelectItem value="listing">Listing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="cancel">Cancel</SelectItem>
                    </SelectContent>
                </Select>

                {onRefresh && (
                    <Button
                        variant="outline"
                        size="default"
                        aria-label="Refresh"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex-1 sm:flex-initial bg-background/50 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                )}
            </div>
        </div>
    )
}
