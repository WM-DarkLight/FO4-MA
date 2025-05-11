import { openDB } from "idb"
import type { Settings } from "./types"

// Default settings
const defaultSettings: Settings = {
  darkMode: true,
  relevanceThreshold: 0.5,
  maxResults: 3,
  debugMode: false,
  autoExpandModules: true,
  theme: "dark",
  keyboardShortcuts: true,
  showRecentSearches: true,
  searchHighlighting: true,
}

export const getSettings = async (): Promise<Settings> => {
  try {
    // Open the database with the correct version
    const db = await openDB("fallout-modding-assistant", 2, {
      upgrade(db, oldVersion, newVersion) {
        // Create settings store if it doesn't exist
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }
      },
    })

    const settings = await db.get("settings", "app-settings")
    return settings || defaultSettings
  } catch (error) {
    console.error("Error getting settings:", error)
    return defaultSettings
  }
}

export const updateSettings = async (settings: Settings): Promise<void> => {
  try {
    const db = await openDB("fallout-modding-assistant", 2, {
      upgrade(db, oldVersion, newVersion) {
        // Create settings store if it doesn't exist
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" })
        }
      },
    })

    await db.put("settings", {
      id: "app-settings",
      ...settings,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}
