/**
 * User Memory System
 *
 * This file implements a system to store and retrieve user preferences,
 * conversation history, and personalization data.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import { nanoid } from "./utils"
import { extractTopics } from "./advanced-algorithms"

// Define user profile structure
interface UserProfile {
  id: string
  name: string
  preferences: {
    technicalLevel: "beginner" | "intermediate" | "advanced"
    theme: "default" | "dark" | "light" | "amber" | "blue"
    keyboardShortcuts: boolean
    searchHighlighting: boolean
    favoriteModTypes?: string[]
    preferredGameplay?: string
    modInterests?: string[]
  }
  stats: {
    questionsAsked: number
    lastActive: number
    topicsExplored: string[]
    conversationCount: number
    topicFrequency: Record<string, number>
    questionsAsked: number
    lastActive: number
  }
  createdAt: number
  updatedAt: number
}

// Define conversation memory structure
interface ConversationMemory {
  id: string
  userId: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: number
    topics: string[]
  }>
  topics: string[]
  createdAt: number
  updatedAt: number
}

// Database schema
interface UserMemoryDB extends DBSchema {
  userProfiles: {
    key: string
    value: UserProfile
    indexes: { "by-updated": number }
  }
  conversations: {
    key: string
    value: ConversationMemory
    indexes: { "by-user": string; "by-updated": number }
  }
}

// Database instance
let db: IDBPDatabase<UserMemoryDB>
const isInitialized = false
const currentUserId: string | null = null

// Initialize the database
export const initializeUserMemory = async (): Promise<void> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1, {
      upgrade(db) {
        // Create user profiles store
        if (!db.objectStoreNames.contains("userProfiles")) {
          db.createObjectStore("userProfiles", { keyPath: "id" })
        }

        // Create conversation memory store
        if (!db.objectStoreNames.contains("conversationMemory")) {
          db.createObjectStore("conversationMemory", { keyPath: "id" })
        }

        // Create user interests store
        if (!db.objectStoreNames.contains("userInterests")) {
          const interestsStore = db.createObjectStore("userInterests", { keyPath: "topic" })
          interestsStore.createIndex("count", "count")
        }
      },
    })

    // Check if default user exists, create if not
    const tx = db.transaction("userProfiles", "readwrite")
    const store = tx.objectStore("userProfiles")
    const defaultUser = await store.get("default")

    if (!defaultUser) {
      await store.add({
        id: "default",
        name: "Vault Dweller",
        preferences: {
          technicalLevel: "intermediate",
          theme: "default",
          keyboardShortcuts: true,
          searchHighlighting: true,
        },
        stats: {
          questionsAsked: 0,
          lastActive: Date.now(),
          topicsExplored: [],
        },
      })
    }

    // Create default conversation memory if it doesn't exist
    const convTx = db.transaction("conversationMemory", "readwrite")
    const convStore = convTx.objectStore("conversationMemory")
    const defaultConversation = await convStore.get("default")

    if (!defaultConversation) {
      await convStore.add({
        id: "default",
        userId: "default",
        messages: [],
      })
    }

    await tx.done
    await convTx.done
  } catch (error) {
    console.error("Failed to initialize user memory:", error)
  }
}

// Get current user profile
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const user = await db.get("userProfiles", "default")

    // Update last active timestamp
    const tx = db.transaction("userProfiles", "readwrite")
    const store = tx.objectStore("userProfiles")
    await store.put({
      ...user,
      stats: {
        ...user.stats,
        lastActive: Date.now(),
      },
    })

    await tx.done
    return user
  } catch (error) {
    console.error("Failed to get current user:", error)
    // Return default profile if error
    return {
      id: "default",
      name: "Vault Dweller",
      preferences: {
        technicalLevel: "intermediate",
        theme: "default",
        keyboardShortcuts: true,
        searchHighlighting: true,
      },
      stats: {
        questionsAsked: 0,
        lastActive: Date.now(),
        topicsExplored: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }
}

// Update user preference
export const updateUserPreference = async (key: string, value: any): Promise<void> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const user = await db.get("userProfiles", "default")

    const tx = db.transaction("userProfiles", "readwrite")
    const store = tx.objectStore("userProfiles")

    if (key.includes(".")) {
      // Handle nested properties like 'preferences.theme'
      const [parent, child] = key.split(".")
      await store.put({
        ...user,
        [parent]: {
          ...user[parent],
          [child]: value,
        },
      })
    } else {
      // Handle top-level properties or special cases
      if (key === "interests") {
        // Special case for interests array
        await store.put({
          ...user,
          stats: {
            ...user.stats,
            topicsExplored: value,
          },
        })
      } else {
        await store.put({
          ...user,
          [key]: value,
        })
      }
    }

    await tx.done
  } catch (error) {
    console.error(`Failed to update user preference ${key}:`, error)
  }
}

// Add message to conversation memory
export const addMessageToConversation = async (
  role: "user" | "assistant",
  content: string,
  topics: string[],
): Promise<void> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const conversation = await db.get("conversationMemory", "default")

    // Add message to conversation
    const tx = db.transaction("conversationMemory", "readwrite")
    const store = tx.objectStore("conversationMemory")

    const updatedMessages = [
      ...conversation.messages,
      {
        role,
        content,
        timestamp: Date.now(),
        topics,
      },
    ]

    // Keep only the last 50 messages to prevent excessive storage
    const trimmedMessages = updatedMessages.slice(-50)

    await store.put({
      ...conversation,
      messages: trimmedMessages,
    })

    // If this is a user message, update question count and topics
    if (role === "user") {
      const userTx = db.transaction("userProfiles", "readwrite")
      const userStore = userTx.objectStore("userProfiles")
      const user = await userStore.get("default")

      // Update topics explored
      const existingTopics = new Set(user.stats.topicsExplored)
      topics.forEach((topic) => existingTopics.add(topic))

      await userStore.put({
        ...user,
        stats: {
          ...user.stats,
          questionsAsked: user.stats.questionsAsked + 1,
          topicsExplored: Array.from(existingTopics),
        },
      })

      await userTx.done

      // Update interest counts
      await updateInterestCounts(topics)
    }

    await tx.done
  } catch (error) {
    console.error("Failed to add message to conversation:", error)
  }
}

// Update interest counts
const updateInterestCounts = async (topics: string[]): Promise<void> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const tx = db.transaction("userInterests", "readwrite")
    const store = tx.objectStore("userInterests")

    for (const topic of topics) {
      // Skip empty topics
      if (!topic.trim()) continue

      const existingTopic = await store.get(topic)

      if (existingTopic) {
        await store.put({
          ...existingTopic,
          count: existingTopic.count + 1,
          lastUpdated: Date.now(),
        })
      } else {
        await store.add({
          topic,
          count: 1,
          firstSeen: Date.now(),
          lastUpdated: Date.now(),
        })
      }
    }

    await tx.done
  } catch (error) {
    console.error("Failed to update interest counts:", error)
  }
}

// Get user interests (sorted by frequency)
export const getUserInterests = async (): Promise<string[]> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const tx = db.transaction("userInterests", "readonly")
    const store = tx.objectStore("userInterests")
    const countIndex = store.index("count")

    // Get all interests sorted by count (descending)
    const interests = await countIndex.getAll()
    interests.sort((a, b) => b.count - a.count)

    await tx.done
    return interests.slice(0, 5).map((interest) => interest.topic)
  } catch (error) {
    console.error("Failed to get user interests:", error)
    return []
  }
}

// Get conversation history
export const getConversationHistory = async (): Promise<Array<{ role: string; content: string }>> => {
  try {
    const db = await openDB("fallout-assistant-memory", 1)
    const conversation = await db.get("conversationMemory", "default")

    return conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  } catch (error) {
    console.error("Failed to get conversation history:", error)
    return []
  }
}

// Get user preferences
export const getUserPreferences = async (): Promise<any> => {
  try {
    const user = await getCurrentUser()
    return user.preferences
  } catch (error) {
    console.error("Failed to get user preferences:", error)
    return {
      technicalLevel: "intermediate",
      theme: "default",
      keyboardShortcuts: true,
      searchHighlighting: true,
    }
  }
}

// Analyze conversation topics
export const analyzeConversationTopics = (text: string): string[] => {
  try {
    // Extract topics using the advanced algorithm
    const topicResults = extractTopics(text)

    // Return only topics with confidence above threshold
    return topicResults.filter((t) => t.confidence > 0.4).map((t) => t.topic)
  } catch (error) {
    console.error("Failed to analyze conversation topics:", error)
    return []
  }
}

// Personalize response based on user profile
export const personalizeResponse = async (baseResponse: string, userQuery: string): Promise<string> => {
  try {
    // Get user profile and conversation history
    const user = await getCurrentUser()
    const conversationHistory = await getConversationHistory()

    // Use the advanced context-aware response enhancement
    const enhancedResponse = await enhanceResponseWithContext(baseResponse, userQuery, conversationHistory, {
      technicalLevel: user.preferences.technicalLevel,
      interests: user.stats.topicsExplored,
    })

    return enhancedResponse
  } catch (error) {
    console.error("Failed to personalize response:", error)
    return baseResponse
  }
}

// This is a placeholder function that will be properly implemented
// when we import the actual function from advanced-algorithms.ts
const enhanceResponseWithContext = async (
  baseResponse: string,
  userQuery: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userPreferences: { technicalLevel: string; interests: string[] },
): Promise<string> => {
  // This is a placeholder until we properly import the function
  return baseResponse
}

/**
 * Record a user question and update topic frequencies
 */
