/**
 * Advanced Search System
 *
 * This file implements an enhanced search system for the knowledge base,
 * with features like relevance scoring, match highlighting, and fuzzy matching.
 */

import { getSettings } from "./settings"
import type { SearchResult } from "./types"
import { getAllEntries } from "./database"
import { levenshteinSimilarity, expandQuery, rankResults, calculateTFIDF, jaccardSimilarity } from "./algorithms"

/**
 * Search the knowledge base with advanced features
 * @param query The search query
 * @returns Search results with relevance scores and match information
 */
export const searchKnowledgeBase = async (query: string): Promise<SearchResult[]> => {
  try {
    const settings = await getSettings()
    if (!query.trim()) return []

    // Get all entries
    const allEntries = await getAllEntries()

    // Normalize the query
    const normalizedQuery = query.toLowerCase().trim()
    const queryTerms = normalizedQuery.split(/\s+/).filter((term) => term.length > 2)

    if (queryTerms.length === 0) return []

    // Expand the query with related terms for better recall
    const expandedQuery = expandQuery(normalizedQuery, allEntries)
    const expandedTerms = expandedQuery.split(/\s+/).filter((term) => !queryTerms.includes(term))

    // Score each entry based on relevance to the query
    const scoredEntries: SearchResult[] = allEntries.map((entry) => {
      const titleText = entry.title.toLowerCase()
      const contentText = entry.content.toLowerCase()
      let score = 0
      const matches: SearchResult["matches"] = []

      // Check for exact matches in title (highest priority)
      if (titleText.includes(normalizedQuery)) {
        score += 10
        const startPos = titleText.indexOf(normalizedQuery)
        matches.push({
          field: "title",
          positions: [[startPos, startPos + normalizedQuery.length]],
        })
      }

      // Check for term matches in title
      for (const term of queryTerms) {
        if (titleText.includes(term)) {
          score += 3

          // Find all occurrences of the term in the title
          let pos = 0
          const positions: [number, number][] = []

          while ((pos = titleText.indexOf(term, pos)) !== -1) {
            positions.push([pos, pos + term.length])
            pos += term.length
          }

          if (positions.length > 0) {
            matches.push({
              field: "title",
              positions,
            })
          }
        }
      }

      // Check for expanded term matches in title (lower priority)
      for (const term of expandedTerms) {
        if (titleText.includes(term)) {
          score += 1.5

          let pos = 0
          const positions: [number, number][] = []

          while ((pos = titleText.indexOf(term, pos)) !== -1) {
            positions.push([pos, pos + term.length])
            pos += term.length
          }

          if (positions.length > 0) {
            matches.push({
              field: "title",
              positions,
            })
          }
        }
      }

      // Check for exact matches in content
      if (contentText.includes(normalizedQuery)) {
        score += 5
        const startPos = contentText.indexOf(normalizedQuery)
        matches.push({
          field: "content",
          positions: [[startPos, startPos + normalizedQuery.length]],
        })
      }

      // Check for term matches in content
      for (const term of queryTerms) {
        if (contentText.includes(term)) {
          score += 1

          // Find all occurrences of the term in the content
          let pos = 0
          const positions: [number, number][] = []

          while ((pos = contentText.indexOf(term, pos)) !== -1) {
            positions.push([pos, pos + term.length])
            pos += term.length
          }

          if (positions.length > 0) {
            matches.push({
              field: "content",
              positions,
            })
          }
        }
      }

      // Check for expanded term matches in content
      for (const term of expandedTerms) {
        if (contentText.includes(term)) {
          score += 0.5

          let pos = 0
          const positions: [number, number][] = []

          while ((pos = contentText.indexOf(term, pos)) !== -1) {
            positions.push([pos, pos + term.length])
            pos += term.length
          }

          if (positions.length > 0) {
            matches.push({
              field: "content",
              positions,
            })
          }
        }
      }

      // Check for keyword matches
      for (const keyword of entry.keywords) {
        const keywordLower = keyword.toLowerCase()

        // Exact keyword match
        if (keywordLower === normalizedQuery) {
          score += 5
        }

        // Keyword contains query
        else if (keywordLower.includes(normalizedQuery)) {
          score += 3
        }

        // Query terms match keyword
        for (const term of queryTerms) {
          if (keywordLower.includes(term)) {
            score += 2
          }
        }

        // Fuzzy matching for keywords
        for (const term of queryTerms) {
          const similarity = levenshteinSimilarity(term, keywordLower)
          if (similarity > 0.8) {
            score += similarity * 2
          }
        }
      }

      // Add TF-IDF scoring for more accurate term weighting
      const allDocuments = allEntries.map((e) => e.title + " " + e.content)
      const document = entry.title + " " + entry.content

      for (const term of queryTerms) {
        const tfidf = calculateTFIDF(term, document, allDocuments)
        score += tfidf * 2
      }

      // Add Jaccard similarity between query terms and document terms
      const documentTerms = new Set(
        document
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 2),
      )
      const queryTermSet = new Set(queryTerms)
      const jaccardScore = jaccardSimilarity(queryTermSet, documentTerms)
      score += jaccardScore * 3

      return { entry, score, matches }
    })

    // Filter by relevance threshold and sort by score
    let filteredResults = scoredEntries
      .filter((item) => item.score > settings.relevanceThreshold * 10) // Scale threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, settings.maxResults)

    // Apply advanced ranking algorithms
    filteredResults = rankResults(normalizedQuery, filteredResults, allEntries)

    return filteredResults
  } catch (error) {
    console.error("Search failed:", error)
    return []
  }
}

