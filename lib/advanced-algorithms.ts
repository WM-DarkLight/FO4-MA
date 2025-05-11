/**
 * Advanced Algorithms for Fallout Modding Assistant
 *
 * This file implements sophisticated algorithms for:
 * - Context-aware response generation
 * - Sentiment analysis
 * - Adaptive learning
 * - Recommendation systems
 * - Topic modeling
 */

import type { KnowledgeEntry } from "./types"
import { calculateSimilarity, fuzzySearch } from "./search"
import { getUserInterests, getUserPreferences, updateUserPreference } from "./user-memory"

/**
 * Sentiment Analysis - Detects user's emotional state from text
 * @param text User's message
 * @returns Object containing sentiment scores and detected emotions
 */
export const analyzeSentiment = (
  text: string,
): {
  sentiment: "positive" | "negative" | "neutral"
  score: number
  emotions: string[]
  isFrustrated: boolean
} => {
  const lowerText = text.toLowerCase()

  // Emotion lexicons
  const positiveWords = [
    "thanks",
    "thank",
    "good",
    "great",
    "awesome",
    "excellent",
    "helpful",
    "appreciate",
    "works",
    "working",
    "solved",
    "solution",
    "perfect",
    "love",
  ]

  const negativeWords = [
    "not",
    "doesn't",
    "don't",
    "can't",
    "won't",
    "bad",
    "terrible",
    "awful",
    "useless",
    "broken",
    "crash",
    "error",
    "problem",
    "issue",
    "bug",
    "fail",
    "failed",
    "failing",
    "sucks",
    "horrible",
    "waste",
    "frustrated",
    "annoying",
  ]

  const frustrationIndicators = [
    "still not working",
    "tried everything",
    "nothing works",
    "keeps crashing",
    "same error",
    "again",
    "!!",
    "???",
    "wtf",
    "what the",
    "omg",
    "oh my god",
    "for the last time",
    "already tried",
    "told you",
    "i said",
    "i already",
  ]

  // Count word occurrences
  let positiveCount = 0
  let negativeCount = 0
  let frustrationCount = 0

  // Check for positive words
  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++
  }

  // Check for negative words
  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++
  }

  // Check for frustration indicators
  for (const phrase of frustrationIndicators) {
    if (lowerText.includes(phrase)) frustrationCount += 2
  }

  // Check for punctuation and capitalization as frustration indicators
  const exclamationCount = (text.match(/!/g) || []).length
  const questionCount = (text.match(/\?/g) || []).length
  const capsRatio = text.split("").filter((c) => c >= "A" && c <= "Z").length / text.length

  if (exclamationCount > 2) frustrationCount++
  if (questionCount > 3) frustrationCount++
  if (capsRatio > 0.3 && text.length > 10) frustrationCount += 2

  // Calculate overall sentiment score (-1 to 1)
  const totalWords = text.split(/\s+/).length
  const sentimentScore = (positiveCount - negativeCount) / Math.max(totalWords / 2, 1)

  // Determine emotions
  const emotions: string[] = []
  if (positiveCount > 0) {
    if (positiveCount > 2) emotions.push("happy")
    emotions.push("satisfied")
  }
  if (negativeCount > 0) {
    if (negativeCount > 2) emotions.push("upset")
    emotions.push("dissatisfied")
  }
  if (frustrationCount > 2) emotions.push("frustrated")
  if (exclamationCount > 2) emotions.push("excited")
  if (questionCount > 3) emotions.push("confused")

  // Determine overall sentiment
  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  if (sentimentScore > 0.2) sentiment = "positive"
  else if (sentimentScore < -0.2) sentiment = "negative"

  // Determine if user is frustrated
  const isFrustrated = frustrationCount > 2 || (negativeCount > 2 && frustrationCount > 0)

  return {
    sentiment,
    score: sentimentScore,
    emotions,
    isFrustrated,
  }
}

/**
 * Topic Modeling - Extracts main topics from a text
 * @param text The text to analyze
 * @returns Array of extracted topics with confidence scores
 */
