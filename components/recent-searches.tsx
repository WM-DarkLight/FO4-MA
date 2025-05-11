"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getRecentSearches } from "@/lib/database"
import { Clock, X } from "lucide-react"

interface RecentSearchesProps {
  onSelect: (query: string) => void
  limit?: number
}

export function RecentSearches({ onSelect, limit = 5 }: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSearches = async () => {
      setIsLoading(true)
      try {
        const recentSearches = await getRecentSearches(limit)
        setSearches(recentSearches)
      } catch (error) {
        console.error("Failed to load recent searches:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSearches()
  }, [limit])

  if (isLoading || searches.length === 0) return null

  return (
    <div className="mt-2">
      <div className="flex items-center text-[#1aff80]/70 text-xs mb-1">
        <Clock className="h-3 w-3 mr-1" />
        <span>Recent Searches</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <Button
            key={search}
            variant="outline"
            size="sm"
            className="h-7 px-2 py-0 text-xs border-[#1aff80]/30 bg-[#1aff80]/10 text-[#1aff80]/80 hover:bg-[#1aff80]/20 hover:text-[#1aff80]"
            onClick={() => onSelect(search)}
          >
            {search}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-[#1aff80]/50 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
          onClick={() => setSearches([])}
          title="Clear recent searches"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
