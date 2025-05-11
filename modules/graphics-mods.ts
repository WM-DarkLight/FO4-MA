/**
 * Graphics Mods Knowledge Module
 *
 * This module contains information about graphics enhancement mods for Fallout 4,
 * including ENB presets, texture packs, and performance considerations.
 */

import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "graphics-mods-module"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Graphics Enhancements",
  description: "Information about graphics mods and visual improvements for Fallout 4",
  version: "1.0.0",
  author: "Comrade Yelskin",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "ENB Basics",
      content:
        "ENB (Enhanced Natural Beauty) is a post-processing injector that can dramatically improve Fallout 4's visuals: " +
        "1. Download the ENB Series binaries from enbdev.com. " +
        "2. Extract d3d11.dll and d3dcompiler_46e.dll to your Fallout 4 directory. " +
        "3. Download an ENB preset and extract its files to the same directory. " +
        "4. Configure settings using Shift+Enter in-game. " +
        "5. ENBs can significantly impact performance, requiring a stronger GPU. " +
        "Popular presets include PRC, Vogue ENB, and Visceral ENB.",
      keywords: ["ENB", "graphics", "visual", "preset", "post-processing", "d3d11", "performance", "GPU"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Texture Pack Recommendations",
      content:
        "Texture packs replace the game's original textures with higher resolution versions: " +
        "1. Vivid Fallout - All in One - Replaces landscape, architecture, and object textures. " +
        "2. Fallout 4 HD Overhaul - Comprehensive texture replacement. " +
        "3. Luxor's HD Texture Pack - High-quality textures for various objects. " +
        "4. FlaconOil's Complete Retexture Project - Covers nearly all game textures. " +
        "5. Optimized Vanilla Textures - Improves vanilla textures while maintaining performance. " +
        "Remember that high-resolution textures require more VRAM.",
      keywords: ["texture", "pack", "HD", "resolution", "VRAM", "vivid", "overhaul", "retexture", "optimized"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Weather and Lighting Mods",
      content:
        "Weather and lighting mods change the atmosphere and visual feel of the game: " +
        "1. True Storms - Adds intense radiation storms, heavy rain, and fog. " +
        "2. Vivid Weathers - Overhauls weather with new effects and visuals. " +
        "3. Enhanced Lights and FX - Improves interior lighting and adds light sources. " +
        "4. NAC (Natural and Atmospheric Commonwealth) - Complete weather and lighting overhaul. " +
        "5. Ultra Interior Lighting - Enhances interior spaces with realistic lighting. " +
        "These mods can be used alongside ENB presets for even better results.",
      keywords: ["weather", "lighting", "storms", "atmosphere", "interior", "NAC", "vivid", "enhanced", "ultra"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Performance Optimization",
      content:
        "When using graphics mods, consider these performance optimization tips: " +
        "1. Use 2K textures instead of 4K for better performance. " +
        "2. Boston FPS Fix improves performance in downtown Boston. " +
        "3. Insignificant Object Remover eliminates small objects that impact performance. " +
        "4. Shadow Boost dynamically adjusts shadow distance based on FPS. " +
        "5. Fog Remover can improve performance in foggy areas. " +
        "6. Texture Optimization Project reduces texture sizes without quality loss. " +
        "7. Always check your available VRAM before installing high-resolution texture packs.",
      keywords: ["performance", "optimization", "FPS", "Boston", "shadow", "fog", "texture", "VRAM", "remover"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "ReShade vs. ENB",
      content:
        "ReShade and ENB are different post-processing tools with distinct advantages: " +
        "1. ReShade: " +
        "   - Lower performance impact than ENB " +
        "   - Easier to install and configure " +
        "   - More shader effects available " +
        "   - Works with more games " +
        "2. ENB: " +
        "   - More advanced effects like subsurface scattering " +
        "   - Better integration with Fallout 4's engine " +
        "   - More presets available specifically for Fallout 4 " +
        "   - Higher performance impact " +
        "You can use both together, but this requires careful configuration to avoid conflicts.",
      keywords: ["ReShade", "ENB", "comparison", "post-processing", "performance", "shaders", "effects", "presets"],
    },
  ],
}

export default module
