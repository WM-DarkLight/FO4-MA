/**
 * Armor Modifications Knowledge Module
 *
 * This module contains information about armor modding in Fallout 4,
 * including basics, power armor modifications, and popular mod packs.
 */

import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "armor-mods-module"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Armor Modifications",
  description: "Information about armor modding in Fallout 4",
  version: "1.0.0",
  author: "Comrade Yelskin",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Armor Modding Basics",
      content:
        "Armor modding in Fallout 4 allows you to customize your armor at an armor workbench. " +
        "You can modify armor pieces to add various benefits like increased damage resistance, " +
        "radiation resistance, or carrying capacity. Most modifications require the Armorer perk, " +
        "with higher ranks unlocking more advanced mods.",
      keywords: ["armor", "modding", "basics", "workbench", "customize", "armorer", "perk"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Power Armor Modifications",
      content:
        "Power Armor can be extensively modified at a Power Armor Station. Each piece (helmet, torso, arms, legs) " +
        "can be customized with different mods: " +
        "1. Helmet: VATS enhancements, targeting HUD, bright headlamp, etc. " +
        "2. Torso: Jetpack, stealth boy, core assembly, etc. " +
        "3. Arms: Optimized bracers, Tesla bracers, hydraulic bracers, etc. " +
        "4. Legs: Calibrated shocks, explosive vents, optimized servos, etc. " +
        "Most advanced mods require the Science! perk in addition to Armorer.",
      keywords: ["power", "armor", "modifications", "customize", "station", "helmet", "torso", "arms", "legs"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Popular Armor Mod Packs",
      content:
        "Some of the most popular armor mod packs for Fallout 4 include: " +
        "1. Armorsmith Extended - Adds layering to clothing and armor with many new options. " +
        "2. AWKCR (Armor and Weapon Keywords Community Resource) - A framework for armor mods. " +
        "3. Wearable Backpacks and Pouches - Adds functional backpacks with carrying capacity. " +
        "4. Unique Player - Allows for extensive character customization. " +
        "5. West Tek Tactical Optics - Adds night vision and thermal vision goggles.",
      keywords: ["armor", "mods", "packs", "popular", "recommended", "armorsmith", "AWKCR", "backpacks"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Ballistic Weave",
      content:
        "Ballistic Weave is a special armor modification that allows you to upgrade certain clothing items: " +
        "1. To unlock Ballistic Weave, you must complete Railroad quests until P.A.M. gives you the 'Jackpot' missions. " +
        "2. Once unlocked, you can apply it at an armor workbench to certain clothing and hats. " +
        "3. Ballistic Weave Mk5 provides +110 Damage Resistance and Energy Resistance. " +
        "4. The Armorer perk is required for higher levels of Ballistic Weave. " +
        "5. Many mods expand the list of items that can receive Ballistic Weave, such as 'Armorsmith Extended'.",
      keywords: ["ballistic", "weave", "railroad", "clothing", "upgrade", "PAM", "jackpot", "resistance"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Legendary Armor Effects",
      content:
        "Legendary armor pieces provide special effects that can significantly enhance your character: " +
        "1. Chameleon - Grants invisibility when standing still and crouching. " +
        "2. Powered - Increases Action Point refresh speed. " +
        "3. VATS Enhanced - Reduces Action Point cost in VATS. " +
        "4. Unyielding - Grants up to +3 to all stats (except Endurance) when at low health. " +
        "5. Sentinel's - Reduces damage by 15% while standing still. " +
        "Mods like 'Legendary Crafting Framework' allow you to craft these effects at a workbench.",
      keywords: ["legendary", "effects", "armor", "chameleon", "powered", "VATS", "unyielding", "sentinel"],
    },
  ],
}

export default module
