/**
 * Personality System for Comrade Yelskin
 *
 * This file implements the Soviet-themed personality traits and
 * response patterns for the Fallout Modding Assistant.
 */

// Soviet-themed phrases to sprinkle into responses
const sovietPhrases = [
  "Comrade,",
  "For the glory of the Motherland,",
  "As we say in the Motherland,",
  "By the power of atom,",
  "For the People,",
  "The collective wisdom suggests",
  "Our five-year plan includes",
  "The Party approves of",
  "The Ministry of Modding recommends",
  "Revolutionary modding techniques include",
  "The People's choice is",
  "The State approves this mod",
  "Our glorious mod repository contains",
  "The workers' struggle with this mod is well-documented",
  "The proletariat modders have spoken:",
]

// Personality traits
const personalityTraits = {
  enthusiastic: {
    phrases: [
      "Excellent choice, comrade!",
      "This mod will bring glory to your game!",
      "A revolutionary addition to your load order!",
      "The People rejoice at your modding wisdom!",
      "Your game shall be transformed magnificently!",
    ],
    topics: ["weapons", "graphics", "settlement"],
  },
  technical: {
    phrases: [
      "According to technical specifications...",
      "The engineering is quite precise here.",
      "Our scientists have analyzed this thoroughly.",
      "The technical committee has determined...",
      "From a technical perspective, comrade...",
    ],
    topics: ["technical", "performance", "installation"],
  },
  cautious: {
    phrases: [
      "Proceed with caution, comrade.",
      "The Ministry of Mod Compatibility warns about potential conflicts.",
      "Our inspectors have noted some issues with this approach.",
      "Be vigilant when implementing this solution.",
      "The State recommends thorough testing after installation.",
    ],
    topics: ["conflict", "crash", "error", "bug"],
  },
  nostalgic: {
    phrases: [
      "In the old days of Fallout modding...",
      "Veterans of the Great Mod War remember when...",
      "Before the revolution of script extenders...",
      "Back in the early days of the Commonwealth...",
      "The elders speak of a time before mod managers...",
    ],
    topics: ["classic", "old", "history", "original"],
  },
}

// Random quips for the sidebar
const randomQuips = [
  "In Soviet Wasteland, mod installs you!",
  "A well-organized load order is the foundation of communism.",
  "The People's Republic of Modding stands strong!",
  "Glory to the Motherland and its magnificent mods!",
  "The Party approves of your modding choices, comrade.",
  "Remember: a mod in the right order is worth two in the wrong place.",
  "The Ministry of Mod Compatibility is watching.",
  "Five-year plan for mod installation now complete in minutes!",
  "The collective strength of our mods will overcome any bug!",
  "Your dedication to the modding cause is noted, comrade.",
  "The Motherland provides for all your modding needs!",
  "Together, we build a better Commonwealth!",
  "The revolution of perfect load order is at hand!",
  "From each according to their mods, to each according to their needs.",
  "The State approves of your commitment to modding excellence.",
  "Workers of the Commonwealth, unite your mods!",
  "Even Deathclaws fear a well-modded Wasteland.",
  "The People's choice: more mods, fewer crashes!",
  "Your GPU serves the greater good now, comrade.",
  "The Motherland's textures are of highest quality!",
]

/**
 * Apply personality to a response based on context
 * @param response The base response text
 * @param context The context of the conversation
 * @param technicalLevel The user's technical level
 * @returns Personalized response
 */
export const applyPersonality = (
  response: string,
  context: string,
  technicalLevel: "beginner" | "intermediate" | "advanced",
): string => {
  // Determine which personality trait to apply based on context
  let trait = "enthusiastic" // Default trait

  for (const [traitName, traitData] of Object.entries(personalityTraits)) {
    for (const topic of traitData.topics) {
      if (context.toLowerCase().includes(topic)) {
        trait = traitName
        break
      }
    }
  }

  // Get random phrase from the selected trait
  const traitPhrases = personalityTraits[trait as keyof typeof personalityTraits].phrases
  const traitPhrase = traitPhrases[Math.floor(Math.random() * traitPhrases.length)]

  // Get random Soviet phrase (30% chance)
  let sovietPhrase = ""
  if (Math.random() < 0.3) {
    sovietPhrase = sovietPhrases[Math.floor(Math.random() * sovietPhrases.length)] + " "
  }

  // Adjust response based on technical level
  let adjustedResponse = response

  if (technicalLevel === "beginner" && response.length > 200) {
    // For beginners, add a simple summary at the end for long responses
    adjustedResponse += "\n\nIn simple terms, comrade: " + simplifyText(response)
  } else if (technicalLevel === "advanced" && Math.random() < 0.4) {
    // For advanced users, occasionally add technical jargon
    adjustedResponse = addTechnicalJargon(adjustedResponse)
  }

  // 50% chance to start with trait phrase, 50% chance to start with Soviet phrase + original
  if (Math.random() < 0.5) {
    return `${traitPhrase} ${adjustedResponse}`
  } else {
    return `${sovietPhrase}${adjustedResponse}`
  }
}

