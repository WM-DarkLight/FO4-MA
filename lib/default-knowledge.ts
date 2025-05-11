import type { KnowledgeModule, KnowledgeEntry } from "./types"
import { nanoid } from "./utils"

// Generate IDs for modules
const moduleIds = {
  general: nanoid(),
  installation: nanoid(),
  vortex: nanoid(),
  conflicts: nanoid(),
  performance: nanoid(),
  scripting: nanoid(),
}

// Default modules
const modules: KnowledgeModule[] = [
  {
    id: moduleIds.general,
    name: "General Information",
    description: "Basic information about Fallout 4 modding",
  },
  {
    id: moduleIds.installation,
    name: "Mod Installation",
    description: "How to install mods for Fallout 4",
  },
  {
    id: moduleIds.vortex,
    name: "Vortex Mod Manager",
    description: "Information about using Vortex mod manager",
  },
  {
    id: moduleIds.conflicts,
    name: "Conflict Resolution",
    description: "How to resolve conflicts between mods",
  },
  {
    id: moduleIds.performance,
    name: "Performance Optimization",
    description: "Tips for improving performance with mods",
  },
  {
    id: moduleIds.scripting,
    name: "Scripting & Advanced",
    description: "Advanced modding techniques and scripting",
  },
]

// Default entries
const entries: KnowledgeEntry[] = [
  // General Information
  {
    id: nanoid(),
    moduleId: moduleIds.general,
    title: "What is modding?",
    content:
      "Modding refers to the process of modifying the game Fallout 4 by adding, changing, or removing content. Mods can range from simple texture replacements to complex new quests, items, or gameplay mechanics.",
    keywords: ["modding", "basics", "introduction", "what", "is"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.general,
    title: "Nexus Mods",
    content:
      "Nexus Mods is the primary platform for downloading Fallout 4 mods. It hosts thousands of mods created by the community, with features for tracking updates, endorsing mods, and managing your mod collection.",
    keywords: ["nexus", "mods", "website", "download", "platform"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.general,
    title: "Types of Mods",
    content:
      "Fallout 4 mods come in various types: texture replacements, new items/weapons, gameplay overhauls, quest mods, settlement enhancements, character appearance mods, and utility mods that improve the game's functionality.",
    keywords: ["types", "categories", "kinds", "mods"],
  },

  // Mod Installation
  {
    id: nanoid(),
    moduleId: moduleIds.installation,
    title: "Installing Mods with Vortex",
    content:
      'To install mods with Vortex: 1) Download and install Vortex from Nexus Mods. 2) Set up Vortex for Fallout 4. 3) Download mods using the "Mod Manager Download" button on Nexus. 4) Install the mod in Vortex. 5) Enable the mod. 6) Deploy your mods to apply changes.',
    keywords: ["install", "vortex", "how", "to", "steps"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.installation,
    title: "Manual Mod Installation",
    content:
      'For manual installation: 1) Download the mod files. 2) Extract the archive. 3) Look for a "Data" folder or files that would go into the Data folder. 4) Copy these files to your Fallout 4 Data directory (usually in Steam/steamapps/common/Fallout 4/Data). 5) Enable the mod in your plugins.txt file or through the in-game mod menu.',
    keywords: ["manual", "installation", "without", "manager", "data", "folder"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.installation,
    title: "Load Order Basics",
    content:
      "Load order determines the sequence in which the game loads mod files. Mods loaded later override conflicting changes from earlier mods. Use LOOT (Load Order Optimization Tool) or Vortex's built-in sorting to establish a stable load order. Some mods have specific load order requirements mentioned in their documentation.",
    keywords: ["load", "order", "sequence", "loot", "sorting"],
  },

  // Vortex Mod Manager
  {
    id: nanoid(),
    moduleId: moduleIds.vortex,
    title: "Vortex Overview",
    content:
      "Vortex is the official mod manager for Nexus Mods. It handles downloading, installing, and managing mods for Fallout 4 and many other games. Vortex features automatic load order sorting, conflict resolution tools, profile management, and easy mod deployment.",
    keywords: ["vortex", "overview", "features", "manager"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.vortex,
    title: "Vortex Profiles",
    content:
      'Profiles in Vortex allow you to maintain different mod setups for the same game. Each profile has its own enabled mods and load order. To create a new profile, go to the Profiles section, click "Add", and name your profile. You can switch between profiles easily without reinstalling mods.',
    keywords: ["profiles", "multiple", "setups", "switching"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.vortex,
    title: "Deploying Mods in Vortex",
    content:
      'Deploying in Vortex applies your mod changes to the game. After installing or enabling mods, click the "Deploy" button in the notification area or on the mods page. Vortex uses a deployment method that links mod files to your game folder rather than copying them, saving disk space and making it easy to disable mods.',
    keywords: ["deploy", "applying", "changes", "enable", "activate"],
  },

  // Conflict Resolution
  {
    id: nanoid(),
    moduleId: moduleIds.conflicts,
    title: "Understanding Mod Conflicts",
    content:
      "Mod conflicts occur when multiple mods try to change the same game files or data. Conflicts aren't always problematic—sometimes it's intentional for one mod to override another. Vortex highlights conflicts with colored indicators: red for unresolved conflicts, green for resolved ones.",
    keywords: ["conflicts", "understanding", "basics", "what", "are"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.conflicts,
    title: "Resolving Conflicts in Vortex",
    content:
      'To resolve conflicts in Vortex: 1) Go to the "Mods" tab. 2) Look for mods with conflict indicators. 3) Click on a mod with conflicts. 4) Select the "Conflicts" tab in the details panel. 5) For each conflict, choose which mod should "win" by setting rules like "Load After" or "Load Before". 6) Deploy your changes.',
    keywords: ["resolve", "fixing", "conflicts", "vortex", "rules"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.conflicts,
    title: "Using FO4Edit for Conflict Resolution",
    content:
      'FO4Edit (xEdit) is a powerful tool for viewing and resolving mod conflicts at a detailed level. It shows exactly which records mods are changing and allows you to create custom patches. To use it: 1) Load your mods in FO4Edit. 2) Look for conflicts (highlighted in colors). 3) Right-click and select "Copy as override into..." 4) Create a new patch file. 5) Edit the conflicting records as needed.',
    keywords: ["fo4edit", "xedit", "advanced", "conflict", "resolution", "patch"],
  },

  // Performance Optimization
  {
    id: nanoid(),
    moduleId: moduleIds.performance,
    title: "Performance-Friendly Mods",
    content:
      "Some mods can improve Fallout 4's performance: 1) Unofficial Fallout 4 Patch fixes bugs. 2) Boston FPS Fix improves performance in downtown Boston. 3) Optimized Vanilla Textures reduces texture sizes. 4) FAR (Faraway Area Reform) optimizes distant object rendering. 5) PhyOp - Performance Optimized Textures reduces VRAM usage.",
    keywords: ["performance", "fps", "improving", "optimization", "mods"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.performance,
    title: "INI File Tweaks",
    content:
      "Editing Fallout4.ini, Fallout4Prefs.ini, and Fallout4Custom.ini can improve performance. Key tweaks include: 1) Reducing shadow distance (fShadowDistance=3000). 2) Lowering god ray quality (iGodrayQuality=0). 3) Disabling weapon debris (bEnableGunParticles=0). 4) Reducing actor fade (fActorFadeDistance=10000). Always back up your INI files before editing.",
    keywords: ["ini", "tweaks", "configuration", "settings", "performance"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.performance,
    title: "Texture Optimization",
    content:
      'Large texture mods can impact performance. To optimize: 1) Choose "lite" versions of texture mods when available. 2) Use texture optimization tools like Ordenador or Texture Optimizer to compress textures. 3) Be selective about high-resolution texture packs, prioritizing only what you\'ll see up close. 4) Consider using texture optimization mods that maintain quality while reducing size.',
    keywords: ["textures", "optimization", "compression", "vram", "memory"],
  },

  // Scripting & Advanced
  {
    id: nanoid(),
    moduleId: moduleIds.scripting,
    title: "Introduction to Papyrus Scripting",
    content:
      "Papyrus is Fallout 4's scripting language. It allows modders to create custom behaviors and functionality. To start with Papyrus: 1) Install the Creation Kit. 2) Familiarize yourself with basic syntax and functions. 3) Study existing scripts in the game files. 4) Use the Papyrus compiler in the Creation Kit to compile your scripts. 5) Test thoroughly as script errors can cause significant issues.",
    keywords: ["papyrus", "scripting", "programming", "creation", "kit"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.scripting,
    title: "F4SE (Fallout 4 Script Extender)",
    content:
      "F4SE extends Fallout 4's scripting capabilities, allowing mods to do things impossible with standard Papyrus. To install: 1) Download from f4se.silverlock.org. 2) Extract files to your Fallout 4 directory. 3) Launch the game using f4se_loader.exe instead of the normal launcher. Many advanced mods require F4SE to function.",
    keywords: ["f4se", "script", "extender", "installation", "advanced"],
  },
  {
    id: nanoid(),
    moduleId: moduleIds.scripting,
    title: "Creating Merged and Smashed Patches",
    content:
      'For heavily modded setups, merged and smashed patches help resolve conflicts and improve stability: 1) Merged Patch: Use FO4Edit\'s "Create Merged Patch" function to combine compatible record changes. 2) Smashed Patch: Use Wrye Bash or Mator Smash to create a more comprehensive patch that intelligently combines records. These should be placed at the end of your load order.',
    keywords: ["merged", "patch", "smashed", "bash", "compatibility"],
  },
]

export const defaultKnowledgeBase = {
  modules,
  entries,
}
