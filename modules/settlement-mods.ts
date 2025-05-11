/**
 * Settlement Building Knowledge Module
 *
 * This module contains information about settlement building and mods in Fallout 4,
 * including basics, essential mods, and load order recommendations.
 */

import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "settlement-mods-module"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Settlement Building",
  description: "Information about settlement building and mods in Fallout 4",
  version: "1.0.0",
  author: "Comrade Yelskin",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Settlement Building Basics",
      content:
        "Settlement building is a major feature in Fallout 4 that allows you to construct and manage your own settlements. " +
        "Key aspects include: " +
        "1. Resources: Food, water, power, defense, and beds are essential. " +
        "2. Happiness: Settlers' happiness depends on resources, safety, and amenities. " +
        "3. Building: Use the workshop mode to place structures, furniture, defenses, and more. " +
        "4. Settlers: Attract settlers by building a recruitment beacon and meeting basic needs.",
      keywords: ["settlement", "building", "basics", "workshop", "resources", "happiness", "settlers", "beacon"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Essential Settlement Mods",
      content:
        "These mods greatly enhance the settlement building experience: " +
        "1. Place Everywhere - Removes building restrictions and adds precision placement. " +
        "2. Sim Settlements - Allows settlements to build themselves with plots. " +
        "3. Homemaker - Adds hundreds of new buildable objects. " +
        "4. Snap'n Build - Provides modular building pieces that snap together. " +
        "5. Settlement Keywords Expanded - A framework for settlement mods. " +
        "6. Better Settlers - Improves settler variety and equipment.",
      keywords: [
        "settlement",
        "mods",
        "essential",
        "building",
        "recommended",
        "place everywhere",
        "sim settlements",
        "homemaker",
      ],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Settlement Mod Load Order",
      content:
        "For settlement mods, load order is crucial: " +
        "1. Framework mods (AWKCR, Settlement Keywords) should load early. " +
        "2. Structural mods (Snap'n Build, Homemaker) should load next. " +
        "3. Functional mods (Better Stores, Manufacturing Extended) follow. " +
        "4. Sim Settlements and its add-ons should load after other settlement mods. " +
        "5. Patches should load after the mods they patch. " +
        "6. Place Everywhere or similar utility mods can load last. " +
        "Always check mod descriptions for specific load order requirements.",
      keywords: [
        "load",
        "order",
        "settlement",
        "mods",
        "compatibility",
        "framework",
        "structural",
        "functional",
        "patches",
      ],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Settlement Supply Lines",
      content:
        "Supply lines connect your settlements and share resources: " +
        "1. To create a supply line, you need the Local Leader perk (Charisma 6). " +
        "2. In workshop mode, select a settler and choose the 'Supply Line' option. " +
        "3. Connected settlements share building materials and food/water for crafting. " +
        "4. Items in workbenches are accessible at all connected settlements. " +
        "5. Actual food and water production is not shared - each settlement needs its own. " +
        "6. The 'Better Supply Lines' mod improves the visual representation of your network.",
      keywords: ["supply", "lines", "local", "leader", "perk", "resources", "sharing", "network", "provisioner"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Sim Settlements 2",
      content:
        "Sim Settlements 2 is a major overhaul mod for the settlement system: " +
        "1. It adds a full questline with voiced NPCs and story content. " +
        "2. Settlers can build their own plots that evolve over time. " +
        "3. Three main plot types: Residential, Agricultural, and Industrial. " +
        "4. Leaders can be assigned to settlements to determine their development style. " +
        "5. The mod is highly modular with many add-on packs available. " +
        "6. Compatible with most other settlement mods when loaded in the correct order. " +
        "7. Requires F4SE (Fallout 4 Script Extender) to function properly.",
      keywords: [
        "sim",
        "settlements",
        "2",
        "plots",
        "questline",
        "leaders",
        "residential",
        "agricultural",
        "industrial",
      ],
    },
  ],
}

export default module
