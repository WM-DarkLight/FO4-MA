/**
 * Advanced Algorithms for Natural Language Processing
 *
 * This file implements various algorithms to improve the accuracy and relevance
 * of the chatbot's responses, including TF-IDF, BM25, cosine similarity,
 * and other NLP techniques.
 */

import type { KnowledgeEntry, SearchResult } from "./types"
import { calculateSimilarity } from "./search"

/**
 * Calculate Term Frequency (TF) for a term in a document
 * @param term The term to calculate frequency for
 * @param document The document text
 * @returns The term frequency
 */
export const calculateTF = (term: string, document: string): number => {
  const termCount = document.toLowerCase().split(term.toLowerCase()).length - 1
  const wordCount = document.split(/\s+/).length
  return termCount / wordCount
}

/**
 * Calculate Inverse Document Frequency (IDF) for a term across documents
 * @param term The term to calculate IDF for
 * @param documents Array of document texts
 * @returns The IDF value
 */
export const calculateIDF = (term: string, documents: string[]): number => {
  const numDocsWithTerm = documents.filter((doc) => doc.toLowerCase().includes(term.toLowerCase())).length

  // Add 1 to prevent division by zero
  return Math.log(documents.length / (numDocsWithTerm + 1)) + 1
}

/**
 * Calculate TF-IDF score for a term in a document
 * @param term The term to calculate TF-IDF for
 * @param document The document text
 * @param documents Array of all document texts
 * @returns The TF-IDF score
 */
export const calculateTFIDF = (term: string, document: string, documents: string[]): number => {
  const tf = calculateTF(term, document)
  const idf = calculateIDF(term, documents)
  return tf * idf
}

/**
 * Calculate BM25 score for a query against a document
 * BM25 is a ranking function used by search engines to rank documents by relevance
 *
 * @param query The search query
 * @param document The document text
 * @param avgDocLength Average document length in the collection
 * @param documents All documents in the collection
 * @param k1 Term frequency saturation parameter (1.2-2.0 is typical)
 * @param b Length normalization parameter (0.75 is typical)
 * @returns The BM25 score
 */
export const calculateBM25 = (
  query: string,
  document: string,
  avgDocLength: number,
  documents: string[],
  k1 = 1.5,
  b = 0.75,
): number => {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)
  const docLength = document.split(/\s+/).length

  let score = 0

  for (const term of terms) {
    const tf = calculateTF(term, document)
    const idf = calculateIDF(term, documents)

    // BM25 formula
    const numerator = tf * (k1 + 1)
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength))

    score += idf * (numerator / denominator)
  }

  return score
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and spelling correction
 *
 * @param str1 First string
 * @param str2 Second string
 * @returns The Levenshtein distance
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  return track[str2.length][str1.length]
}

/**
 * Calculate normalized Levenshtein similarity (0-1)
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
export const levenshteinSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1 // Both strings are empty

  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLength
}

/**
 * Jaccard similarity coefficient between two sets
 * @param set1 First set
 * @param set2 Second set
 * @returns Similarity score between 0 and 1
 */
export const jaccardSimilarity = (set1: Set<string>, set2: Set<string>): number => {
  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Calculate cosine similarity between two vectors
 * @param vec1 First vector
 * @param vec2 Second vector
 * @returns Similarity score between 0 and 1
 */
export const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let mag1 = 0
  let mag2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    mag1 += vec1[i] * vec1[i]
    mag2 += vec2[i] * vec2[i]
  }

  mag1 = Math.sqrt(mag1)
  mag2 = Math.sqrt(mag2)

  if (mag1 === 0 || mag2 === 0) return 0

  return dotProduct / (mag1 * mag2)
}

/**
 * Create a term frequency vector for a document
 * @param terms Array of terms to consider
 * @param document The document text
 * @returns Vector of term frequencies
 */
export const createTermFrequencyVector = (terms: string[], document: string): number[] => {
  const docLower = document.toLowerCase()
  return terms.map((term) => {
    const termLower = term.toLowerCase()
    const count = docLower.split(termLower).length - 1
    return count / document.split(/\s+/).length
  })
}

/**
 * Perform query expansion to improve search results
 * @param query Original query
 * @param entries Knowledge entries to analyze for related terms
 * @returns Expanded query with additional relevant terms
 */
