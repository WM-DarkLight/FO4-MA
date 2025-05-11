/**
 * Weapon Modifications Knowledge Module
 *
 * This module contains information about weapon modding in Fallout 4,
 * including basics, popular mod packs, and compatibility information.
 */

import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "weapon-mods-module"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Weapon Modifications",
  description: "Information about weapon modding in Fallout 4",
  version: "1.0.0",
  author: "Comrade Yelskin",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Weapon Modding Basics",
      content:
        "Weapon modding in Fallout 4 allows you to customize your weapons at a weapons workbench. " +
        "You can modify receivers, barrels, stocks, sights, and more. Each modification affects the weapon's stats " +
        "such as damage, range, accuracy, and weight. You need specific perks like Gun Nut or Science to craft " +
        "advanced modifications.",
      keywords: ["weapon", "modding", "basics", "workbench", "customize", "gun nut", "science"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Popular Weapon Mod Packs",
      content:
        "Some of the most popular weapon mod packs for Fallout 4 include: " +
        "1. Modern Weapons - Adds real-world firearms to the game. " +
        "2. See-Through Scopes - Replaces the default scope view with see-through scopes. " +
        "3. Weaponsmith Extended - A comprehensive weapon overhaul with new weapons and modifications. " +
        "4. Armorsmith Extended - Adds new armor and clothing options with modifications. " +
        "5. Tactical Animations - Improves weapon handling animations for a more realistic feel.",
      keywords: [
        "weapon",
        "mods",
        "packs",
        "popular",
        "recommended",
        "modern weapons",
        "see-through scopes",
        "weaponsmith",
      ],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Weapon Mod Compatibility",
      content:
        "When using multiple weapon mods, compatibility issues can arise. Here are some tips: " +
        "1. Check mod descriptions for known conflicts. " +
        "2. Use compatibility patches when available. " +
        "3. Load order matters - weapon mods that modify the same weapons should be carefully ordered. " +
        "4. Use FO4Edit to create custom patches for conflicting mods. " +
        "5. Some weapon mods require F4SE (Fallout 4 Script Extender) to function properly.",
      keywords: ["compatibility", "conflicts", "weapon", "mods", "patches", "load order", "fo4edit", "f4se"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Legendary Weapon Effects",
      content:
        "Legendary weapons in Fallout 4 have special effects that provide unique bonuses. Some popular mods allow you to craft these effects: " +
        "1. Crafting Legendary Modifications - Lets you craft and remove legendary effects. " +
        "2. Legendary Modification - Allows attaching legendary effects to any weapon. " +
        "3. UCO Unified Clothing Overhaul - Includes legendary crafting for armor and weapons. " +
        "Remember that adding legendary effects can make the game significantly easier.",
      keywords: ["legendary", "effects", "crafting", "modifications", "weapon", "UCO", "overhaul"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Weapon Retexture Mods",
      content:
        "Weapon retexture mods improve the visual appearance of weapons without changing gameplay: " +
        "1. High-Resolution Texture Packs - Enhance the detail of weapon textures. " +
        "2. Realistic Weapons - Makes weapons look more like their real-world counterparts. " +
        "3. Weathered Weapons - Adds wear and tear to weapons for a more lived-in look. " +
        "4. HD Weapons 2K - Provides high-definition textures for all vanilla weapons. " +
        "These mods typically have minimal impact on performance but can significantly improve visuals.",
      keywords: ["retexture", "texture", "visual", "HD", "high-resolution", "weathered", "realistic"],
    },
  ],
}

export default module