export const recordUserQuestion = async (question: string, topics: string[] = []): Promise<void> => {
  try {
    if (!isInitialized) await initializeUserMemory()
    if (!currentUserId) await getCurrentUser()

    const user = await db.get("userProfiles", currentUserId!)
    if (!user) return

    // Update topic frequencies
    const topicFrequency = { ...user.stats.topicFrequency }

    for (const topic of topics) {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1
    }

    // Update user stats
    const updatedUser = {
      ...user,
      stats: {
        ...user.stats,
        questionsAsked: user.stats.questionsAsked + 1,
        lastActive: Date.now(),
        topicFrequency,
      },
      updatedAt: Date.now(),
    }

    await db.put("userProfiles", updatedUser)
  } catch (error) {
    console.error("Failed to record user question:", error)
  }
}

/**
 * Start a new conversation or get the current one
 */
export const getCurrentConversation = async (): Promise<ConversationMemory> => {
  try {
    if (!isInitialized) await initializeUserMemory()
    if (!currentUserId) await getCurrentUser()

    // Get the most recent conversation for this user
    const conversations = await db.getAllFromIndex("conversations", "by-user", currentUserId!)

    // Sort by updatedAt (newest first)
    conversations.sort((a, b) => b.updatedAt - a.updatedAt)

    // If there's a recent conversation (less than 24 hours old), use it
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000

    if (conversations.length > 0 && now - conversations[0].updatedAt < oneDayMs) {
      return conversations[0]
    }

    // Otherwise create a new conversation
    const newConversation: ConversationMemory = {
      id: nanoid(),
      userId: currentUserId!,
      messages: [],
      topics: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.add("conversations", newConversation)

    // Update user stats
    const user = await db.get("userProfiles", currentUserId!)
    if (user) {
      await db.put("userProfiles", {
        ...user,
        stats: {
          ...user.stats,
          conversationCount: user.stats.conversationCount + 1,
          lastActive: now,
        },
        updatedAt: now,
      })
    }

    return newConversation
  } catch (error) {
    console.error("Failed to get/create conversation:", error)

    // Return a fallback conversation
    return {
      id: "fallback-conversation",
      userId: currentUserId || "fallback-user",
      messages: [],
      topics: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }
}

/**
 * Add a message to the current conversation
 */
export const addMessageToConversationOld = async (
  role: "user" | "assistant",
  content: string,
  topics: string[] = [],
): Promise<void> => {
  try {
    if (!isInitialized) await initializeUserMemory()

    const conversation = await getCurrentConversation()

    // Add the message
    const updatedMessages = [
      ...conversation.messages,
      {
        role,
        content,
        timestamp: Date.now(),
      },
    ]

    // Update topics
    const updatedTopics = Array.from(new Set([...conversation.topics, ...topics]))

    // Update the conversation
    await db.put("conversations", {
      ...conversation,
      messages: updatedMessages,
      topics: updatedTopics,
      updatedAt: Date.now(),
    })

    // If this is a user message, record the question
    if (role === "user") {
      await recordUserQuestion(content, topics)
    }
  } catch (error) {
    console.error("Failed to add message to conversation:", error)
  }
}

/**
 * Get user interests based on conversation history
 */
export const getUserInterestsOld = async (): Promise<string[]> => {
  try {
    if (!isInitialized) await initializeUserMemory()
    if (!currentUserId) await getCurrentUser()

    const user = await db.get("userProfiles", currentUserId!)
    if (!user) return []

    // Get top topics from frequency
    const topicFrequency = user.stats.topicFrequency
    const topics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic)

    // Add explicit interests if available
    if (user.preferences.modInterests && user.preferences.modInterests.length > 0) {
      return Array.from(new Set([...user.preferences.modInterests, ...topics]))
    }

    return topics
  } catch (error) {
    console.error("Failed to get user interests:", error)
    return []
  }
}

/**
 * Analyze conversation to extract topics
 */
export const analyzeConversationTopicsOld = (text: string): string[] => {
  const topics: string[] = []

  // Simple keyword-based topic extraction
  const keywordMap: Record<string, string> = {
    // Mod types
    weapon: "weapons",
    gun: "weapons",
    armor: "armor",
    settlement: "settlements",
    build: "settlements",
    graphic: "graphics",
    texture: "graphics",
    enb: "graphics",
    performance: "performance",
    fps: "performance",
    crash: "troubleshooting",
    error: "troubleshooting",
    conflict: "troubleshooting",
    npc: "npcs",
    companion: "companions",
    quest: "quests",
    story: "quests",
    install: "installation",
    vortex: "mod-managers",
    "mod manager": "mod-managers",
    "load order": "load-order",
  }

  const textLower = text.toLowerCase()

  // Check for each keyword
  for (const [keyword, topic] of Object.entries(keywordMap)) {
    if (textLower.includes(keyword)) {
      topics.push(topic)
    }
  }

  return Array.from(new Set(topics))
}

/**
 * Get personalized response based on user profile
 */
export const personalizeResponseOld = async (baseResponse: string, query: string): Promise<string> => {
  try {
    if (!isInitialized) await initializeUserMemory()
    if (!currentUserId) await getCurrentUser()

    const user = await db.get("userProfiles", currentUserId!)
    if (!user) return baseResponse

    let personalizedResponse = baseResponse

    // Add personalized greeting for returning users
    if (user.stats.questionsAsked > 5) {
      // Replace generic greeting with personalized one
      if (
        baseResponse.startsWith("Greetings") ||
        baseResponse.startsWith("Hello") ||
        baseResponse.startsWith("Hi there")
      ) {
        personalizedResponse = `Welcome back, comrade! I see you've been interested in ${getUserInterestText(user)}. ${baseResponse}`
      }
    }

    // Add technical level adjustments
    if (user.preferences.technicalLevel) {
      if (user.preferences.technicalLevel === "beginner" && isComplexResponse(baseResponse)) {
        personalizedResponse += "\n\nSince you're new to modding, let me explain this more simply: "
        personalizedResponse += simplifyResponse(baseResponse)
      } else if (user.preferences.technicalLevel === "advanced" && !isComplexResponse(baseResponse)) {
        personalizedResponse += "\n\nFor an experienced modder like yourself, here are some advanced details: "
        personalizedResponse += enhanceResponseForAdvanced(baseResponse, query)
      }
    }

    // Add references to preferred gameplay style if relevant
    if (user.preferences.preferredGameplay && isRelevantToGameplay(query, user.preferences.preferredGameplay)) {
      personalizedResponse += `\n\nSince you prefer ${user.preferences.preferredGameplay} gameplay, you might particularly enjoy this approach.`
    }

    return personalizedResponse
  } catch (error) {
    console.error("Failed to personalize response:", error)
    return baseResponse
  }
}

// Helper functions for personalization

function getUserInterestText(user: UserProfile): string {
  const topicFrequency = user.stats.topicFrequency
  const topTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([topic]) => topic)

  if (topTopics.length === 0) return "various modding topics"
  if (topTopics.length === 1) return topTopics[0]
  return `${topTopics[0]} and ${topTopics[1]}`
}

