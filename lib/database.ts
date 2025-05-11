/**
 * Database Management System
 *
 * This file implements the IndexedDB database operations for the Fallout 4 Modding Assistant.
 * It provides functions to initialize the database, manage knowledge modules and entries,
 * and perform search operations.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { KnowledgeEntry, KnowledgeModule, ModuleCategory } from "./types"
import { defaultKnowledgeBase } from "./default-knowledge"
import { nanoid } from "./utils"
import { moduleRegistry } from "./module-registry"

// Database schema definition
interface FalloutModdingDB extends DBSchema {
  modules: {
    key: string
    value: KnowledgeModule
    indexes: { "by-name": string; "by-category": string }
  }
  entries: {
    key: string
    value: KnowledgeEntry
    indexes: {
      "by-module": string
      "by-keywords": string[]
      "by-title": string
      "by-updated": number
    }
  }
  categories: {
    key: string
    value: ModuleCategory
    indexes: { "by-name": string }
  }
  settings: {
    key: string
    value: any
  }
  recentSearches: {
    key: string
    value: { query: string; timestamp: number }
    indexes: { "by-timestamp": number }
  }
}

// Database instance
let db: IDBPDatabase<FalloutModdingDB>
let isInitialized = false

/**
 * Initialize the database
 * This creates the database if it doesn't exist and sets up the object stores and indexes
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (isInitialized) return

    db = await openDB<FalloutModdingDB>("fallout-modding-assistant", 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create modules store if it doesn't exist
        if (!db.objectStoreNames.contains("modules")) {
          const modulesStore = db.createObjectStore("modules", { keyPath: "id" })
          modulesStore.createIndex("by-name", "name", { unique: false })
          modulesStore.createIndex("by-category", "categoryId", { unique: false })
        }

        // Create entries store if it doesn't exist
        if (!db.objectStoreNames.contains("entries")) {
          const entriesStore = db.createObjectStore("entries", { keyPath: "id" })
          entriesStore.createIndex("by-module", "moduleId", { unique: false })
          entriesStore.createIndex("by-keywords", "keywords", { unique: false, multiEntry: true })
          entriesStore.createIndex("by-title", "title", { unique: false })
          entriesStore.createIndex("by-updated", "updatedAt", { unique: false })
        }

        // Create settings store if it doesn't exist
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }

        // Create categories store if it doesn't exist (new in v2)
        if (oldVersion < 2 && !db.objectStoreNames.contains("categories")) {
          const categoriesStore = db.createObjectStore("categories", { keyPath: "id" })
          categoriesStore.createIndex("by-name", "name", { unique: false })

          // Add default categories
          const defaultCategories = [
            { id: "general", name: "General", description: "General modding information", color: "#1aff80" },
            { id: "weapons", name: "Weapons", description: "Weapon mods and customization", color: "#ff5555" },
            { id: "armor", name: "Armor", description: "Armor mods and customization", color: "#5555ff" },
            {
              id: "settlements",
              name: "Settlements",
              description: "Settlement building and management",
              color: "#ffaa00",
            },
            { id: "graphics", name: "Graphics", description: "Visual enhancements and performance", color: "#aa55ff" },
            { id: "gameplay", name: "Gameplay", description: "Gameplay mechanics and overhauls", color: "#55aaff" },
            { id: "utilities", name: "Utilities", description: "Modding tools and utilities", color: "#ffff55" },
          ]

          const categoriesStore2 = transaction.objectStore("categories")
          for (const category of defaultCategories) {
            categoriesStore2.add(category)
          }

          // Update existing modules with categories
          const modulesStore = transaction.objectStore("modules")
          modulesStore.openCursor().then(function addCategoriesToModules(cursor) {
            if (!cursor) return

            const module = cursor.value

            // Assign a category based on module name or content
            let categoryId = "general"
            const moduleName = module.name.toLowerCase()

            if (moduleName.includes("weapon")) categoryId = "weapons"
            else if (moduleName.includes("armor")) categoryId = "armor"
            else if (moduleName.includes("settlement")) categoryId = "settlements"
            else if (moduleName.includes("graphic") || moduleName.includes("visual")) categoryId = "graphics"
            else if (moduleName.includes("gameplay")) categoryId = "gameplay"
            else if (moduleName.includes("tool") || moduleName.includes("utility")) categoryId = "utilities"

            // Update the module with the category
            const updatedModule = { ...module, categoryId }
            cursor.update(updatedModule)

            return cursor.continue().then(addCategoriesToModules)
          })
        }

        // Create recent searches store if it doesn't exist (new in v2)
        if (oldVersion < 2 && !db.objectStoreNames.contains("recentSearches")) {
          const recentSearchesStore = db.createObjectStore("recentSearches", { keyPath: "query" })
          recentSearchesStore.createIndex("by-timestamp", "timestamp", { unique: false })
        }
      },
    })

    // Check if we need to populate with default data
    const moduleCount = await db.count("modules")

    if (moduleCount === 0) {
      await populateDefaultData()
    }

    isInitialized = true
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    throw new Error("Database initialization failed")
  }
}

/**
 * Populate the database with default knowledge modules and entries
 */
