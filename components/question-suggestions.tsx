"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { getRecentSearches } from "@/lib/database"
import { getAllModules, getAllCategories } from "@/lib/database"
import { cn } from "@/lib/utils"
import { Sparkles, Clock, Star, Zap, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface QuestionSuggestionsProps {
  onSelectQuestion: (question: string) => void
  currentContext?: string
  className?: string
}

export const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({
  onSelectQuestion,
  currentContext,
  className,
}) => {
  const [suggestions, setSuggestions] = React.useState<Array<{ text: string; type: string }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load suggestions when component mounts
  React.useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true)
      try {
        // Get recent searches
        const recentSearches = await getRecentSearches(3)

        // Get all modules and categories for contextual suggestions
        const modules = await getAllModules()
        const categories = await getAllCategories()

        // Common fallout modding questions
        const commonQuestions = [
          "How do I install mods with Vortex?",
          "What's the best load order for weapon mods?",
          "How do I resolve mod conflicts?",
          "What ENB is best for performance?",
          "How do I create a custom settlement?",
          "What are the must-have mods for Fallout 4?",
          "How do I install texture mods?",
          "What mods fix bugs in the base game?",
        ]

        // Context-based suggestions
        let contextualSuggestions: string[] = []

        if (currentContext) {
          const contextLower = currentContext.toLowerCase()

          // Generate contextual follow-up questions
          if (contextLower.includes("weapon")) {
            contextualSuggestions = [
              "What are the best weapon mods?",
              "How do I balance weapon damage?",
              "Are there any good unique weapon mods?",
            ]
          } else if (contextLower.includes("settlement") || contextLower.includes("build")) {
            contextualSuggestions = [
              "How can I increase settlement build limit?",
              "What are the best settlement mods?",
              "How do I fix settlers not assigning to jobs?",
            ]
          } else if (contextLower.includes("crash") || contextLower.includes("error")) {
            contextualSuggestions = [
              "How do I fix random crashes?",
              "What's causing my game to freeze?",
              "How do I troubleshoot mod conflicts?",
            ]
          } else if (
            contextLower.includes("graphic") ||
            contextLower.includes("fps") ||
            contextLower.includes("performance")
          ) {
            contextualSuggestions = [
              "How can I improve FPS?",
              "What are the best performance mods?",
              "Which ENB has the best performance?",
            ]
          }
        }

        // Combine all suggestions
        const allSuggestions = [
          ...recentSearches.map((search) => ({ text: search, type: "recent" })),
          ...contextualSuggestions.map((q) => ({ text: q, type: "contextual" })),
          ...commonQuestions
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 5 - contextualSuggestions.length) // Take enough to have 5 total with contextual
            .map((q) => ({ text: q, type: "common" })),
        ]

        // Deduplicate
        const uniqueSuggestions = Array.from(new Map(allSuggestions.map((item) => [item.text, item])).values())

        // Limit to 8 suggestions
        setSuggestions(uniqueSuggestions.slice(0, 8))
      } catch (error) {
        console.error("Failed to load suggestions:", error)
        setSuggestions([
          { text: "How do I install mods?", type: "common" },
          { text: "What are the best weapon mods?", type: "common" },
          { text: "How do I fix mod conflicts?", type: "common" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [currentContext])

  // Load the expanded state from localStorage
  React.useEffect(() => {
    const savedState = localStorage.getItem("suggestionsExpanded")
    if (savedState !== null) {
      setIsExpanded(savedState === "true")
    }
  }, [])

  // Save expanded state to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem("suggestionsExpanded", isExpanded.toString())
  }, [isExpanded])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "recent":
        return <Clock className="h-3 w-3 mr-1" />
      case "contextual":
        return <Zap className="h-3 w-3 mr-1" />
      case "common":
        return <Star className="h-3 w-3 mr-1" />
      default:
        return <Sparkles className="h-3 w-3 mr-1" />
    }
  }

  return (
    <div className={cn("border-t border-[#1aff80]/30 bg-black/80", className)}>
      <div className="flex items-center justify-between px-4 py-2 cursor-pointer" onClick={toggleExpanded}>
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-[#1aff80] mr-2" />
          <span className="text-[#1aff80] text-xs font-mono">SUGGESTED QUESTIONS</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 text-[#1aff80] hover:bg-[#1aff80]/10"
          onClick={(e) => {
            e.stopPropagation()
            toggleExpanded()
          }}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              {isLoading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-9 w-32 bg-black/30 border border-[#1aff80]/30 rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectQuestion(suggestion.text)}
                      className="bg-black/50 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10 hover:border-[#1aff80] transition-colors text-xs"
                    >
                      {getIcon(suggestion.type)}
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
