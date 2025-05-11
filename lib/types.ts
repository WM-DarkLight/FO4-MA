/**
 * Core type definitions for the Fallout 4 Modding Assistant
 * These types define the structure of the knowledge base and module system
 */

export interface KnowledgeModule {
  id: string
  name: string
  description: string
  version?: string
  author?: string
  categoryId?: string
  createdAt?: number
  updatedAt?: number
}

export interface KnowledgeEntry {
  id: string
  moduleId: string
  title: string
  content: string
  keywords: string[]
  createdAt?: number
  updatedAt?: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

export interface Settings {
  darkMode: boolean
  relevanceThreshold: number
  maxResults: number
  debugMode: boolean
  autoExpandModules: boolean
  enabledModules?: string[] // IDs of enabled modules
  chatHistory?: boolean
  searchHighlighting?: boolean
  theme?: "dark" | "light" | "system"
  keyboardShortcuts?: boolean
  showRecentSearches?: boolean
}

/**
 * Module system interfaces
 */
export interface ModuleDefinition {
  id: string
  name: string
  description: string
  version: string
  author?: string
  categoryId?: string
  entries: KnowledgeEntry[]
  dependencies?: string[] // IDs of modules this module depends on
}

export interface ModuleRegistry {
  getModules: () => Promise<KnowledgeModule[]>
  getEntries: (moduleId: string) => Promise<KnowledgeEntry[]>
  getAllEntries: () => Promise<KnowledgeEntry[]>
  registerModule: (module: ModuleDefinition) => void
  isModuleRegistered: (moduleId: string) => boolean
  getModuleMetadata: (moduleId: string) => KnowledgeModule | undefined
}

/**
 * Search result interface with relevance score
 */
export interface SearchResult {
  entry: KnowledgeEntry
  score: number
  matches?: {
    field: string
    positions: [number, number][] // [start, end] positions of matches
  }[]
}

/**
 * Module category interface
 */
export interface ModuleCategory {
  id: string
  name: string
  description: string
  color: string
}

/**
 * Keyboard shortcut interface
 */
export interface KeyboardShortcut {
  id: string
  name: string
  keys: string[]
  description: string
  action: () => void
}