export const extractTopics = (text: string): Array<{ topic: string; confidence: number }> => {
  const topics: Array<{ topic: string; confidence: number }> = []

  // Topic categories and their keywords
  const topicKeywords = {
    installation: ["install", "download", "setup", "vortex", "manager", "nexus", "mo2", "organizer"],
    performance: ["fps", "performance", "lag", "stutter", "crash", "freezing", "optimization", "smooth"],
    graphics: ["enb", "texture", "visual", "graphics", "reshade", "lighting", "weather", "appearance"],
    gameplay: ["balance", "difficulty", "combat", "mechanics", "gameplay", "overhaul", "feature"],
    weapons: ["gun", "rifle", "pistol", "weapon", "damage", "ammo", "ammunition", "firearm"],
    armor: ["armor", "outfit", "clothing", "gear", "protection", "costume", "apparel"],
    settlement: ["settlement", "building", "construct", "workshop", "camp", "base", "home"],
    companions: ["companion", "follower", "dogmeat", "piper", "cait", "danse", "preston"],
    quests: ["quest", "mission", "story", "narrative", "plot", "dialogue", "npc"],
    technical: ["conflict", "load order", "plugin", "esp", "esm", "script", "engine", "ctd", "compatibility"],
  }

  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)

  // Count keyword occurrences for each topic
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    let count = 0
    const matchedKeywords = new Set<string>()

    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        count++
        matchedKeywords.add(keyword)
      }
    }

    // Calculate confidence based on keyword matches and text length
    if (count > 0) {
      const uniqueMatches = matchedKeywords.size
      const confidence = Math.min(0.3 + (uniqueMatches / keywords.length) * 0.7, 1)
      topics.push({ topic, confidence })
    }
  }

  // Sort by confidence
  return topics.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Context-Aware Response Generation
 * Enhances responses based on conversation context and user preferences
 *
 * @param baseResponse The initial response text
 * @param userQuery The user's query
 * @param conversationHistory Previous messages
 * @param userPreferences User preferences and technical level
 * @returns Enhanced response
 */
export const enhanceResponseWithContext = async (
  baseResponse: string,
  userQuery: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userPreferences: { technicalLevel: string; interests: string[] },
): Promise<string> => {
  // Analyze sentiment
  const sentiment = analyzeSentiment(userQuery)

  // Extract topics
  const topics = extractTopics(userQuery)

  let enhancedResponse = baseResponse

  // Handle frustrated users with more empathetic responses
  if (sentiment.isFrustrated) {
    const empathyPhrases = [
      "I understand this can be frustrating. ",
      "I see you're having trouble with this. ",
      "Let's try to solve this together. ",
      "I know mod issues can be annoying, but we'll figure this out. ",
    ]

    const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)]
    enhancedResponse = randomEmpathy + enhancedResponse
  }

  // Adjust technical detail based on user's technical level
  if (
    userPreferences.technicalLevel === "beginner" &&
    topics.some((t) => t.topic === "technical" && t.confidence > 0.6)
  ) {
    enhancedResponse +=
      "\n\nSince you're new to modding, here's a simpler explanation: Think of mods like adding custom parts to a car. Sometimes parts don't fit together, and that's when you get conflicts. The load order is just deciding which parts get installed first."
  } else if (userPreferences.technicalLevel === "advanced" && topics.some((t) => t.topic === "technical")) {
    enhancedResponse +=
      "\n\nFor advanced users: You might want to check for script conflicts using xEdit or look at the Papyrus logs to identify the exact script causing issues."
  }

  // Add personalized recommendations based on interests
  if (
    userPreferences.interests.length > 0 &&
    (userQuery.toLowerCase().includes("recommend") || userQuery.toLowerCase().includes("suggestion"))
  ) {
    const interest = userPreferences.interests[0]
    enhancedResponse += `\n\nBased on your interest in ${interest}, you might also want to check out related mods in that category.`
  }

  // Check if this is a follow-up question
  if (conversationHistory.length >= 4) {
    const prevUserQuery = conversationHistory[conversationHistory.length - 3].content
    const prevResponse = conversationHistory[conversationHistory.length - 2].content

    const similarity = calculateSimilarity(prevUserQuery, userQuery)

    if (similarity > 0.4) {
      enhancedResponse = `To follow up on your previous question about "${prevUserQuery.substring(0, 30)}...": ${enhancedResponse}`
    }
  }

  return enhancedResponse
}

/**
 * Adaptive Learning System
 * Improves responses over time based on user interactions
 *
 * @param query User query
 * @param selectedResponse The response that was given
 * @param userFeedback Optional feedback (positive/negative)
 */
export const learnFromInteraction = async (
  query: string,
  selectedResponse: string,
  userFeedback?: "positive" | "negative",
): Promise<void> => {
  try {
    // Extract topics from the query
    const topics = extractTopics(query)

    // Update user interests based on topics
    if (topics.length > 0) {
      const topTopic = topics[0].topic
      const interests = await getUserInterests()

      // If this topic isn't already a top interest, add it
      if (!interests.includes(topTopic)) {
        interests.push(topTopic)
        // Keep only top 5 interests
        const updatedInterests = interests.slice(0, 5)
        await updateUserPreference("interests", updatedInterests)
      }
    }

    // If we have explicit feedback, use it to improve future responses
    if (userFeedback) {
      // This would connect to a feedback system in a real implementation
      console.log(`Received ${userFeedback} feedback for query: ${query}`)
    }
  } catch (error) {
    console.error("Error in adaptive learning:", error)
  }
}