const populateDefaultData = async (): Promise<void> => {
  try {
    const tx = db.transaction(["modules", "entries", "categories"], "readwrite")

    // Add default categories if they don't exist
    const categoryCount = await tx.objectStore("categories").count()
    if (categoryCount === 0) {
      const defaultCategories = [
        { id: "general", name: "General", description: "General modding information", color: "#1aff80" },
        { id: "weapons", name: "Weapons", description: "Weapon mods and customization", color: "#ff5555" },
        { id: "armor", name: "Armor", description: "Armor mods and customization", color: "#5555ff" },
        { id: "settlements", name: "Settlements", description: "Settlement building and management", color: "#ffaa00" },
        { id: "graphics", name: "Graphics", description: "Visual enhancements and performance", color: "#aa55ff" },
        { id: "gameplay", name: "Gameplay", description: "Gameplay mechanics and overhauls", color: "#55aaff" },
        { id: "utilities", name: "Utilities", description: "Modding tools and utilities", color: "#ffff55" },
      ]

      for (const category of defaultCategories) {
        await tx.objectStore("categories").add(category)
      }
    }

    // Add default modules with categories
    for (const module of defaultKnowledgeBase.modules) {
      // Assign a category based on module name
      let categoryId = "general"
      const moduleName = module.name.toLowerCase()

      if (moduleName.includes("weapon")) categoryId = "weapons"
      else if (moduleName.includes("armor")) categoryId = "armor"
      else if (moduleName.includes("settlement")) categoryId = "settlements"
      else if (moduleName.includes("graphic") || moduleName.includes("visual")) categoryId = "graphics"
      else if (moduleName.includes("gameplay")) categoryId = "gameplay"
      else if (moduleName.includes("tool") || moduleName.includes("utility")) categoryId = "utilities"

      await tx.objectStore("modules").add({
        ...module,
        categoryId,
      })
    }

    // Add default entries with timestamps
    const now = Date.now()
    for (const entry of defaultKnowledgeBase.entries) {
      await tx.objectStore("entries").add({
        ...entry,
        createdAt: now,
        updatedAt: now,
      })
    }

    await tx.done
    console.log("Default data populated successfully")
  } catch (error) {
    console.error("Failed to populate default data:", error)
    throw new Error("Failed to populate default data")
  }
}

/**
 * Get all knowledge modules from both the database and module registry
 */
export const getAllModules = async (): Promise<KnowledgeModule[]> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Get modules from both the database and the registry
    const dbModules = await db.getAll("modules")
    const registryModules = await moduleRegistry.getModules()

    // Combine and deduplicate modules
    const allModules = [...dbModules]

    for (const module of registryModules) {
      if (!allModules.some((m) => m.id === module.id)) {
        allModules.push(module)
      }
    }

    return allModules
  } catch (error) {
    console.error("Failed to get all modules:", error)
    return []
  }
}

/**
 * Get all module categories
 */
