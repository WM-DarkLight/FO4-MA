"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getRecentSearches } from "@/lib/database"
import { useState, useEffect } from "react"

interface SearchAnalyticsProps {
  searchHistory?: { query: string; timestamp: number }[]
  className?: string
}

export function SearchAnalytics({ className }: SearchAnalyticsProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchStats, setSearchStats] = useState<{ name: string; count: number }[]>([])
  const [activeTab, setActiveTab] = useState("frequency")

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        // Get recent searches (up to 20)
        const searches = await getRecentSearches(20)
        setRecentSearches(searches)

        // Calculate frequency of search terms
        const termCounts = new Map<string, number>()

        for (const search of searches) {
          const terms = search
            .toLowerCase()
            .split(/\s+/)
            .filter((term) => term.length > 2)

          for (const term of terms) {
            termCounts.set(term, (termCounts.get(term) || 0) + 1)
          }
        }

        // Convert to array and sort by count
        const stats = Array.from(termCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) // Top 10 terms

        setSearchStats(stats)
      } catch (error) {
        console.error("Failed to load search analytics:", error)
      }
    }

    loadSearchData()
  }, [])

  const COLORS = [
    "#1aff80",
    "#14cc66",
    "#0f994d",
    "#0a6633",
    "#05331a",
    "#14b8cc",
    "#0f99a8",
    "#0a6673",
    "#05333a",
    "#033333",
  ]

  return (
    <Card className={`fallout-card ${className}`}>
      <CardHeader>
        <CardTitle className="text-[#1aff80]">Search Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4 bg-black/50">
            <TabsTrigger value="frequency" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Term Frequency
            </TabsTrigger>
            <TabsTrigger value="distribution" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frequency" className="h-64">
            {searchStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchStats} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "#1aff80", fontSize: 12 }} axisLine={{ stroke: "#1aff80" }} />
                  <YAxis tick={{ fill: "#1aff80", fontSize: 12 }} axisLine={{ stroke: "#1aff80" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid #1aff80",
                      color: "#1aff80",
                    }}
                  />
                  <Bar dataKey="count" fill="#1aff80" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#1aff80]/70">
                No search data available yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="h-64">
            {searchStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={searchStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {searchStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid #1aff80",
                      color: "#1aff80",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#1aff80]/70">
                No search data available yet
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <h4 className="text-[#1aff80] text-sm font-medium mb-2">Recent Searches</h4>
          <div className="flex flex-wrap gap-2">
            {recentSearches.length > 0 ? (
              recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="bg-black/50 border border-[#1aff80]/30 rounded px-2 py-1 text-xs text-[#1aff80]"
                >
                  {search}
                </div>
              ))
            ) : (
              <div className="text-[#1aff80]/70 text-xs">No recent searches</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
