"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { initializeDatabase, addRecentSearch } from "@/lib/database"
import { searchKnowledgeBase as advancedSearch } from "@/lib/search"
import type { Message, SearchResult } from "@/lib/types"
import {
  Loader2,
  Send,
  Database,
  Settings,
  Terminal,
  Radio,
  Shield,
  Zap,
  Menu,
  X,
  RefreshCw,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import KnowledgeBaseManager from "@/components/knowledge-base-manager"
import SettingsPanel from "@/components/settings-panel"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getSettings } from "@/lib/settings"
import { HighlightedText } from "@/components/highlighted-text"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import type { KeyboardShortcut } from "@/lib/types"
import { generateResponse } from "@/lib/algorithms"
import { QuestionSuggestions } from "@/components/question-suggestions"
import {
  initializeUserMemory,
  getCurrentUser,
  addMessageToConversation,
  analyzeConversationTopics,
  getUserInterests,
  getUserPreferences,
} from "@/lib/user-memory"
import { applyPersonality, getPersonalizedGreeting, getRandomQuip } from "@/lib/personality"
import {
  analyzeSentiment,
  enhanceResponseWithContext,
  learnFromInteraction,
  retrieveContextualMemory,
} from "./lib/advanced-algorithms"

// Import modules
import weaponMods from "@/modules/weapon-mods"
import armorMods from "@/modules/armor-mods"
import settlementMods from "@/modules/settlement-mods"
import graphicsMods from "@/modules/graphics-mods"
import { moduleRegistry } from "@/lib/module-registry"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDbInitialized, setIsDbInitialized] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true)
  const [searchHighlighting, setSearchHighlighting] = useState(true)
  const [userTechnicalLevel, setUserTechnicalLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [randomQuip, setRandomQuip] = useState("")
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true)
      try {
        // Register modules manually before initializing the database
        moduleRegistry.registerModule(weaponMods)
        moduleRegistry.registerModule(armorMods)
        moduleRegistry.registerModule(settlementMods)
        moduleRegistry.registerModule(graphicsMods)

        // Initialize the database first
        await initializeDatabase()
        setIsDbInitialized(true)

        // Initialize user memory system
        await initializeUserMemory()

        // Get user profile
        const userProfile = await getCurrentUser()
        setUserTechnicalLevel(userProfile.preferences.technicalLevel || "intermediate")

        // Get user interests
        const interests = await getUserInterests()
        setUserInterests(interests)

        // Set a random quip
        setRandomQuip(getRandomQuip())

        // Then load settings after database is initialized
        try {
          const settings = await getSettings()
          setKeyboardShortcutsEnabled(settings.keyboardShortcuts !== false)
          setSearchHighlighting(settings.searchHighlighting !== false)
        } catch (settingsError) {
          console.error("Failed to load settings, using defaults:", settingsError)
          // Continue with default settings
        }

        // Create personalized greeting
        const greeting = getPersonalizedGreeting(
          userProfile.stats.questionsAsked,
          userProfile.stats.lastActive,
          interests,
        )

        const initialMessage = {
          id: "1",
          role: "assistant",
          content: greeting,
          timestamp: Date.now(),
        }

        setMessages([initialMessage])
        setLastMessageId(initialMessage.id)
      } catch (error) {
        console.error("Failed to initialize database:", error)
        setInitError(
          "Failed to initialize the knowledge base. Please refresh the page or check browser storage permissions.",
        )
        toast({
          title: "Database Error",
          description: "Failed to initialize the knowledge base. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()

    // Add scanline effect
    const scanlineElement = document.createElement("div")
    scanlineElement.className = "scanline"
    document.body.appendChild(scanlineElement)

    return () => {
      if (document.body.contains(scanlineElement)) {
        document.body.removeChild(scanlineElement)
      }
    }
  }, [toast])

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      id: "focus-input",
      name: "Focus Chat Input",
      keys: ["/"],
      description: "Focus the chat input",
      action: () => {
        if (activeTab === "chat") {
          inputRef.current?.focus()
        }
      },
    },
    {
      id: "send-message",
      name: "Send Message",
      keys: ["Enter"],
      description: "Send the current message",
      action: () => {
        if (activeTab === "chat" && input.trim() && !isProcessing) {
          handleSubmit(new Event("submit") as any)
        }
      },
    },
    {
      id: "switch-to-chat",
      name: "Switch to Chat",
      keys: ["Alt", "1"],
      description: "Switch to the Chat tab",
      action: () => {
        setActiveTab("chat")
      },
    },
    {
      id: "switch-to-knowledge",
      name: "Switch to Knowledge Base",
      keys: ["Alt", "2"],
      description: "Switch to the Knowledge Base tab",
      action: () => {
        setActiveTab("knowledge")
      },
    },
    {
      id: "switch-to-settings",
      name: "Switch to Settings",
      keys: ["Alt", "3"],
      description: "Switch to the Settings tab",
      action: () => {
        setActiveTab("settings")
      },
    },
  ]

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      })
    }
  }

  useEffect(() => {
    // Use a small timeout to ensure the DOM has updated
    const scrollTimer = setTimeout(() => {
      if (messages.length > 0) {
        scrollToBottom()
      }
    }, 100)

    return () => clearTimeout(scrollTimer)
  }, [messages, isProcessing])

  // Update random quip periodically
  useEffect(() => {
    const quipInterval = setInterval(() => {
      setRandomQuip(getRandomQuip())
    }, 60000) // Change every minute

    return () => clearInterval(quipInterval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing || !isDbInitialized) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Add to recent searches
      await addRecentSearch(input)

      // Analyze sentiment
      const sentiment = analyzeSentiment(input)

      // Extract topics from the query
      const topics = analyzeConversationTopics(input)

      // Add message to conversation memory
      await addMessageToConversation("user", input, topics)

      // Search the knowledge base for relevant information
      const results = await advancedSearch(input)
      setSearchResults(results)

      // Get conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add the current user message
      conversationHistory.push({
        role: userMessage.role,
        content: userMessage.content,
      })

      // Retrieve contextual memory
      const relevantMemory = retrieveContextualMemory(input, conversationHistory)

      // Small delay to simulate processing and make the interaction feel more natural
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800))

      // Generate a contextual response using our advanced algorithms
      let response = generateResponse(input, results, conversationHistory)

      // Get user preferences
      const preferences = await getUserPreferences()

      // Enhance response with context
      response = await enhanceResponseWithContext(response, input, conversationHistory, {
        technicalLevel: preferences.technicalLevel,
        interests: await getUserInterests(),
      })

      // Apply Comrade Yelskin's personality
      response = applyPersonality(response, topics.join(" "), userTechnicalLevel)

      // If user is frustrated, add extra empathy
      if (sentiment.isFrustrated) {
        const empathyPhrases = [
          "I understand this can be frustrating, comrade. Let's solve this together. ",
          "The struggle with technology is real, comrade. But together we will prevail! ",
          "Your frustration is noted, comrade. The Ministry of Modding Support is here to help. ",
        ]
        const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)]
        response = randomEmpathy + response
      }

      // Add message to conversation memory
      await addMessageToConversation("assistant", response, topics)

      // Learn from this interaction
      await learnFromInteraction(input, response)

      // Refresh user interests
      const interests = await getUserInterests()
      setUserInterests(interests)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setLastMessageId(assistantMessage.id)

      // Focus the input field after response
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error("Error processing query:", error)
      toast({
        title: "Processing Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle selecting a suggested question
  const handleSelectQuestion = (question: string) => {
    setInput(question)
    // Focus the input field
    inputRef.current?.focus()
  }

  // Handle feedback for responses
  const handleFeedback = async (messageId: string, feedbackType: "positive" | "negative") => {
    try {
      // Find the message and its corresponding query
      const messageIndex = messages.findIndex((m) => m.id === messageId)
      if (messageIndex < 0 || messages[messageIndex].role !== "assistant") return

      // Get the user query that preceded this response
      const userQuery = messageIndex > 0 ? messages[messageIndex - 1].content : ""
      const response = messages[messageIndex].content

      // Learn from the feedback
      await learnFromInteraction(userQuery, response, feedbackType)

      // Show feedback confirmation
      toast({
        title: feedbackType === "positive" ? "Feedback Received" : "Feedback Noted",
        description:
          feedbackType === "positive"
            ? "Thank you! This helps improve future responses."
            : "Thank you for your feedback. I'll try to do better next time.",
        variant: feedbackType === "positive" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error processing feedback:", error)
    }
  }

  // Handle showing the module tutorial from chat
  const handleShowTutorial = () => {
    setActiveTab("knowledge")
    // Small delay to ensure tab change completes
    setTimeout(() => {
      const tutorialTabTrigger = document.getElementById("tutorial-tab-trigger")
      if (tutorialTabTrigger) {
        tutorialTabTrigger.click()
      }
    }, 100)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4 vaultboy-animation">
            <Avatar className="h-32 w-32 border-4 border-[#1aff80] rounded-full overflow-hidden bg-black/50 mx-auto">
              <img
                src="/images/comrade-yelskin.png"
                alt="Comrade Yelskin"
                className="h-full w-full object-cover"
                style={{ objectPosition: "center 10%" }}
              />
            </Avatar>
          </div>
          <h1 className="text-[#1aff80] font-mono text-2xl mb-4">COMRADE YELSKIN</h1>
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#1aff80] mr-2" />
            <p className="text-[#1aff80]/70">Initializing Fallout 4 Modding Assistant...</p>
          </div>
          <div className="w-64 h-2 bg-black/50 rounded overflow-hidden mx-auto">
            <div className="h-full bg-[#1aff80] animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-black/80 border border-red-500/50 rounded-lg">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-[#1aff80] font-mono text-xl mb-4">INITIALIZATION ERROR</h1>
          <p className="text-gray-300 mb-6">{initError}</p>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Possible solutions:</p>
            <ul className="text-gray-400 text-sm text-left list-disc pl-5 space-y-2">
              <li>Refresh the page and try again</li>
              <li>Check that your browser allows local storage and IndexedDB</li>
              <li>Try using a different browser</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
          </div>
          <Button className="fallout-button mt-6" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Initialization
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen w-screen fallout-bg">
      <div className="fallout-overlay min-h-screen w-full flex flex-col">
        <div className="w-full h-screen flex flex-col">
          {/* Mobile menu button */}
          <div className="md:hidden absolute top-4 right-4 z-50">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-black/50 border-[#1aff80] text-[#1aff80]"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-16 right-4 z-40 bg-black/90 border border-[#1aff80] rounded-md shadow-lg shadow-[#1aff80]/20 p-4 w-64"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[#1aff80]">
                    <Terminal className="h-4 w-4" />
                    <span>Comrade Yelskin v1.0</span>
                  </div>
                  <div className="border-t border-[#1aff80]/30 pt-4">
                    <p className="text-[#1aff80]/70 text-sm">Fallout 4 Modding Assistant</p>
                    <p className="text-[#1aff80]/50 text-xs mt-2">Fully offline - No data leaves your device</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col flex-1 bg-black/90 overflow-hidden">
            <div className="pip-boy-header h-12 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <Terminal className="h-5 w-5 text-[#1aff80]" />
                <h1 className="text-[#1aff80] font-mono text-lg tracking-wider">COMRADE YELSKIN</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#1aff80]/70 text-xs">SIGNAL STRENGTH: LOCAL</span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-2 w-2 rounded-full ${i <= 3 ? "bg-[#1aff80]" : "bg-[#1aff80]/30"}`} />
                  ))}
                </div>
              </div>
            </div>

            <Card className="fallout-card border-0 rounded-none flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <TabsList className="grid grid-cols-3 bg-black/80 rounded-none border-b border-[#1aff80]/30 h-14">
                  <TabsTrigger
                    value="chat"
                    className="fallout-tab data-[state=active]:text-[#1aff80] h-full rounded-none"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    COMMUNICATIONS
                  </TabsTrigger>
                  <TabsTrigger
                    value="knowledge"
                    className="fallout-tab data-[state=active]:text-[#1aff80] h-full rounded-none"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    KNOWLEDGE BASE
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="fallout-tab data-[state=active]:text-[#1aff80] h-full rounded-none"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    SETTINGS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="p-0 m-0 flex-1 flex flex-col">
                  <div className="flex h-full flex-1">
                    {/* Sidebar with avatar and stats */}
                    <div className="hidden md:flex w-64 flex-col bg-black/70 border-r border-[#1aff80]/30 p-4">
                      <div className="flex flex-col items-center">
                        <div className="relative mb-4 vaultboy-animation">
                          <Avatar className="h-32 w-32 border-4 border-[#1aff80] rounded-full overflow-hidden bg-black/50">
                            <img
                              src="/images/comrade-yelskin.png"
                              alt="Comrade Yelskin"
                              className="h-full w-full object-cover"
                              style={{ objectPosition: "center 10%" }}
                            />
                          </Avatar>
                          <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                            <div className="bg-[#1aff80] text-black px-2 py-0.5 text-xs font-bold rounded">ONLINE</div>
                          </div>
                        </div>

                        <h2 className="text-[#1aff80] font-mono text-xl mb-1">COMRADE YELSKIN</h2>
                        <p className="text-[#1aff80]/70 text-sm mb-6">Fallout 4 Modding Assistant</p>

                        <div className="w-full space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#1aff80]/70">KNOWLEDGE</span>
                              <span className="text-[#1aff80]">EXTENSIVE</span>
                            </div>
                            <div className="h-2 bg-black/50 rounded overflow-hidden">
                              <div className="h-full bg-[#1aff80] w-4/5"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#1aff80]/70">RELIABILITY</span>
                              <span className="text-[#1aff80]">VERY HIGH</span>
                            </div>
                            <div className="h-2 bg-black/50 rounded overflow-hidden">
                              <div className="h-full bg-[#1aff80] w-11/12"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#1aff80]/70">RADIATION</span>
                              <span className="text-[#1aff80]">0 RAD</span>
                            </div>
                            <div className="h-2 bg-black/50 rounded overflow-hidden">
                              <div className="h-full bg-[#1aff80] w-0"></div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 w-full p-3 bg-black/30 border border-[#1aff80]/30 rounded text-center">
                          <p className="text-[#1aff80] text-sm font-mono">{randomQuip}</p>
                        </div>

                        <Button className="fallout-button mt-6 w-full" onClick={handleShowTutorial}>
                          <BookOpen className="h-4 w-4 mr-2" /> Module Tutorial
                        </Button>

                        <div className="mt-4">
                          <KeyboardShortcuts shortcuts={shortcuts} enabled={keyboardShortcutsEnabled} />
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="border-t border-[#1aff80]/30 pt-4 text-center">
                          <p className="text-[#1aff80]/50 text-xs">Fully offline - No data leaves your device</p>
                        </div>
                      </div>
                    </div>

                    {/* Main chat area */}
                    <div className="flex-1 flex flex-col">
                      <ScrollArea
                        className="flex-1 p-6 fallout-scrollbar radiation-bg overflow-y-auto"
                        ref={chatContainerRef}
                        style={{ maxHeight: "calc(100vh - 230px)" }}
                      >
                        <div className="space-y-6">
                          {messages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                            >
                              {message.role === "assistant" && (
                                <Avatar className="h-10 w-10 mr-3 mt-1 border-2 border-[#1aff80] rounded-lg overflow-hidden">
                                  <img
                                    src="/images/comrade-yelskin.png"
                                    alt="Comrade Yelskin"
                                    className="h-full w-full object-cover"
                                    style={{ objectPosition: "center 10%" }}
                                  />
                                </Avatar>
                              )}
                              <div className="flex flex-col">
                                <div
                                  className={cn(
                                    "p-4 rounded-lg max-w-[80%] shadow-lg",
                                    message.role === "user"
                                      ? "bg-[#3a3a3a] text-white border border-gray-600"
                                      : "fallout-terminal border border-[#1aff80]/50",
                                  )}
                                  style={{
                                    boxShadow:
                                      message.role === "assistant" ? "0 0 15px rgba(26, 255, 128, 0.2)" : "none",
                                  }}
                                >
                                  {message.role === "assistant" && searchHighlighting && searchResults.length > 0 ? (
                                    <div>
                                      {searchResults[0].matches?.map((match, idx) => {
                                        if (match.field === "content") {
                                          return (
                                            <HighlightedText
                                              key={idx}
                                              text={message.content}
                                              query={input || messages[messages.length - 2]?.content || ""}
                                            />
                                          )
                                        }
                                        return null
                                      }) || message.content}
                                    </div>
                                  ) : (
                                    message.content
                                  )}
                                </div>

                                {/* Feedback buttons for assistant messages */}
                                {message.role === "assistant" && message.id === lastMessageId && (
                                  <div className="flex space-x-2 mt-2 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-black/30"
                                      onClick={() => handleFeedback(message.id, "positive")}
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                      <span className="text-xs">Helpful</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-black/30"
                                      onClick={() => handleFeedback(message.id, "negative")}
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                      <span className="text-xs">Not Helpful</span>
                                    </Button>
                                  </div>
                                )}
                              </div>
                              {message.role === "user" && (
                                <Avatar className="h-10 w-10 ml-3 mt-1 border-2 border-gray-600 rounded-lg overflow-hidden bg-gray-800">
                                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <span>YOU</span>
                                  </div>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                          {isProcessing && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-start"
                            >
                              <Avatar className="h-10 w-10 mr-3 mt-1 border-2 border-[#1aff80] rounded-lg overflow-hidden">
                                <img
                                  src="/images/comrade-yelskin.png"
                                  alt="Comrade Yelskin"
                                  className="h-full w-full object-cover"
                                  style={{ objectPosition: "center 10%" }}
                                />
                              </Avatar>
                              <div
                                className="p-4 rounded-lg fallout-terminal border border-[#1aff80]/50"
                                style={{ boxShadow: "0 0 15px rgba(26, 255, 128, 0.2)" }}
                              >
                                <div className="typing-indicator">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Question suggestions - now collapsible */}
                      <QuestionSuggestions
                        onSelectQuestion={handleSelectQuestion}
                        currentContext={messages.length > 0 ? messages[messages.length - 1].content : ""}
                      />

                      <div className="p-4 border-t border-[#1aff80]/30 bg-black/70">
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                          <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about Fallout 4 modding..."
                            className="fallout-input flex-grow border-[#1aff80]/50 focus:border-[#1aff80] focus:ring-[#1aff80]/30 bg-black/50"
                            disabled={!isDbInitialized || isProcessing}
                          />
                          <Button type="submit" disabled={!isDbInitialized || isProcessing} className="fallout-button">
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge">
                  <KnowledgeBaseManager />
                </TabsContent>

                <TabsContent value="settings">
                  <SettingsPanel />
                </TabsContent>
              </Tabs>
            </Card>

            <div className="pip-boy-footer h-10 flex items-center justify-between px-6 border-t border-[#1aff80]/30">
              <div className="flex items-center space-x-4 text-[#1aff80]/70 text-xs">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>SECURE</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>OFFLINE</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[#1aff80]/70 text-xs">
                <span>V1.0.0 | © 2077 RobCo Industries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
