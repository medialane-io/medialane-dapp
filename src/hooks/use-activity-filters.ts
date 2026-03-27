"use client"

import { useState, useEffect, useMemo } from "react"
import type { Activity } from "@/hooks/use-activities"

export function useActivityFilters(activities: Activity[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const filtered = useMemo(() => {
    let r = activities
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      r = r.filter(
        (a) =>
          (a.nftContract ?? "").toLowerCase().includes(q) ||
          (a.nftTokenId ?? "").toLowerCase().includes(q) ||
          (a.from ?? "").toLowerCase().includes(q) ||
          (a.offerer ?? "").toLowerCase().includes(q) ||
          (a.txHash ?? "").toLowerCase().includes(q)
      )
    }
    if (typeFilter !== "all") r = r.filter((a) => a.type === typeFilter)
    return r
  }, [activities, debouncedSearch, typeFilter])

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filtered,
    clearFilters: () => {
      setSearchQuery("")
      setTypeFilter("all")
    },
    hasActiveFilters: debouncedSearch !== "" || typeFilter !== "all",
  }
}