export const getAllCategories = async (): Promise<ModuleCategory[]> => {
  try {
    if (!isInitialized) await initializeDatabase()
    return db.getAll("categories")
  } catch (error) {
    console.error("Failed to get categories:", error)
    return []
  }
}

/**
 * Get modules by category
 * @param categoryId The ID of the category
 */
export const getModulesByCategory = async (categoryId: string): Promise<KnowledgeModule[]> => {
  try {
    if (!isInitialized) await initializeDatabase()
    return db.getAllFromIndex("modules", "by-category", categoryId)
  } catch (error) {
    console.error(`Failed to get modules for category ${categoryId}:`, error)
    return []
  }
}

/**
 * Add a new category
 * @param category The category to add (without an ID)
 * @returns The ID of the new category
 */
export const addCategory = async (category: Omit<ModuleCategory, "id">): Promise<string> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const id = nanoid()
    await db.add("categories", {
      ...category,
      id,
    })

    return id
  } catch (error) {
    console.error("Failed to add category:", error)
    throw new Error("Failed to add category")
  }
}

/**
 * Update a module's category
 * @param moduleId The ID of the module
 * @param categoryId The ID of the category
 */
export const updateModuleCategory = async (moduleId: string, categoryId: string): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const module = await db.get("modules", moduleId)
    if (!module) throw new Error(`Module ${moduleId} not found`)

    await db.put("modules", {
      ...module,
      categoryId,
    })
  } catch (error) {
    console.error(`Failed to update category for module ${moduleId}:`, error)
    throw new Error("Failed to update module category")
  }
}

/**
 * Get all entries for a specific module
 * @param moduleId The ID of the module
 */
export const getEntriesByModule = async (moduleId: string): Promise<KnowledgeEntry[]> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Try to get entries from the registry first
    const registryEntries = await moduleRegistry.getEntries(moduleId)

    // If no entries found in registry, try the database
    if (registryEntries.length === 0) {
      return db.getAllFromIndex("entries", "by-module", moduleId)
    }

    return registryEntries
  } catch (error) {
    console.error(`Failed to get entries for module ${moduleId}:`, error)
    return []
  }
}

/**
 * Get all knowledge entries from both the database and module registry
 */
export const getAllEntries = async (): Promise<KnowledgeEntry[]> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Get entries from both the database and the registry
    const dbEntries = await db.getAll("entries")
    const registryEntries = await moduleRegistry.getAllEntries()

    // Combine and deduplicate entries
    const allEntries = [...dbEntries]

    for (const entry of registryEntries) {
      if (!allEntries.some((e) => e.id === entry.id)) {
        allEntries.push(entry)
      }
    }

    return allEntries
  } catch (error) {
    console.error("Failed to get all entries:", error)
    return []
  }
}

/**
 * Get a single knowledge entry by ID
 * @param id The ID of the entry
 */
export const getKnowledgeEntry = async (id: string): Promise<KnowledgeEntry | undefined> => {
  try {
    if (!isInitialized) await initializeDatabase()
    return db.get("entries", id)
  } catch (error) {
    console.error(`Failed to get entry ${id}:`, error)
    return undefined
  }
}

/**
 * Add a new knowledge entry to the database
 * @param entry The entry to add (without an ID)
 * @returns The ID of the new entry
 */
export const addKnowledgeEntry = async (entry: Omit<KnowledgeEntry, "id">): Promise<string> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const now = Date.now()
    const id = nanoid()

    await db.add("entries", {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    })

    return id
  } catch (error) {
    console.error("Failed to add knowledge entry:", error)
    throw new Error("Failed to add knowledge entry")
  }
}

/**
 * Update an existing knowledge entry
 * @param entry The entry to update
 */
export const updateKnowledgeEntry = async (entry: KnowledgeEntry): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Update the timestamp
    const updatedEntry = {
      ...entry,
      updatedAt: Date.now(),
    }

    await db.put("entries", updatedEntry)
  } catch (error) {
    console.error(`Failed to update entry ${entry.id}:`, error)
    throw new Error("Failed to update knowledge entry")
  }
}

/**
 * Delete a knowledge entry from the database
 * @param id The ID of the entry to delete
 */
