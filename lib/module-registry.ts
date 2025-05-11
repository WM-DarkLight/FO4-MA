/**
 * Module Registry System
 *
 * This file implements a registry for knowledge modules that can be dynamically
 * loaded and used throughout the application. The registry maintains a collection
 * of modules and their entries, providing methods to access and manage them.
 */

import type { KnowledgeModule, KnowledgeEntry, ModuleDefinition, ModuleRegistry } from "./types"
import { nanoid } from "./utils"

// In-memory storage for modules and entries
const modules: Map<string, KnowledgeModule> = new Map()
const entriesByModule: Map<string, KnowledgeEntry[]> = new Map()
let allEntries: KnowledgeEntry[] = []

/**
 * The module registry provides methods to register, access, and manage knowledge modules.
 */
export const moduleRegistry: ModuleRegistry = {
  /**
   * Get all registered modules
   */
  getModules: async () => {
    return Array.from(modules.values())
  },

  /**
   * Get all entries for a specific module
   * @param moduleId The ID of the module
   */
  getEntries: async (moduleId: string) => {
    return entriesByModule.get(moduleId) || []
  },

  /**
   * Get all entries from all registered modules
   */
  getAllEntries: async () => {
    return allEntries
  },

  /**
   * Register a new module with the registry
   * @param moduleDefinition The module definition to register
   */
  registerModule: (moduleDefinition: ModuleDefinition) => {
    try {
      // Validate the module definition
      if (!moduleDefinition.id || !moduleDefinition.name) {
        console.error("Invalid module definition: missing required fields")
        return
      }

      // Create the module metadata
      const module: KnowledgeModule = {
        id: moduleDefinition.id,
        name: moduleDefinition.name,
        description: moduleDefinition.description,
        version: moduleDefinition.version,
        author: moduleDefinition.author,
      }

      // Process entries to ensure they have IDs and the correct moduleId
      const entries = moduleDefinition.entries.map((entry) => ({
        ...entry,
        id: entry.id || nanoid(),
        moduleId: moduleDefinition.id,
        createdAt: entry.createdAt || Date.now(),
        updatedAt: entry.updatedAt || Date.now(),
      }))

      // Store the module and its entries
      modules.set(module.id, module)
      entriesByModule.set(module.id, entries)

      // Update the all entries collection
      allEntries = [...allEntries.filter((entry) => entry.moduleId !== module.id), ...entries]

      console.log(`Registered module: ${module.name} (${module.id}) with ${entries.length} entries`)
    } catch (error) {
      console.error(`Failed to register module ${moduleDefinition.id}:`, error)
    }
  },

  /**
   * Check if a module is registered
   * @param moduleId The ID of the module to check
   */
  isModuleRegistered: (moduleId: string) => {
    return modules.has(moduleId)
  },

  /**
   * Get metadata for a specific module
   * @param moduleId The ID of the module
   */
  getModuleMetadata: (moduleId: string) => {
    return modules.get(moduleId)
  },
}

/**
 * Initialize the module registry
 * This function is called during application startup
 */
export async function initializeModuleRegistry() {
  try {
    console.log("Module registry initialized")
    return true
  } catch (error) {
    console.error("Failed to initialize module registry:", error)
    return false
  }
}