export const expandQuery = (query: string, entries: KnowledgeEntry[]): string => {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)
  const expandedTerms = new Set(queryTerms)

  // Find related terms from entries with high similarity to the query
  for (const entry of entries) {
    const similarity = calculateSimilarity(query, entry.title + " " + entry.content)

    if (similarity > 0.3) {
      // Extract potential expansion terms from this entry
      const entryTerms = (entry.title + " " + entry.content)
        .toLowerCase()
        .split(/\s+/)
        .filter(
          (term) =>
            term.length > 3 &&
            !queryTerms.includes(term) &&
            !term.match(
              /^(the|and|but|for|or|nor|so|yet|a|an|in|to|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|from|up|down|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|can|will|just)$/i,
            ),
        )

      // Add most relevant terms to expanded query
      for (const term of entryTerms) {
        if (
          queryTerms.some(
            (qTerm) => levenshteinSimilarity(qTerm, term) > 0.7 || term.includes(qTerm) || qTerm.includes(term),
          )
        ) {
          expandedTerms.add(term)
        }
      }
    }
  }

  // Limit expansion to prevent query drift
  const finalTerms = [...expandedTerms].slice(0, queryTerms.length + 3)
  return finalTerms.join(" ")
}

/**
 * Rank search results using a combination of algorithms
 * @param query The search query
 * @param results Initial search results
 * @param allEntries All knowledge entries
 * @returns Re-ranked search results
 */
export const rankResults = (query: string, results: SearchResult[], allEntries: KnowledgeEntry[]): SearchResult[] => {
  if (results.length === 0) return []

  // Calculate average document length
  const avgDocLength = allEntries.reduce((sum, entry) => sum + entry.content.split(/\s+/).length, 0) / allEntries.length

  // Get all document texts for IDF calculation
  const allDocuments = allEntries.map((entry) => entry.title + " " + entry.content)

  // Calculate combined scores using multiple algorithms
  const scoredResults = results.map((result) => {
    const entry = result.entry
    const document = entry.title + " " + entry.content

    // Original score from basic search
    let finalScore = result.score

    // Add BM25 score
    const bm25Score = calculateBM25(query, document, avgDocLength, allDocuments)
    finalScore += bm25Score * 5 // Weight BM25 more heavily

    // Add TF-IDF score for each query term
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2)
    for (const term of queryTerms) {
      const tfIdfScore = calculateTFIDF(term, document, allDocuments)
      finalScore += tfIdfScore * 3
    }

    // Add Levenshtein similarity for fuzzy matching
    const titleSimilarity = levenshteinSimilarity(query.toLowerCase(), entry.title.toLowerCase())
    finalScore += titleSimilarity * 2

    // Add keyword relevance
    const querySet = new Set(queryTerms)
    const keywordSet = new Set(entry.keywords.map((k) => k.toLowerCase()))
    const keywordSimilarity = jaccardSimilarity(querySet, keywordSet)
    finalScore += keywordSimilarity * 4

    return {
      ...result,
      score: finalScore,
    }
  })

  // Sort by final score
  return scoredResults.sort((a, b) => b.score - a.score)
}

/**
 * Generate a contextual response based on search results and conversation history
 * @param query User query
 * @param results Search results
 * @param conversationHistory Previous messages
 * @returns Generated response
 */
export const generateResponse = (
  query: string,
  results: SearchResult[],
  conversationHistory: { role: string; content: string }[],
): string => {
  if (results.length === 0) {
    return "I don't have specific information about that in my knowledge base. Try asking about mod installation, weapon modifications, armor customization, settlement building, or graphics enhancements. You can also browse the Knowledge Base tab to see all available information."
  }

  // Get the most relevant result
  const topResult = results[0]
  let response = topResult.entry.content

  // Check conversation context to see if this is a follow-up question
  const isFollowUp =
    conversationHistory.length >= 3 && conversationHistory[conversationHistory.length - 2].role === "user"

  if (isFollowUp) {
    const previousQuery = conversationHistory[conversationHistory.length - 2].content
    const previousResponse = conversationHistory[conversationHistory.length - 1].content

    // If current query is related to previous query, provide a more contextual response
    const similarity = calculateSimilarity(previousQuery, query)

    if (similarity > 0.3) {
      // This is likely a follow-up question
      response = `To follow up on your previous question: ${response}`
    }
  }

  // If there are multiple relevant results, add a note about additional information
  if (results.length > 1) {
    // Check if second result is significantly relevant
    if (results[1].score > results[0].score * 0.7) {
      response += "\n\nI have more information on this topic. Would you like to know more about any specific aspect?"
    }
  }

  return response
}
