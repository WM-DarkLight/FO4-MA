"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, AlertTriangle, Check, BarChart2, BookOpen, Search } from "lucide-react"
import { getAllEntries } from "@/lib/database"
import type { KnowledgeEntry } from "@/lib/types"
import { calculateTFIDF, jaccardSimilarity, levenshteinSimilarity } from "@/lib/algorithms"

export function ContentQualityAnalyzer() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({})
  const [duplicateGroups, setDuplicateGroups] = useState<{ entries: KnowledgeEntry[]; similarity: number }[]>([])
  const [keywordStats, setKeywordStats] = useState<{ keyword: string; count: number; importance: number }[]>([])
  const [contentGaps, setContentGaps] = useState<string[]>([])

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const allEntries = await getAllEntries()
      setEntries(allEntries)

      // Run initial analysis
      if (allEntries.length > 0) {
        analyzeContent(allEntries)
      }
    } catch (error) {
      console.error("Failed to load entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeContent = async (entriesToAnalyze = entries) => {
    if (entriesToAnalyze.length === 0) return

    setIsAnalyzing(true)
    try {
      // Calculate quality scores for each entry
      const scores: Record<string, number> = {}

      // Get all document texts for TF-IDF calculation
      const allDocuments = entriesToAnalyze.map((entry) => entry.title + " " + entry.content)

      // Calculate quality scores
      for (const entry of entriesToAnalyze) {
        let score = 0
        const document = entry.title + " " + entry.content

        // Length score (0-25)
        const contentLength = entry.content.length
        score += Math.min(25, contentLength / 20)

        // Structure score (0-25)
        const hasBulletPoints = entry.content.includes("1.") && entry.content.includes("2.")
        const hasFormatting = entry.content.includes("**") || entry.content.includes("*")
        const hasGoodParagraphs = entry.content.split("\n").filter((p) => p.trim().length > 0).length >= 2

        if (hasBulletPoints) score += 10
        if (hasFormatting) score += 5
        if (hasGoodParagraphs) score += 10

        // Keyword coverage score (0-25)
        const keywordCoverage = entry.keywords.length / 5 // Aim for at least 5 keywords
        score += Math.min(25, keywordCoverage * 25)

        // Uniqueness score (0-25)
        const similarities = entriesToAnalyze
          .filter((e) => e.id !== entry.id)
          .map((e) => {
            return jaccardSimilarity(
              new Set(document.toLowerCase().split(/\s+/)),
              new Set((e.title + " " + e.content).toLowerCase().split(/\s+/)),
            )
          })

        const maxSimilarity = similarities.length > 0 ? Math.max(...similarities) : 0
        const uniquenessScore = 25 * (1 - maxSimilarity)
        score += uniquenessScore

        scores[entry.id] = Math.min(100, Math.round(score))
      }

      setQualityScores(scores)

      // Find potential duplicates
      const duplicates: { entries: KnowledgeEntry[]; similarity: number }[] = []
      const processedPairs = new Set<string>()

      for (let i = 0; i < entriesToAnalyze.length; i++) {
        for (let j = i + 1; j < entriesToAnalyze.length; j++) {
          const entry1 = entriesToAnalyze[i]
          const entry2 = entriesToAnalyze[j]

          // Skip if already processed this pair
          const pairKey = [entry1.id, entry2.id].sort().join("-")
          if (processedPairs.has(pairKey)) continue

          processedPairs.add(pairKey)

          const doc1 = entry1.title + " " + entry1.content
          const doc2 = entry2.title + " " + entry2.content

          const similarity = jaccardSimilarity(
            new Set(doc1.toLowerCase().split(/\s+/)),
            new Set(doc2.toLowerCase().split(/\s+/)),
          )

          if (similarity > 0.5) {
            // Check if this entry should be added to an existing group
            let addedToGroup = false

            for (const group of duplicates) {
              if (group.entries.some((e) => e.id === entry1.id || e.id === entry2.id)) {
                // Add the missing entry to this group
                if (!group.entries.some((e) => e.id === entry1.id)) {
                  group.entries.push(entry1)
                }
                if (!group.entries.some((e) => e.id === entry2.id)) {
                  group.entries.push(entry2)
                }
                // Update similarity if higher
                if (similarity > group.similarity) {
                  group.similarity = similarity
                }
                addedToGroup = true
                break
              }
            }

            if (!addedToGroup) {
              duplicates.push({
                entries: [entry1, entry2],
                similarity,
              })
            }
          }
        }
      }

      setDuplicateGroups(duplicates)

      // Analyze keywords
      const keywordCounts: Record<string, number> = {}
      const keywordImportance: Record<string, number> = {}

      // Count keywords and calculate importance
      for (const entry of entriesToAnalyze) {
        for (const keyword of entry.keywords) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1

          // Calculate importance using TF-IDF
          const tfidf = calculateTFIDF(keyword, entry.title + " " + entry.content, allDocuments)
          keywordImportance[keyword] = (keywordImportance[keyword] || 0) + tfidf
        }
      }

      // Convert to array and sort
      const keywordArray = Object.keys(keywordCounts).map((keyword) => ({
        keyword,
        count: keywordCounts[keyword],
        importance: keywordImportance[keyword],
      }))

      // Sort by count and importance
      keywordArray.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return b.importance - a.importance
      })

      setKeywordStats(keywordArray.slice(0, 20))

      // Identify potential content gaps
      const commonKeywords = [
        "installation",
        "troubleshooting",
        "performance",
        "compatibility",
        "load order",
        "crash",
        "tutorial",
        "guide",
        "fix",
        "optimization",
        "settings",
        "configuration",
        "requirements",
        "update",
        "patch",
      ]

      const missingKeywords = commonKeywords.filter((keyword) => {
        // Check if this keyword or similar ones are covered
        return !entriesToAnalyze.some((entry) =>
          entry.keywords.some(
            (k) =>
              k === keyword || levenshteinSimilarity(k, keyword) > 0.8 || k.includes(keyword) || keyword.includes(k),
          ),
        )
      })

      setContentGaps(missingKeywords)
    } catch (error) {
      console.error("Error analyzing content:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
        <p className="text-[#1aff80]/70">Loading entries...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[#1aff80] text-xl font-bold flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Knowledge Base Analysis
        </h2>

        <Button
          onClick={() => analyzeContent()}
          className="fallout-button"
          disabled={entries.length === 0 || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" /> Analyze Content
            </>
          )}
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="fallout-card border-[#1aff80]/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-[#1aff80]/30 mb-4" />
              <h3 className="text-[#1aff80] text-lg mb-2">No Entries Found</h3>
              <p className="text-[#1aff80]/70 max-w-md">
                Add some knowledge entries to analyze the quality and organization of your knowledge base.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="fallout-card border-[#1aff80]/30">
            <CardHeader>
              <CardTitle className="text-[#1aff80] flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Content Quality Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
                  <p className="text-[#1aff80]/70">Analyzing content quality...</p>
                </div>
              ) : Object.keys(qualityScores).length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {entries
                      .sort((a, b) => (qualityScores[b.id] || 0) - (qualityScores[a.id] || 0))
                      .map((entry) => (
                        <div key={entry.id} className="border border-[#1aff80]/20 rounded-md p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-[#1aff80]/90 font-medium">{entry.title}</h4>
                            <Badge
                              className={`
                                ${
                                  qualityScores[entry.id] >= 80
                                    ? "bg-green-500/20 text-green-400"
                                    : qualityScores[entry.id] >= 60
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }
                              `}
                            >
                              {qualityScores[entry.id] || 0}/100
                            </Badge>
                          </div>

                          <div className="w-full bg-black/50 rounded-full h-2 mb-3">
                            <div
                              className={`h-2 rounded-full ${
                                qualityScores[entry.id] >= 80
                                  ? "bg-green-500"
                                  : qualityScores[entry.id] >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${qualityScores[entry.id] || 0}%` }}
                            ></div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="bg-[#1aff80]/10 text-[#1aff80]/70 text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-[#1aff80]/30 mb-4" />
                  <p className="text-[#1aff80]/70">
                    Click "Analyze Content" to evaluate the quality of your knowledge entries.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="fallout-card border-[#1aff80]/30">
            <CardHeader>
              <CardTitle className="text-[#1aff80] flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
                  <p className="text-[#1aff80]/70">Analyzing keywords...</p>
                </div>
              ) : keywordStats.length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#1aff80]/90 font-medium mb-2">Top Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {keywordStats.map((stat, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs border border-[#1aff80]/30"
                            style={{
                              backgroundColor: `rgba(26, 255, 128, ${0.05 + (stat.count / Math.max(...keywordStats.map((s) => s.count))) * 0.15})`,
                              fontSize: `${Math.max(11, Math.min(14, 11 + (stat.count / Math.max(...keywordStats.map((s) => s.count))) * 3))}px`,
                            }}
                          >
                            {stat.keyword}
                            <span className="text-[#1aff80]/50 ml-1">({stat.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {contentGaps.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-[#1aff80]/90 font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                          Potential Content Gaps
                        </h4>
                        <p className="text-gray-300 text-sm mb-2">
                          These common topics might be missing from your knowledge base:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {contentGaps.map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {duplicateGroups.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-[#1aff80]/90 font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                          Potential Duplicate Content
                        </h4>
                        <div className="space-y-3">
                          {duplicateGroups.map((group, idx) => (
                            <div key={idx} className="border border-yellow-500/30 rounded-md p-3 bg-yellow-500/5">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-yellow-400 text-sm font-medium">
                                  {group.entries.length} similar entries
                                </span>
                                <Badge className="bg-yellow-500/20 text-yellow-400">
                                  {Math.round(group.similarity * 100)}% similar
                                </Badge>
                              </div>
                              <ul className="space-y-1 text-gray-300 text-sm">
                                {group.entries.map((entry) => (
                                  <li key={entry.id} className="truncate">
                                    {entry.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-[#1aff80]/30 mb-4" />
                  <p className="text-[#1aff80]/70">
                    Click "Analyze Content" to evaluate keywords and identify content gaps.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="fallout-card border-[#1aff80]/30">
        <CardHeader>
          <CardTitle className="text-[#1aff80] flex items-center">
            <Check className="h-5 w-5 mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
              <p className="text-[#1aff80]/70">Generating recommendations...</p>
            </div>
          ) : Object.keys(qualityScores).length > 0 ? (
            <div className="space-y-4">
              <ul className="space-y-2 text-gray-300">
                {entries.filter((e) => (qualityScores[e.id] || 0) < 60).length > 0 && (
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span>
                      Improve {entries.filter((e) => (qualityScores[e.id] || 0) < 60).length} low-quality entries by
                      adding more detailed content, numbered steps, and formatting.
                    </span>
                  </li>
                )}

                {contentGaps.length > 0 && (
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span>
                      Consider adding content about: {contentGaps.slice(0, 5).join(", ")}
                      {contentGaps.length > 5 ? ` and ${contentGaps.length - 5} more topics` : ""}.
                    </span>
                  </li>
                )}

                {duplicateGroups.length > 0 && (
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span>
                      Review and consolidate {duplicateGroups.length} groups of similar entries to avoid duplication.
                    </span>
                  </li>
                )}

                {entries.filter((e) => e.keywords.length < 3).length > 0 && (
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span>
                      Add more keywords to {entries.filter((e) => e.keywords.length < 3).length} entries to improve
                      searchability.
                    </span>
                  </li>
                )}

                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                  <span>
                    Your knowledge base contains {entries.length} entries across{" "}
                    {new Set(entries.map((e) => e.moduleId)).size} modules.
                  </span>
                </li>

                {entries.filter((e) => (qualityScores[e.id] || 0) >= 80).length > 0 && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                    <span>
                      {entries.filter((e) => (qualityScores[e.id] || 0) >= 80).length} entries have excellent quality
                      scores. Great job!
                    </span>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-12 w-12 text-[#1aff80]/30 mb-4" />
              <p className="text-[#1aff80]/70">
                Click "Analyze Content" to get personalized recommendations for improving your knowledge base.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