/**
 * Calculate similarity between two strings
 * @param text1 First string
 * @param text2 Second string
 * @returns Similarity score between 0 and 1
 */
export const calculateSimilarity = (text1: string, text2: string): number => {
  try {
    // Convert to lowercase and tokenize
    const tokens1 = text1
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)
    const tokens2 = text2
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)

    // Create sets for Jaccard similarity
    const set1 = new Set(tokens1)
    const set2 = new Set(tokens2)

    // Calculate Jaccard similarity
    const intersection = new Set([...set1].filter((x) => set2.has(x)))
    const union = new Set([...set1, ...set2])
    const jaccardScore = intersection.size / union.size

    // Calculate Levenshtein similarity for short texts
    let levenshteinScore = 0
    if (text1.length < 100 && text2.length < 100) {
      levenshteinScore = levenshteinSimilarity(text1, text2)
    }

    // Combine scores with appropriate weights
    return jaccardScore * 0.7 + levenshteinScore * 0.3
  } catch (error) {
    console.error("Failed to calculate similarity:", error)
    return 0
  }
}

/**
 * Highlight matches in text
 * @param text The original text
 * @param positions Array of [start, end] positions to highlight
 * @returns Text with HTML highlighting
 */
export const highlightMatches = (text: string, positions: [number, number][]): string => {
  try {
    if (!positions || positions.length === 0) return text

    // Sort positions by start index (descending)
    const sortedPositions = [...positions].sort((a, b) => b[0] - a[0])

    let result = text

    // Insert highlight tags from end to beginning to avoid position shifts
    for (const [start, end] of sortedPositions) {
      const prefix = result.substring(0, start)
      const match = result.substring(start, end)
      const suffix = result.substring(end)

      result = `${prefix}<mark class="bg-[#1aff80]/30 text-white px-0.5 rounded">${match}</mark>${suffix}`
    }

    return result
  } catch (error) {
    console.error("Failed to highlight matches:", error)
    return text
  }
}

/**
 * Get context around a match in text
 * @param text The original text
 * @param position The [start, end] position of the match
 * @param contextSize Number of characters to include before and after the match
 * @returns Text with context around the match
 */
export const getMatchContext = (text: string, position: [number, number], contextSize = 50): string => {
  try {
    const [start, end] = position

    // Calculate context boundaries
    const contextStart = Math.max(0, start - contextSize)
    const contextEnd = Math.min(text.length, end + contextSize)

    // Extract context
    let context = text.substring(contextStart, contextEnd)

    // Add ellipsis if context is truncated
    if (contextStart > 0) context = `...${context}`
    if (contextEnd < text.length) context = `${context}...`

    return context
  } catch (error) {
    console.error("Failed to get match context:", error)
    return text
  }
}

/**
 * Perform fuzzy search on text
 * @param text The text to search in
 * @param query The search query
 * @returns Score between 0 and 1, higher is better match
 */
export const fuzzySearch = (text: string, query: string): number => {
  try {
    return levenshteinSimilarity(text.toLowerCase(), query.toLowerCase())
  } catch (error) {
    console.error("Failed to perform fuzzy search:", error)
    return 0
  }
}