/**
 * Advanced Recommendation System
 * Provides intelligent recommendations based on user history and current context
 *
 * @param currentQuery Current user query
 * @param allEntries All knowledge base entries
 * @returns Recommended entries
 */
export const getSmartRecommendations = async (
  currentQuery: string,
  allEntries: KnowledgeEntry[],
): Promise<KnowledgeEntry[]> => {
  try {
    // Get user interests and preferences
    const interests = await getUserInterests()
    const preferences = await getUserPreferences()

    // Extract topics from current query
    const queryTopics = extractTopics(currentQuery)

    // Score each entry based on relevance to query and user interests
    const scoredEntries = allEntries.map((entry) => {
      let score = 0

      // Base relevance to query
      score += calculateSimilarity(currentQuery, entry.title + " " + entry.content) * 5

      // Topic relevance
      for (const { topic, confidence } of queryTopics) {
        if (
          entry.title.toLowerCase().includes(topic) ||
          entry.content.toLowerCase().includes(topic) ||
          entry.keywords.some((k) => k.toLowerCase().includes(topic))
        ) {
          score += confidence * 3
        }
      }

      // User interest alignment
      for (const interest of interests) {
        if (
          entry.title.toLowerCase().includes(interest) ||
          entry.content.toLowerCase().includes(interest) ||
          entry.keywords.some((k) => k.toLowerCase().includes(interest))
        ) {
          score += 2
        }
      }

      // Technical level appropriateness
      const technicalTerms = ["script", "engine", "papyrus", "xedit", "conflict", "override", "priority"]
      const hasTechnicalContent = technicalTerms.some(
        (term) => entry.title.toLowerCase().includes(term) || entry.content.toLowerCase().includes(term),
      )

      if (hasTechnicalContent && preferences.technicalLevel === "beginner") {
        score -= 2 // Reduce score for technical content for beginners
      } else if (hasTechnicalContent && preferences.technicalLevel === "advanced") {
        score += 2 // Increase score for technical content for advanced users
      }

      return { entry, score }
    })

    // Sort by score and return top entries
    return scoredEntries
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.entry)
  } catch (error) {
    console.error("Error getting smart recommendations:", error)
    return []
  }
}

/**
 * Neural Text Similarity
 * Simulates a neural embedding-based similarity calculation
 *
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
export const neuralTextSimilarity = (text1: string, text2: string): number => {
  // This is a simplified simulation of neural embeddings
  // In a real implementation, this would use actual embeddings

  // Normalize and tokenize texts
  const tokens1 = text1
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
  const tokens2 = text2
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  // Create sets for unique tokens
  const set1 = new Set(tokens1)
  const set2 = new Set(tokens2)

  // Calculate Jaccard similarity
  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])
  const jaccardScore = intersection.size / union.size

  // Calculate fuzzy match score for non-exact matches
  let fuzzyScore = 0
  let matchCount = 0

  for (const token1 of tokens1) {
    for (const token2 of tokens2) {
      if (token1 !== token2) {
        const similarity = fuzzySearch(token1, token2)
        if (similarity > 0.8) {
          fuzzyScore += similarity
          matchCount++
        }
      }
    }
  }

  // Normalize fuzzy score
  const normalizedFuzzyScore = matchCount > 0 ? fuzzyScore / matchCount : 0

  // Combine scores with weights
  return jaccardScore * 0.7 + normalizedFuzzyScore * 0.3
}

/**
 * Contextual Memory Retrieval
 * Retrieves relevant information from past conversations
 *
 * @param currentQuery Current user query
 * @param conversationHistory Past conversation messages
 * @returns Relevant past exchanges
 */
export const retrieveContextualMemory = (
  currentQuery: string,
  conversationHistory: Array<{ role: string; content: string }>,
): Array<{ query: string; response: string; relevance: number }> => {
  const relevantExchanges: Array<{ query: string; response: string; relevance: number }> = []

  // Skip if history is too short
  if (conversationHistory.length < 4) return relevantExchanges

  // Process conversation history to extract query-response pairs
  for (let i = 0; i < conversationHistory.length - 1; i += 2) {
    if (
      conversationHistory[i].role === "user" &&
      i + 1 < conversationHistory.length &&
      conversationHistory[i + 1].role === "assistant"
    ) {
      const pastQuery = conversationHistory[i].content
      const pastResponse = conversationHistory[i + 1].content

      // Calculate relevance to current query
      const relevance = neuralTextSimilarity(currentQuery, pastQuery)

      if (relevance > 0.3) {
        relevantExchanges.push({
          query: pastQuery,
          response: pastResponse,
          relevance,
        })
      }
    }
  }

  // Sort by relevance and return top results
  return relevantExchanges.sort((a, b) => b.relevance - a.relevance).slice(0, 3)
}