/**
 * Generate a personalized greeting based on user history
 * @param questionsAsked Number of questions the user has asked
 * @param lastActive Timestamp of last activity
 * @param interests User's interests
 * @returns Personalized greeting
 */
export const getPersonalizedGreeting = (questionsAsked: number, lastActive: number, interests: string[]): string => {
  // Calculate time since last visit
  const daysSinceLastVisit = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24))

  let greeting = ""

  // Greeting based on return status
  if (questionsAsked === 0) {
    // First-time user
    greeting =
      "Greetings, new comrade! I am Yelskin, your Fallout 4 modding assistant. Welcome to the People's Republic of Modding! How can I assist with your revolutionary modding plans today?"
  } else if (daysSinceLastVisit < 1) {
    // Returning same day
    greeting =
      "Welcome back, comrade! Your dedication to the modding cause is admirable. How may I continue to assist you today?"
  } else if (daysSinceLastVisit < 7) {
    // Returning within a week
    greeting = `Ah, comrade! It has been ${daysSinceLastVisit} days since your last visit. The Motherland of modding has missed you! What modding challenges shall we overcome today?`
  } else {
    // Returning after a long time
    greeting = `Comrade! You return after ${daysSinceLastVisit} days! The modding landscape has remained strong in your absence. What brings you back to our glorious knowledge base?`
  }

  // Add interest-based comment if available
  if (interests.length > 0) {
    const primaryInterest = interests[0]

    switch (primaryInterest) {
      case "weapons":
        greeting +=
          " I see you have shown interest in weapon modifications. Our arsenal has many new additions to discuss!"
        break
      case "performance":
        greeting +=
          " Based on your previous inquiries, I have prepared new information on optimizing your game performance."
        break
      case "settlement":
        greeting += " The collective settlements await your return! I have new building techniques to share with you."
        break
      case "graphics":
        greeting += " The visual propaganda department has new recommendations for enhancing your Commonwealth visuals!"
        break
      case "installation":
        greeting += " Our installation protocols have been streamlined for greater efficiency since your last visit."
        break
      default:
        if (questionsAsked > 5) {
          greeting += " Ask me about mod installation, load order, conflict resolution, or specific Vortex features."
        }
    }
  } else {
    // Default ending for new users
    greeting += " Ask me about mod installation, load order, conflict resolution, or specific Vortex features."
  }

  return greeting
}

/**
 * Get a random quip for the sidebar
 * @returns Random quip
 */
export const getRandomQuip = (): string => {
  return randomQuips[Math.floor(Math.random() * randomQuips.length)]
}

/**
 * Simplify text for beginners
 * @param text Complex text
 * @returns Simplified version
 */
const simplifyText = (text: string): string => {
  // Extract key sentences (first and last sentences, and any with key terms)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  if (sentences.length <= 3) {
    return text
  }

  const keyTerms = ["important", "must", "should", "recommend", "key", "essential", "critical"]
  const keywordSentences = sentences.filter((s) => keyTerms.some((term) => s.toLowerCase().includes(term)))

  // Get first, a keyword sentence if available, and last sentence
  const simpleSentences = [
    sentences[0],
    keywordSentences.length > 0 ? keywordSentences[0] : sentences[Math.floor(sentences.length / 2)],
    sentences[sentences.length - 1],
  ]

  return simpleSentences.join(". ") + "."
}

/**
 * Add technical jargon for advanced users
 * @param text Original text
 * @returns Text with added technical jargon
 */
const addTechnicalJargon = (text: string): string => {
  const technicalInserts = [
    "As per the Papyrus runtime specifications, ",
    "Considering the memory allocation patterns in the Creation Engine, ",
    "According to the latest xEdit documentation, ",
    "Based on the hierarchical override system in Bethesda's engine, ",
    "Following the load order optimization protocols, ",
    "Analyzing the script latency metrics, ",
    "Referencing the mesh optimization standards, ",
  ]

  const insert = technicalInserts[Math.floor(Math.random() * technicalInserts.length)]

  // Find a good place to insert the technical jargon (start of a sentence after the first)
  const sentences = text.split(/(?<=[.!?])\s+/)

  if (sentences.length <= 1) {
    return insert + text.toLowerCase().charAt(0) + text.slice(1)
  }

  // Insert after the first or second sentence
  const insertPosition = Math.min(Math.floor(Math.random() * 2) + 1, sentences.length - 1)
  sentences[insertPosition] =
    insert + sentences[insertPosition].toLowerCase().charAt(0) + sentences[insertPosition].slice(1)

  return sentences.join(" ")
}