function isComplexResponse(response: string): boolean {
  // Check if response contains technical terms
  const technicalTerms = [
    "plugin",
    "esp",
    "esm",
    "esl",
    "xedit",
    "script extender",
    "papyrus",
    "nif",
    "dds",
    "lod",
    "navmesh",
    "ctd",
    "ck",
  ]

  const count = technicalTerms.filter((term) => response.toLowerCase().includes(term)).length

  return count >= 2 || response.length > 500
}

function simplifyResponse(response: string): string {
  return "In simple terms, this is about making your mods work together without problems. Make sure to install one mod at a time and test your game after each one."
}

function enhanceResponseForAdvanced(response: string, query: string): string {
  // Add technical details based on query topic
  if (query.toLowerCase().includes("weapon")) {
    return "You might want to check the weapon records in xEdit to ensure proper keyword distribution and attachment node setup. Consider FOMOD packaging with proper condition flags for compatibility."
  } else if (query.toLowerCase().includes("crash")) {
    return "For advanced troubleshooting, analyze your crash logs with Buffout 4, check for stack overflow issues, and examine script latency with the Papyrus logs. Memory allocation could also be an issue worth investigating."
  } else {
    return "For more technical details, you might want to examine the relevant records in xEdit and check for conflicts at the form level."
  }
}

function isRelevantToGameplay(query: string, gameplayStyle: string): boolean {
  const queryLower = query.toLowerCase()
  const styleLower = gameplayStyle.toLowerCase()

  if (styleLower.includes("survival") || styleLower.includes("hardcore")) {
    return (
      queryLower.includes("survival") ||
      queryLower.includes("difficult") ||
      queryLower.includes("hardcore") ||
      queryLower.includes("damage") ||
      queryLower.includes("needs")
    )
  }

  if (styleLower.includes("settlement") || styleLower.includes("building")) {
    return queryLower.includes("settlement") || queryLower.includes("build") || queryLower.includes("workshop")
  }

  if (styleLower.includes("combat") || styleLower.includes("action")) {
    return (
      queryLower.includes("weapon") ||
      queryLower.includes("combat") ||
      queryLower.includes("gun") ||
      queryLower.includes("damage")
    )
  }

  return false
}
