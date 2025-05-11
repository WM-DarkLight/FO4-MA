"use client"

import { useState, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Save, HelpCircle, Check, AlertTriangle, Eye, Palette, Sparkles, BarChart2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KnowledgeModule, ModuleCategory, KnowledgeEntry } from "@/lib/types"
import { getAllEntries } from "@/lib/database"
import { jaccardSimilarity } from "@/lib/algorithms"

interface EditModuleDialogProps {
  module?: KnowledgeModule
  categories: ModuleCategory[]
  isOpen: boolean
  onClose: () => void
  onSave: (module: Omit<KnowledgeModule, "id">) => Promise<void>
  isLoading?: boolean
}

export function EditModuleDialog({
  module,
  categories,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EditModuleDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [author, setAuthor] = useState("")
  const [version, setVersion] = useState("1.0.0")
  const [categoryId, setCategoryId] = useState("general")
  const [activeTab, setActiveTab] = useState("edit")
  const [validationErrors, setValidationErrors] = useState<{ name?: string; description?: string }>({})
  const [selectedColor, setSelectedColor] = useState("#1aff80")
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([])
  const [similarModules, setSimilarModules] = useState<{ name: string; similarity: number }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestedCategories, setSuggestedCategories] = useState<ModuleCategory[]>([])

  // Load all entries for analysis
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

  // Reset form when module changes
  useEffect(() => {
    if (module) {
      setName(module.name)
      setDescription(module.description)
      setAuthor(module.author || "")
      setVersion(module.version || "1.0.0")
      setCategoryId(module.categoryId || "general")
    } else {
      setName("")
      setDescription("")
      setAuthor("")
      setVersion("1.0.0")
      setCategoryId("general")
    }
    setActiveTab("edit")
    setValidationErrors({})

    // Set the selected color based on the category
    if (module?.categoryId) {
      const category = categories.find((c) => c.id === module.categoryId)
      if (category) {
        setSelectedColor(category.color)
      }
    } else {
      setSelectedColor("#1aff80")
    }
  }, [module, isOpen, categories])

  // Update color when category changes
  useEffect(() => {
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setSelectedColor(category.color)
    }
  }, [categoryId, categories])

  // Analyze module content when name or description changes
  useEffect(() => {
    if (name || description) {
      analyzeModuleContent()
    }
  }, [name, description, allEntries, categories])

  const analyzeModuleContent = async () => {
    if (!name && !description) return

    setIsAnalyzing(true)
    try {
      const moduleText = `${name} ${description}`.toLowerCase()

      // Find similar modules based on content
      const moduleSimilarities = allEntries.reduce(
        (acc, entry) => {
          // Group entries by moduleId
          if (!acc[entry.moduleId]) {
            acc[entry.moduleId] = []
          }
          acc[entry.moduleId].push(entry)
          return acc
        },
        {} as Record<string, KnowledgeEntry[]>,
      )

      // Calculate similarity for each module
      const similarities = Object.entries(moduleSimilarities).map(([moduleId, entries]) => {
        // Combine all entry content for this module
        const moduleContent = entries.map((e) => `${e.title} ${e.content}`).join(" ")

        // Calculate similarity
        const similarity = jaccardSimilarity(
          new Set(moduleText.split(/\s+/).filter((t) => t.length > 2)),
          new Set(
            moduleContent
              .toLowerCase()
              .split(/\s+/)
              .filter((t) => t.length > 2),
          ),
        )

        // Find module name
        const moduleName = entries[0]?.moduleId || moduleId

        return { moduleId, name: moduleName, similarity }
      })

      // Sort by similarity and get top results
      const topSimilar = similarities
        .filter((s) => s.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)

      setSimilarModules(topSimilar)

      // Suggest categories based on content
      const categoryScores = categories.map((category) => {
        // Calculate how well the module content matches category keywords
        const categoryKeywords = [category.name.toLowerCase(), ...category.name.toLowerCase().split(/\s+/)]

        let score = 0
        for (const keyword of categoryKeywords) {
          if (moduleText.includes(keyword)) {
            score += 1
          }
        }

        return { category, score }
      })

      // Sort by score and get top suggestions
      const topCategories = categoryScores
        .filter((c) => c.score > 0 && c.category.id !== categoryId)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((c) => c.category)

      setSuggestedCategories(topCategories)
    } catch (error) {
      console.error("Error analyzing module content:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      errors.name = "Module name is required"
    }

    if (!description.trim()) {
      errors.description = "Description is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    await onSave({
      name,
      description,
      author: author.trim() || undefined,
      version: version.trim() || "1.0.0",
      categoryId,
    })
  }

  const getCategoryName = (id: string): string => {
    const category = categories.find((c) => c.id === id)
    return category ? category.name : "General"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/90 border-[#1aff80]/30 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#1aff80]">{module ? "Edit Module" : "Add New Module"}</DialogTitle>
          <DialogDescription>
            {module ? "Update the module information below." : "Fill in the details to create a new knowledge module."}
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
                      <Label htmlFor="name" className="text-[#1aff80]">
                        Module Name
                      </Label>
                      {validationErrors.name && (
                        <span className="text-red-500 text-xs flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.name}
                        </span>
                      )}
                    </div>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Module name (e.g. 'Weapon Modifications')"
                      className={`fallout-input ${validationErrors.name ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    <p className="text-[#1aff80]/50 text-xs">
                      Choose a clear, descriptive name that indicates what information this module contains
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description" className="text-[#1aff80]">
                        Description
                      </Label>
                      {validationErrors.description && (
                        <span className="text-red-500 text-xs flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {validationErrors.description}
                        </span>
                      )}
                    </div>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of what this module covers"
                      rows={3}
                      className={`fallout-input ${validationErrors.description ? "border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    <p className="text-[#1aff80]/50 text-xs">
                      Provide a concise summary of the module's content to help users understand its purpose
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#1aff80]">
                      Category
                    </Label>
                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                      <SelectTrigger id="category" className="fallout-input">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#1aff80]/30">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="focus:bg-[#1aff80]/20 focus:text-[#1aff80]"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {suggestedCategories.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[#1aff80]/70 text-xs mb-1 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Suggested categories based on content:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedCategories.map((category) => (
                            <div
                              key={category.id}
                              className="px-2 py-1 rounded-full text-xs cursor-pointer flex items-center"
                              style={{
                                backgroundColor: `${category.color}20`,
                                borderColor: `${category.color}50`,
                                color: category.color,
                                border: "1px solid",
                              }}
                              onClick={() => setCategoryId(category.id)}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              {category.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[#1aff80]/50 text-xs">
                      Categorizing your module helps users find related information more easily
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-[#1aff80]">
                        Author (optional)
                      </Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Your name or username"
                        className="fallout-input"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="version" className="text-[#1aff80]">
                        Version
                      </Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="fallout-input"
                        disabled={isLoading}
                      />
                      <p className="text-[#1aff80]/50 text-xs">Use semantic versioning (e.g., 1.0.0)</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedColor }}></div>
                    <h3 className="text-[#1aff80] font-bold text-lg">{name || "Module Name"}</h3>
                  </div>

                  <div className="text-gray-300 mb-4">{description || "Module description will appear here..."}</div>

                  <div className="flex flex-col space-y-1 text-sm">
                    <div className="flex">
                      <span className="text-[#1aff80]/70 w-24">Category:</span>
                      <span className="text-gray-300">{getCategoryName(categoryId)}</span>
                    </div>
                    {author && (
                      <div className="flex">
                        <span className="text-[#1aff80]/70 w-24">Author:</span>
                        <span className="text-gray-300">{author}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="text-[#1aff80]/70 w-24">Version:</span>
                      <span className="text-gray-300">{version}</span>
                    </div>
                  </div>

                  {!name && !description && (
                    <div className="flex flex-col items-center justify-center py-8 text-[#1aff80]/50">
                      <Eye className="h-12 w-12 mb-2 opacity-30" />
                      <p>Preview will appear as you add content</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                  <h4 className="text-[#1aff80] font-bold mb-2 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Module Appearance
                  </h4>
                  <p className="text-gray-300 mb-4">This is how your module will appear in the knowledge base:</p>

                  <div className="border border-[#1aff80]/30 rounded-md p-4 bg-black/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[#1aff80] flex items-center text-lg font-medium">
                          {name || "Module Name"}
                        </h3>
                        {version && <div className="text-xs text-[#1aff80]/50 mt-1">v{version}</div>}
                      </div>
                      <div
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${selectedColor}20`,
                          borderColor: `${selectedColor}50`,
                          color: selectedColor,
                          border: "1px solid",
                        }}
                      >
                        {getCategoryName(categoryId)}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-2 mb-3">{description || "Module description"}</p>
                    <div className="text-xs text-[#1aff80]/70">
                      0 entries
                      {author && <> • By {author}</>}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-300px)]">
                <div className="space-y-6">
                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Module Analysis
                    </h3>

                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-[#1aff80] animate-spin mr-3" />
                        <p className="text-[#1aff80]/70">Analyzing module content...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-[#1aff80]/80 font-medium">Content Analysis</h4>
                          <ul className="space-y-1 text-gray-300">
                            <li className="flex items-start">
                              <div className="min-w-4 mt-0.5">
                                {name.length > 0 && name.length <= 50 ? (
                                  <Check className="h-4 w-4 text-[#1aff80]" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="ml-2">
                                Module name: {name.length} characters
                                {name.length > 50 && " (Consider a shorter name)"}
                                {name.length === 0 && " (Name is required)"}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="min-w-4 mt-0.5">
                                {description.length >= 20 && description.length <= 200 ? (
                                  <Check className="h-4 w-4 text-[#1aff80]" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="ml-2">
                                Description length: {description.length} characters
                                {description.length < 20 && " (Add more detail to your description)"}
                                {description.length > 200 && " (Consider a more concise description)"}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="min-w-4 mt-0.5">
                                {categoryId !== "general" ? (
                                  <Check className="h-4 w-4 text-[#1aff80]" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="ml-2">
                                {categoryId !== "general"
                                  ? `Category selected: ${getCategoryName(categoryId)}`
                                  : "Consider selecting a more specific category than General"}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {similarModules.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[#1aff80]/80 font-medium flex items-center">
                              <BarChart2 className="h-4 w-4 mr-1" />
                              Similar Existing Modules
                            </h4>
                            <p className="text-gray-300 text-sm">
                              These existing modules have similar content. Consider reviewing them to avoid duplication:
                            </p>
                            <ul className="space-y-1 text-gray-300">
                              {similarModules.map((module, index) => (
                                <li key={index} className="flex items-center">
                                  <div
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: `rgba(26, 255, 128, ${module.similarity})` }}
                                  ></div>
                                  <span>{module.name}</span>
                                  <span className="text-[#1aff80]/50 text-xs ml-2">
                                    ({Math.round(module.similarity * 100)}% similar)
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {suggestedCategories.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[#1aff80]/80 font-medium">Suggested Categories</h4>
                            <p className="text-gray-300 text-sm">
                              Based on your module content, these categories might be appropriate:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {suggestedCategories.map((category) => (
                                <div
                                  key={category.id}
                                  className="px-2 py-1 rounded-full text-xs cursor-pointer flex items-center"
                                  style={{
                                    backgroundColor: `${category.color}20`,
                                    borderColor: `${category.color}50`,
                                    color: category.color,
                                    border: "1px solid",
                                  }}
                                  onClick={() => setCategoryId(category.id)}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: category.color }}
                                  ></div>
                                  {category.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            onClick={analyzeModuleContent}
                            className="fallout-button"
                            disabled={!name || !description || isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" /> Re-analyze Module
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {name && description && !isAnalyzing && (
                    <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                      <h3 className="text-[#1aff80] font-bold text-lg mb-2">Module Organization Tips</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            {name.split(/\s+/).length >= 2
                              ? "Good module name! Descriptive names help users find your content."
                              : "Consider using a more descriptive name that clearly indicates the module's content."}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            {description.length >= 50
                              ? "Great description! Detailed descriptions help users understand the module's purpose."
                              : "Consider adding more detail to your description to help users understand what they'll find."}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                          <span>
                            After creating this module, add knowledge entries that focus on specific topics or
                            questions.
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
                      Creating Effective Knowledge Modules
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Group related information into a single module (e.g., "Weapon Modifications")</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Choose a descriptive name that clearly indicates the module's content</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Write a concise description that summarizes what users will find in this module</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Select the most appropriate category to help users find related information</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Include your name as the author if you want credit for your contributions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2">Module Organization Tips</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>
                          <strong>Topic-based modules:</strong> Focus on specific subjects like "ENB Configuration" or
                          "Settlement Building"
                        </span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>
                          <strong>Problem-solving modules:</strong> Address common issues like "Crash Troubleshooting"
                          or "Performance Optimization"
                        </span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>
                          <strong>Tool-specific modules:</strong> Cover specific tools like "FO4Edit Guide" or "Creation
                          Kit Basics"
                        </span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>
                          <strong>Workflow modules:</strong> Walk through processes like "Complete Mod Installation
                          Guide" or "Creating Custom Patches"
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/30 border border-[#1aff80]/30 rounded-md p-4">
                    <h3 className="text-[#1aff80] font-bold text-lg mb-2">After Creating Your Module</h3>
                    <p className="text-gray-300 mb-3">
                      Once you've created a module, you'll need to add knowledge entries to it. Each entry should:
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Focus on a specific topic, question, or procedure</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Include relevant keywords to make the entry discoverable</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-[#1aff80] mr-2 flex-shrink-0" />
                        <span>Provide clear, concise information that directly addresses the topic</span>
                      </li>
                    </ul>
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
          <Button
            onClick={handleSave}
            className="fallout-button"
            disabled={isLoading || !name.trim() || !description.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Module
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
