"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Save,
  Plus,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  Eye,
  Code,
  ListOrdered,
  Sparkles,
} from "lucide-react"
import type { KnowledgeEntry } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { getAllEntries } from "@/lib/database"
import { calculateTFIDF, jaccardSimilarity, expandQuery } from "@/lib/algorithms"

// Common keywords for suggestions
const COMMON_KEYWORDS = [
  "installation",
  "vortex",
  "mod manager",
  "load order",
  "compatibility",
  "crash",
  "performance",
  "texture",
  "mesh",
  "script",
  "plugin",
  "esp",
  "esm",
  "esl",
  "f4se",
  "creation kit",
  "nexus",
  "weapon",
  "armor",
  "settlement",
  "graphics",
  "enb",
  "body",
  "animation",
  "quest",
  "npc",
  "conflict",
  "resolution",
  "patch",
  "tutorial",
  "guide",
  "fix",
  "error",
  "ctd",
  "fps",
  "ini",
]

interface EditEntryDialogProps {
  entry?: KnowledgeEntry
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<KnowledgeEntry, "id" | "moduleId">) => Promise<void>
  isLoading?: boolean
}

export function EditEntryDialog({ entry, isOpen, onClose, onSave, isLoading = false }: EditEntryDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [activeTab, setActiveTab] = useState("edit")
  const [validationErrors, setValidationErrors] = useState<{ title?: string; content?: string }>({})
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<string[]>([])
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [contentQualityScore, setContentQualityScore] = useState(0)
  const keywordInputRef = useRef<HTMLInputElement>(null)
  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load all entries for intelligent suggestions
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entries = await getAllEntries()
        setAllEntries(entries)
      } catch (error) {
        console.error("Failed to load entries for analysis:", error)
      }
    }

    if (isOpen) {
      loadEntries()
    }
  }, [isOpen])

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
      setKeywords(entry.keywords)
    } else {
      setTitle("")
      setContent("")
      setKeywords([])
    }
    setKeywordInput("")
    setActiveTab("edit")
    setValidationErrors({})
    setContentQualityScore(0)
  }, [entry, isOpen])

  // Generate keyword suggestions based on title and content
  useEffect(() => {
    if (title || content) {
      const text = `${title} ${content}`.toLowerCase()
      const suggestions = COMMON_KEYWORDS.filter(
        (keyword) => !keywords.includes(keyword) && text.includes(keyword.toLowerCase()),
      ).slice(0, 5)

      setSuggestedKeywords(suggestions)
    } else {
      setSuggestedKeywords([])
    }
  }, [title, content, keywords])

  // Intelligent content analysis with debounce
  useEffect(() => {
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current)
    }

    if (title && content && allEntries.length > 0) {
      analyzeTimeoutRef.current = setTimeout(() => {
        analyzeContent()
      }, 1000) // Debounce for 1 second
    }

    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current)
      }
    }
  }, [title, content, allEntries])

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    try {
      // Extract important terms from content using TF-IDF
      const allDocuments = allEntries.map((e) => e.title + " " + e.content)
      const currentDocument = title + " " + content

      // Extract all terms from current document
      const terms = currentDocument
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 3 && !term.match(/^(the|and|but|for|or|nor|so|yet|a|an|in|to|of|at|by)$/i))

      // Calculate TF-IDF for each term
      const termScores = terms.map((term) => ({
        term,
        score: calculateTFIDF(term, currentDocument, allDocuments),
      }))

      // Sort by score and get top terms
      const topTerms = termScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.term)

      // Generate intelligent keyword suggestions
      const expandedQuery = expandQuery(currentDocument, allEntries)
      const potentialKeywords = expandedQuery
        .split(/\s+/)
        .filter((term) => term.length > 3 && !keywords.includes(term) && !COMMON_KEYWORDS.includes(term))

      // Find related entries
      const relatedEntries = allEntries.filter((e) => {
        const similarity = jaccardSimilarity(
          new Set(currentDocument.toLowerCase().split(/\s+/)),
          new Set((e.title + " " + e.content).toLowerCase().split(/\s+/)),
        )
        return similarity > 0.2 && similarity < 0.8 // Similar but not too similar
      })

      // Extract keywords from related entries
      const relatedKeywords = new Set<string>()
      relatedEntries.forEach((e) => {
        e.keywords.forEach((k) => {
          if (!keywords.includes(k) && !COMMON_KEYWORDS.includes(k)) {
            relatedKeywords.add(k)
          }
        })
      })

      // Combine all intelligent suggestions
      const allSuggestions = [...new Set([...potentialKeywords, ...Array.from(relatedKeywords), ...topTerms])].slice(
        0,
        8,
      )

      setIntelligentSuggestions(allSuggestions)

      // Calculate content quality score
      let qualityScore = 0

      // Length score (0-25)
      const contentLength = content.length
      qualityScore += Math.min(25, contentLength / 20)

      // Structure score (0-25)
      const hasBulletPoints = content.includes("1.") && content.includes("2.")
      const hasFormatting = content.includes("**") || content.includes("*")
      const hasGoodParagraphs = content.split("\n").filter((p) => p.trim().length > 0).length >= 2

      if (hasBulletPoints) qualityScore += 10
      if (hasFormatting) qualityScore += 5
      if (hasGoodParagraphs) qualityScore += 10

      // Keyword coverage score (0-25)
      const keywordCoverage = keywords.length / 5 // Aim for at least 5 keywords
      qualityScore += Math.min(25, keywordCoverage * 25)

      // Uniqueness score (0-25)
      const mostSimilarEntry = allEntries.reduce(
        (mostSimilar, entry) => {
          const similarity = jaccardSimilarity(
            new Set(currentDocument.toLowerCase().split(/\s+/)),
            new Set((entry.title + " " + entry.content).toLowerCase().split(/\s+/)),
          )

          if (similarity > mostSimilar.similarity) {
            return { entry, similarity }
          }
          return mostSimilar
        },
        { entry: null as KnowledgeEntry | null, similarity: 0 },
      )

      const uniquenessScore = 25 * (1 - (mostSimilarEntry.similarity || 0))
      qualityScore += uniquenessScore

      setContentQualityScore(Math.min(100, Math.round(qualityScore)))
    } catch (error) {
      console.error("Error analyzing content:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setKeywordInput("")

      // Focus back on the input after adding
      setTimeout(() => {
        keywordInputRef.current?.focus()
      }, 10)
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keywordInput) {
      e.preventDefault()
      addKeyword(keywordInput)
    }
  }

  const validateForm = (): boolean => {
    const errors: { title?: string; content?: string } = {}

    if (!title.trim()) {
      errors.title = "Title is required"
    }

    if (!content.trim()) {
      errors.content = "Content is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    // If no keywords were added, generate some from the title
    const finalKeywords =
      keywords.length > 0
        ? keywords
        : title
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 3)
            .slice(0, 5)

    await onSave({
      title,
      content,
      keywords: finalKeywords,
    })
  }

  const addFormattingToContent = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "numbered-list":
        if (selectedText) {
          // Format each line with a number
          formattedText = selectedText
            .split("\n")
            .map((line, index) => `${index + 1}. ${line}`)
            .join("\n")
        } else {
          formattedText = "1. "
        }
        break
      case "bold":
        formattedText = selectedText ? `**${selectedText}**` : "**bold text**"
        break
      case "italic":
        formattedText = selectedText ? `*${selectedText}*` : "*italic text*"
        break
      case "code":
        formattedText = selectedText ? `\`${selectedText}\`` : "`code`"
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)

    // Focus back on textarea after formatting
    setTimeout(() => {
      textarea.focus()
      // Set cursor position after the inserted text
      const newPosition = start + formattedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 10)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/90 border-[#1aff80]/30 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#1aff80]">{entry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
          <DialogDescription>
            {entry
              ? "Update the knowledge entry information below."
              : "Fill in the details to create a new knowledge entry."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="bg-black/50 border border-[#1aff80]/30 mb-4">
            <TabsTrigger value="edit" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Preview
            </TabsTrigger>
            <TabsTrigger value="analysis" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="help" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Help
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="edit" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="title" className="text-[#1aff80]">
                        Title
                      </Label>
                      {validationErrors.title && (
                        <span className="text-red-500 text-xs flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.title}
                        </span>
                      )}
                    </div>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Entry title (e.g. 'Installing Texture Mods')"
                      className={`fallout-input ${validationErrors.title ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="content" className="text-[#1aff80]">
                        Content
                      </Label>
                      {validationErrors.content && (
                        <span className="text-red-500 text-xs flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.content}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFormattingToContent("numbered-list")}
                        className="h-8 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFormattingToContent("bold")}
                        className="h-8 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10 font-bold"
                      >
                        B
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFormattingToContent("italic")}
                        className="h-8 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10 italic"
                      >
                        I
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFormattingToContent("code")}
                        className="h-8 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>

                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Detailed knowledge entry content. Use numbered lists for step-by-step instructions."
                      rows={10}
                      className={`fallout-input ${validationErrors.content ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    <p className="text-[#1aff80]/50 text-xs">
                      Tip: Use numbered lists for step-by-step instructions (e.g. "1. First step")
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords" className="text-[#1aff80]">
                      Keywords
                    </Label>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <AnimatePresence>
                        {keywords.map((keyword) => (
                          <motion.div
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Badge
                              variant="outline"
                              className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30 flex items-center gap-1 pl-2"
                            >
                              {keyword}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeKeyword(keyword)}
                                className="h-5 w-5 p-0 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-transparent"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        id="keywords"
                        ref={keywordInputRef}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordInputKeyDown}
                        placeholder="Type a keyword and press Enter"
                        className="fallout-input"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        onClick={() => addKeyword(keywordInput)}
                        disabled={!keywordInput.trim() || isLoading}
                        className="fallout-button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {intelligentSuggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[#1aff80]/70 text-xs mb-1 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI-suggested keywords:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {intelligentSuggestions.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-[#1aff80]/10 text-[#1aff80]/70 border-[#1aff80]/20 cursor-pointer hover:bg-[#1aff80]/20 hover:text-[#1aff80]"
                              onClick={() => addKeyword(keyword)}
                            >
                              + {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestedKeywords.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[#1aff80]/70 text-xs mb-1">Common keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedKeywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-[#1aff80]/5 text-[#1aff80]/60 border-[#1aff80]/20 cursor-pointer hover:bg-[#1aff80]/10 hover:text-[#1aff80]/80"
                              onClick={() => addKeyword(keyword)}
                            >
                              + {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[#1aff80]/50 text-xs">
                      Keywords help users find this entry when searching. Add terms users might search for.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                  <h3 className="text-[#1aff80] font-bold text-lg mb-4">{title || "Entry Title"}</h3>
                  <div className="text-gray-300 whitespace-pre-line mb-4">
                    {content || "Entry content will appear here..."}
                  </div>

                  {keywords.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[#1aff80]/70 text-xs mb-1">Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!title && !content && !keywords.length && (
                    <div className="flex flex-col items-center justify-center py-8 text-[#1aff80]/50">
                      <Eye className="h-12 w-12 mb-2 opacity-30" />
                      <p>Preview will appear as you add content</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Content Quality Analysis
                    </h3>

                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
                        <p className="text-[#1aff80]/70">Analyzing content...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[#1aff80]/70">Overall Quality Score:</span>
                            <span className="text-[#1aff80] font-bold">{contentQualityScore}/100</span>
                          </div>
                          <div className="w-full bg-black/50 rounded-full h-2.5">
                            <div
                              className="bg-[#1aff80] h-2.5 rounded-full"
                              style={{ width: `${contentQualityScore}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-[#1aff80]/80 font-medium">Content Analysis</h4>
                            <ul className="space-y-1 text-gray-300">
                              <li className="flex items-start">
                                <div className="min-w-4 mt-0.5">
                                  {content.length > 100 ? (
                                    <Check className="h-4 w-4 text-[#1aff80]" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <span className="ml-2">
                                  Length: {content.length} characters
                                  {content.length < 100 && " (Consider adding more detail)"}
                                </span>
                              </li>
                              <li className="flex items-start">
                                <div className="min-w-4 mt-0.5">
                                  {content.includes("1.") && content.includes("2.") ? (
                                    <Check className="h-4 w-4 text-[#1aff80]" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <span className="ml-2">
                                  {content.includes("1.") && content.includes("2.")
                                    ? "Contains numbered steps (Good)"
                                    : "No numbered steps (Consider adding step-by-step instructions)"}
                                </span>
                              </li>
                              <li className="flex items-start">
                                <div className="min-w-4 mt-0.5">
                                  {content.includes("**") || content.includes("*") ? (
                                    <Check className="h-4 w-4 text-[#1aff80]" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <span className="ml-2">
                                  {content.includes("**") || content.includes("*")
                                    ? "Uses text formatting (Good)"
                                    : "No text formatting (Consider using bold or italic for emphasis)"}
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[#1aff80]/80 font-medium">Keyword Analysis</h4>
                            <ul className="space-y-1 text-gray-300">
                              <li className="flex items-start">
                                <div className="min-w-4 mt-0.5">
                                  {keywords.length >= 3 ? (
                                    <Check className="h-4 w-4 text-[#1aff80]" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <span className="ml-2">
                                  {keywords.length} keywords
                                  {keywords.length < 3 && " (Aim for at least 5 keywords)"}
                                </span>
                              </li>
                              <li className="flex items-start">
                                <div className="min-w-4 mt-0.5">
                                  {title.length > 0 && title.length <= 60 ? (
                                    <Check className="h-4 w-4 text-[#1aff80]" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <span className="ml-2">
                                  Title length: {title.length} characters
                                  {title.length > 60 && " (Consider a shorter title)"}
                                  {title.length === 0 && " (Title is required)"}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {intelligentSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[#1aff80]/80 font-medium">Suggested Keywords</h4>
                            <p className="text-gray-300 text-sm">
                              Based on your content, these keywords might help users find this entry:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {intelligentSuggestions.map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="outline"
                                  className="bg-[#1aff80]/10 text-[#1aff80]/70 border-[#1aff80]/20 cursor-pointer hover:bg-[#1aff80]/20 hover:text-[#1aff80]"
                                  onClick={() => addKeyword(keyword)}
                                >
                                  + {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            onClick={analyzeContent}
                            className="fallout-button"
                            disabled={!title || !content || isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" /> Re-analyze Content
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {title && content && !isAnalyzing && (
                    <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                      <h3 className="text-[#1aff80] font-bold text-lg mb-2">Readability Tips</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            {content.split(/\s+/).length > 50
                              ? "Good length! Detailed content helps users understand the topic."
                              : "Consider adding more detail to make your entry more helpful."}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            {content.includes("1.") && content.includes("2.")
                              ? "Great job using numbered steps! This makes instructions easy to follow."
                              : "Consider using numbered steps for any instructions or procedures."}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            {content.includes("**") || content.includes("*")
                              ? "Good use of formatting! This helps highlight important information."
                              : "Try using bold or italic formatting to emphasize key points."}
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="help" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2 flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      Creating Effective Knowledge Entries
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Use clear, descriptive titles that users might search for</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Keep content focused on a single topic or question</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Use numbered lists for step-by-step instructions</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Include relevant keywords that users might search for</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Preview your entry to see how it will appear to users</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2">Example Entry</h3>
                    <div className="mb-2">
                      <span className="text-[#1aff80]/70">Title:</span>
                      <p className="text-gray-300">Installing ENB for Fallout 4</p>
                    </div>
                    <div className="mb-2">
                      <span className="text-[#1aff80]/70">Content:</span>
                      <p className="text-gray-300 whitespace-pre-line">
                        To install an ENB for Fallout 4: 1. Download the ENB Series binaries from enbdev.com 2. Extract
                        d3d11.dll and d3dcompiler_46e.dll to your Fallout 4 directory 3. Download your preferred ENB
                        preset 4. Extract the preset files to the same directory 5. Launch the game and press
                        Shift+Enter to access the ENB configuration For best performance, make sure your GPU has at
                        least 4GB of VRAM and adjust the settings in the ENB menu if you experience low framerates.
                      </p>
                    </div>
                    <div>
                      <span className="text-[#1aff80]/70">Keywords:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">enb</Badge>
                        <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">graphics</Badge>
                        <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">installation</Badge>
                        <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">visual</Badge>
                        <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">performance</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#1aff80]/50 text-[#1aff80]"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="fallout-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Entry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