export const deleteKnowledgeEntry = async (id: string): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()
    await db.delete("entries", id)
  } catch (error) {
    console.error(`Failed to delete entry ${id}:`, error)
    throw new Error("Failed to delete knowledge entry")
  }
}

/**
 * Add a recent search query
 * @param query The search query
 */
export const addRecentSearch = async (query: string): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Add or update the search query
    await db.put("recentSearches", {
      query,
      timestamp: Date.now(),
    })

    // Limit to 10 most recent searches
    const allSearches = await db.getAllFromIndex("recentSearches", "by-timestamp")
    if (allSearches.length > 10) {
      // Sort by timestamp (newest first)
      allSearches.sort((a, b) => b.timestamp - a.timestamp)

      // Delete older searches
      for (let i = 10; i < allSearches.length; i++) {
        await db.delete("recentSearches", allSearches[i].query)
      }
    }
  } catch (error) {
    console.error("Failed to add recent search:", error)
  }
}

/**
 * Get recent search queries
 * @param limit Maximum number of queries to return
 */
export const getRecentSearches = async (limit = 5): Promise<string[]> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const searches = await db.getAllFromIndex("recentSearches", "by-timestamp")

    // Sort by timestamp (newest first) and take the most recent ones
    return searches
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map((s) => s.query)
  } catch (error) {
    console.error("Failed to get recent searches:", error)
    return []
  }
}

/**
 * Search the knowledge base for entries matching a query
 * @param query The search query
 * @param limit Maximum number of results to return
 * @returns Matching entries sorted by relevance
 */
export const searchKnowledgeBase = async (query: string, limit = 3): Promise<KnowledgeEntry[]> => {
  try {
    if (!isInitialized) await initializeDatabase()
    if (!query.trim()) return []

    // Get all entries from both database and registry
    const allEntries = await getAllEntries()

    // Simple keyword matching for demonstration
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 1)

    // Score each entry based on keyword matches
    const scoredEntries = allEntries.map((entry) => {
      const titleText = entry.title.toLowerCase()
      const contentText = entry.content.toLowerCase()
      let score = 0

      // Check for exact matches in title (highest priority)
      if (titleText.includes(query.toLowerCase())) {
        score += 10
      }

      // Check for keyword matches in title
      for (const keyword of keywords) {
        if (titleText.includes(keyword)) {
          score += 3
        }
      }

      // Check for exact matches in content
      if (contentText.includes(query.toLowerCase())) {
        score += 5
      }

      // Check for keyword matches in content
      for (const keyword of keywords) {
        if (contentText.includes(keyword)) {
          score += 1
        }
      }

      // Check for keyword matches in keywords array
      for (const keyword of keywords) {
        if (entry.keywords.some((k) => k.toLowerCase().includes(keyword))) {
          score += 2
        }
      }

      return { entry, score }
    })

    // Add the search to recent searches
    if (query.trim().length > 2) {
      await addRecentSearch(query)
    }

    // Sort by score and return top results
    return scoredEntries
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.entry)
  } catch (error) {
    console.error("Search failed:", error)
    return []
  }
}

/**
 * Export the knowledge base to a JSON object
 * @returns An object containing all modules and entries
 */
export const exportDatabase = async (): Promise<any> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const modules = await getAllModules()
    const entries = await getAllEntries()
    const categories = await getAllCategories()

    return {
      modules,
      entries,
      categories,
      version: 2,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to export database:", error)
    throw new Error("Failed to export knowledge base")
  }
}

/**
 * Export a single module and its entries
 * @param moduleId The ID of the module to export
 * @returns An object containing the module and its entries
 */
export const exportModule = async (moduleId: string): Promise<any> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const module = await db.get("modules", moduleId)
    if (!module) throw new Error(`Module ${moduleId} not found`)

    const entries = await getEntriesByModule(moduleId)

    return {
      module,
      entries,
      version: 2,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Failed to export module ${moduleId}:`, error)
    throw new Error("Failed to export module")
  }
}

/**
 * Import knowledge base data
 * @param data The data to import
 */
export const importDatabase = async (data: any): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const tx = db.transaction(["modules", "entries", "categories"], "readwrite")

    // Import categories
    if (Array.isArray(data.categories)) {
      for (const category of data.categories) {
        // Check if category already exists
        const existingCategory = await tx.objectStore("categories").get(category.id)
        if (!existingCategory) {
          await tx.objectStore("categories").add(category)
        }
      }
    }

    // Import modules
    if (Array.isArray(data.modules)) {
      for (const module of data.modules) {
        // Check if module already exists
        const existingModule = await tx.objectStore("modules").get(module.id)
        if (!existingModule) {
          await tx.objectStore("modules").add(module)
        }
      }
    }

    // Import entries
    if (Array.isArray(data.entries)) {
      const now = Date.now()

      for (const entry of data.entries) {
        // Check if entry already exists
        const existingEntry = await tx.objectStore("entries").get(entry.id)
        if (!existingEntry) {
          // Add timestamps if they don't exist
          const entryWithTimestamps = {
            ...entry,
            createdAt: entry.createdAt || now,
            updatedAt: entry.updatedAt || now,
          }
          await tx.objectStore("entries").add(entryWithTimestamps)
        }
      }
    }

    await tx.done
  } catch (error) {
    console.error("Failed to import database:", error)
    throw new Error("Failed to import knowledge base")
  }
}

/**
 * Import a single module and its entries
 * @param data The module data to import
 */
export const importModule = async (data: any): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    if (!data.module || !Array.isArray(data.entries)) {
      throw new Error("Invalid module data format")
    }

    const tx = db.transaction(["modules", "entries"], "readwrite")

    // Check if module already exists
    const existingModule = await tx.objectStore("modules").get(data.module.id)
    if (!existingModule) {
      await tx.objectStore("modules").add(data.module)
    } else {
      // Update existing module
      await tx.objectStore("modules").put({
        ...existingModule,
        ...data.module,
        updatedAt: Date.now(),
      })
    }

    // Import entries
    const now = Date.now()
    for (const entry of data.entries) {
      // Check if entry already exists
      const existingEntry = await tx.objectStore("entries").get(entry.id)
      if (!existingEntry) {
        // Add timestamps if they don't exist
        const entryWithTimestamps = {
          ...entry,
          createdAt: entry.createdAt || now,
          updatedAt: entry.updatedAt || now,
        }
        await tx.objectStore("entries").add(entryWithTimestamps)
      } else {
        // Update existing entry
        await tx.objectStore("entries").put({
          ...existingEntry,
          ...entry,
          updatedAt: now,
        })
      }
    }

    await tx.done
  } catch (error) {
    console.error("Failed to import module:", error)
    throw new Error("Failed to import module")
  }
}

/**
 * Add a new knowledge module to the database
 * @param module The module to add (without an ID)
 * @returns The ID of the new module
 */
export const addKnowledgeModule = async (module: Omit<KnowledgeModule, "id">): Promise<string> => {
  try {
    if (!isInitialized) await initializeDatabase()

    const id = nanoid()
    await db.add("modules", {
      ...module,
      id,
      categoryId: module.categoryId || "general", // Default to general category
    })

    return id
  } catch (error) {
    console.error("Failed to add knowledge module:", error)
    throw new Error("Failed to add knowledge module")
  }
}

/**
 * Delete a knowledge module and all its entries
 * @param moduleId The ID of the module to delete
 */
export const deleteKnowledgeModule = async (moduleId: string): Promise<void> => {
  try {
    if (!isInitialized) await initializeDatabase()

    // Start a transaction to delete the module and all its entries
    const tx = db.transaction(["modules", "entries"], "readwrite")

    // Delete the module
    await tx.objectStore("modules").delete(moduleId)

    // Get all entries for this module
    const entriesIndex = tx.objectStore("entries").index("by-module")
    let cursor = await entriesIndex.openCursor(moduleId)

    // Delete each entry
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }

    await tx.done
  } catch (error) {
    console.error(`Failed to delete module ${moduleId}:`, error)
    throw new Error("Failed to delete knowledge module")
  }
}
