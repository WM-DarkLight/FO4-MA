"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getAllModules,
  getEntriesByModule,
  addKnowledgeEntry,
  deleteKnowledgeEntry,
  exportDatabase,
  importDatabase,
  addKnowledgeModule,
  updateKnowledgeEntry,
  exportModule,
  importModule,
  getAllCategories,
  getModulesByCategory,
} from "@/lib/database"
import type { KnowledgeEntry, KnowledgeModule, ModuleCategory, KeyboardShortcut } from "@/lib/types"
import {
  Loader2,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  FileText,
  Database,
  FolderPlus,
  AlertTriangle,
  Info,
  Code,
  BookOpen,
  Edit,
  Filter,
  Tag,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ModuleTutorial from "@/components/module-tutorial"
import { EditEntryDialog } from "@/components/edit-entry-dialog"
import { EditModuleDialog } from "@/components/edit-module-dialog"
import { ModuleCard } from "@/components/module-card"
import { CategoryBadge } from "@/components/category-badge"
import { HighlightedText } from "@/components/highlighted-text"
import { RecentSearches } from "@/components/recent-searches"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { getSettings } from "@/lib/settings"

export default function KnowledgeBaseManager() {
  const [modules, setModules] = useState<KnowledgeModule[]>([])
  const [selectedModule, setSelectedModule] = useState<string>("")
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [categories, setCategories] = useState<ModuleCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | undefined>(undefined)
  const [isEditingEntry, setIsEditingEntry] = useState(false)
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [editingModule, setEditingModule] = useState<KnowledgeModule | undefined>(undefined)
  const [isEditingModule, setIsEditingModule] = useState(false)
  const [isSavingModule, setIsSavingModule] = useState(false)
  const [isExportingModule, setIsExportingModule] = useState(false)
  const [isImportingModule, setIsImportingModule] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true)
  const [showRecentSearches, setShowRecentSearches] = useState(true)
  const { toast } = useToast()

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings()
        setKeyboardShortcutsEnabled(settings.keyboardShortcuts !== false)
        setShowRecentSearches(settings.showRecentSearches !== false)
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }

    loadSettings()
  }, [])

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      id: "search",
      name: "Focus Search",
      keys: ["/"],
      description: "Focus the search input",
      action: () => {
        const searchInput = document.getElementById("knowledge-search")
        if (searchInput) {
          searchInput.focus()
        }
      },
    },
    {
      id: "add-entry",
      name: "Add Entry",
      keys: ["Ctrl", "e"],
      description: "Add a new entry",
      action: () => {
        setEditingEntry(undefined)
        setIsEditingEntry(true)
      },
    },
    {
      id: "add-module",
      name: "Add Module",
      keys: ["Ctrl", "m"],
      description: "Add a new module",
      action: () => {
        setEditingModule(undefined)
        setIsEditingModule(true)
      },
    },
    {
      id: "toggle-view",
      name: "Toggle View",
      keys: ["Ctrl", "v"],
      description: "Toggle between list and grid view",
      action: () => {
        setViewMode(viewMode === "list" ? "grid" : "list")
      },
    },
    {
      id: "clear-search",
      name: "Clear Search",
      keys: ["Escape"],
      description: "Clear the search input",
      action: () => {
        setSearchQuery("")
      },
    },
  ]

  useEffect(() => {
    loadModules()
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedModule) {
      loadEntries(selectedModule)
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedCategory !== "all") {
      loadModulesByCategory(selectedCategory)
    } else {
      loadModules()
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const categoryList = await getAllCategories()
      setCategories(categoryList)
    } catch (error) {
      console.error("Failed to load categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const loadModules = async () => {
    try {
      setIsLoading(true)
      const moduleList = await getAllModules()
      setModules(moduleList)
      if (moduleList.length > 0 && !selectedModule) {
        setSelectedModule(moduleList[0].id)
      }
    } catch (error) {
      console.error("Failed to load modules:", error)
      toast({
        title: "Error",
        description: "Failed to load knowledge modules",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadModulesByCategory = async (categoryId: string) => {
    try {
      setIsLoading(true)
      const moduleList = await getModulesByCategory(categoryId)
      setModules(moduleList)
      if (moduleList.length > 0 && !selectedModule) {
        setSelectedModule(moduleList[0].id)
      }
    } catch (error) {
      console.error(`Failed to load modules for category ${categoryId}:`, error)
      toast({
        title: "Error",
        description: "Failed to load modules for this category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadEntries = async (moduleId: string) => {
    setIsLoading(true)
    try {
      const entriesList = await getEntriesByModule(moduleId)
      setEntries(entriesList)
    } catch (error) {
      console.error("Failed to load entries:", error)
      toast({
        title: "Error",
        description: "Failed to load knowledge entries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEntry = async () => {
    setEditingEntry(undefined)
    setIsEditingEntry(true)
  }

  const handleEditEntry = (entry: KnowledgeEntry) => {
    setEditingEntry(entry)
    setIsEditingEntry(true)
  }

  const handleSaveEntry = async (entryData: Omit<KnowledgeEntry, "id" | "moduleId">) => {
    if (!selectedModule) {
      toast({
        title: "Error",
        description: "No module selected",
        variant: "destructive",
      })
      return
    }

    setIsSavingEntry(true)
    try {
      if (editingEntry) {
        // Update existing entry
        await updateKnowledgeEntry({
          ...editingEntry,
          ...entryData,
        })
        toast({
          title: "Success",
          description: "Entry updated successfully",
        })
      } else {
        // Add new entry
        await addKnowledgeEntry({
          ...entryData,
          moduleId: selectedModule,
        })
        toast({
          title: "Success",
          description: "Entry added successfully",
        })
      }

      // Refresh entries
      await loadEntries(selectedModule)
      setIsEditingEntry(false)
    } catch (error) {
      console.error("Failed to save entry:", error)
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntry(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteKnowledgeEntry(entryId)
      loadEntries(selectedModule)
      setShowDeleteConfirm(null)

      toast({
        title: "Success",
        description: "Knowledge entry deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry",
        variant: "destructive",
      })
    }
  }

  const handleAddModule = async () => {
    setEditingModule(undefined)
    setIsEditingModule(true)
  }

  const handleEditModule = (module: KnowledgeModule) => {
    setEditingModule(module)
    setIsEditingModule(true)
  }

  const handleSaveModule = async (moduleData: Omit<KnowledgeModule, "id">) => {
    setIsSavingModule(true)
    try {
      if (editingModule) {
        // Update existing module (not implemented yet)
        toast({
          title: "Not Implemented",
          description: "Module editing is not fully implemented yet",
          variant: "destructive",
        })
      } else {
        // Add new module
        const moduleId = await addKnowledgeModule(moduleData)
        setSelectedModule(moduleId)
        toast({
          title: "Success",
          description: "Module added successfully",
        })
      }

      // Refresh modules
      await loadModules()
      setIsEditingModule(false)
    } catch (error) {
      console.error("Failed to save module:", error)
      toast({
        title: "Error",
        description: "Failed to save module",
        variant: "destructive",
      })
    } finally {
      setIsSavingModule(false)
    }
  }

  const handleExportDatabase = async () => {
    setIsExporting(true)
    try {
      const data = await exportDatabase()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "fallout4-modding-knowledge-base.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Knowledge base exported successfully",
      })
    } catch (error) {
      console.error("Failed to export database:", error)
      toast({
        title: "Error",
        description: "Failed to export knowledge base",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportModule = async (moduleId: string) => {
    setIsExportingModule(true)
    try {
      const data = await exportModule(moduleId)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fallout4-module-${moduleId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Module exported successfully",
      })
    } catch (error) {
      console.error("Failed to export module:", error)
      toast({
        title: "Error",
        description: "Failed to export module",
        variant: "destructive",
      })
    } finally {
      setIsExportingModule(false)
    }
  }

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const data = JSON.parse(event.target.result as string)
            await importDatabase(data)
            await loadModules()
            await loadCategories()

            toast({
              title: "Success",
              description: "Knowledge base imported successfully",
            })
          } catch (parseError) {
            console.error("Failed to parse import file:", parseError)
            toast({
              title: "Error",
              description: "Invalid import file format",
              variant: "destructive",
            })
          }
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("Failed to import database:", error)
      toast({
        title: "Error",
        description: "Failed to import knowledge base",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportModule = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImportingModule(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const data = JSON.parse(event.target.result as string)
            await importModule(data)
            await loadModules()

            toast({
              title: "Success",
              description: "Module imported successfully",
            })
          } catch (parseError) {
            console.error("Failed to parse import file:", parseError)
            toast({
              title: "Error",
              description: "Invalid module file format",
              variant: "destructive",
            })
          }
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("Failed to import module:", error)
      toast({
        title: "Error",
        description: "Failed to import module",
        variant: "destructive",
      })
    } finally {
      setIsImportingModule(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSelect = (query: string) => {
    setSearchQuery(query)
  }

  const filteredEntries = searchQuery
    ? entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : entries

  const selectedModuleData = modules.find((m) => m.id === selectedModule)
  const selectedModuleCategory = selectedModuleData?.categoryId
    ? categories.find((c) => c.id === selectedModuleData.categoryId)
    : undefined

  const getModuleCategory = useCallback(
    (moduleId: string) => {
      const module = modules.find((m) => m.id === moduleId)
      if (!module?.categoryId) return undefined
      return categories.find((c) => c.id === module.categoryId)
    },
    [modules, categories],
  )

  const getEntryCount = useCallback(async (moduleId: string) => {
    try {
      const moduleEntries = await getEntriesByModule(moduleId)
      return moduleEntries.length
    } catch (error) {
      console.error(`Failed to get entry count for module ${moduleId}:`, error)
      return 0
    }
  }, [])

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1aff80]/30 bg-black/70">
        <div className="p-4">
          <h2 className="text-[#1aff80] font-mono text-lg mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            KNOWLEDGE MODULES
          </h2>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1aff80]/50" />
              <Input
                id="knowledge-search"
                placeholder="Search modules..."
                className="fallout-input pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {showRecentSearches && <RecentSearches onSelect={handleSearchSelect} limit={5} />}
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-[#1aff80]/70" />
              <span className="text-[#1aff80]/70 text-sm">Categories</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="fallout-input">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#1aff80]/30">
                <SelectItem value="all" className="focus:bg-[#1aff80]/20 focus:text-[#1aff80]">
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="focus:bg-[#1aff80]/20 focus:text-[#1aff80]"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[calc(100vh-320px)] pr-4 fallout-scrollbar">
            <AnimatePresence>
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start mb-1 text-left ${
                      selectedModule === module.id
                        ? "bg-[#1aff80]/20 text-[#1aff80] border-l-4 border-[#1aff80]"
                        : "text-gray-400 hover:bg-[#1aff80]/10 hover:text-[#1aff80]/70"
                    }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="truncate">{module.name}</span>
                      <div className="flex items-center space-x-2">
                        {module.version && <span className="text-xs text-[#1aff80]/50">v{module.version}</span>}
                        {module.categoryId && (
                          <CategoryBadge
                            name={getModuleCategory(module.id)?.name || ""}
                            color={getModuleCategory(module.id)?.color || "#1aff80"}
                            className="text-xs py-0 px-1 h-4"
                          />
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>

          <div className="mt-4 pt-4 border-t border-[#1aff80]/30 space-y-2">
            <Button
              variant="outline"
              className="w-full border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
              onClick={handleAddModule}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Add New Module
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
                onClick={() => document.getElementById("import-module-input")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Module
              </Button>
              <Input
                id="import-module-input"
                type="file"
                accept=".json"
                onChange={handleImportModule}
                className="hidden"
              />

              <KeyboardShortcuts shortcuts={shortcuts} enabled={keyboardShortcutsEnabled} />

              <Button
                variant="outline"
                size="icon"
                className="border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                title={viewMode === "list" ? "Switch to Grid View" : "Switch to List View"}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-black/50">
        <Tabs defaultValue="browse" className="flex-1 flex flex-col">
          <div className="bg-black/70 border-b border-[#1aff80]/30">
            <div className="px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h2 className="text-[#1aff80] font-mono text-lg">
                      {selectedModuleData?.name || "Select a Module"}
                    </h2>
                    {selectedModuleData && (
                      <div className="flex items-center space-x-2">
                        <p className="text-[#1aff80]/70 text-sm">{selectedModuleData.description}</p>
                        {selectedModuleCategory && (
                          <CategoryBadge
                            name={selectedModuleCategory.name}
                            color={selectedModuleCategory.color}
                            className="ml-2"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <TabsList className="mt-3 md:mt-0 bg-black/50 border border-[#1aff80]/30">
                  <TabsTrigger value="browse" className="fallout-tab data-[state=active]:text-[#1aff80]">
                    Browse
                  </TabsTrigger>
                  <TabsTrigger value="modules" className="fallout-tab data-[state=active]:text-[#1aff80]">
                    Modules
                  </TabsTrigger>
                  <TabsTrigger value="manage" className="fallout-tab data-[state=active]:text-[#1aff80]">
                    Import/Export
                  </TabsTrigger>
                  <TabsTrigger value="extend" className="fallout-tab data-[state=active]:text-[#1aff80]">
                    Extend
                  </TabsTrigger>
                  <TabsTrigger value="tutorial" className="fallout-tab data-[state=active]:text-[#1aff80]">
                    Tutorial
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          <TabsContent value="browse" className="flex-1 p-0 m-0">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1aff80]/50" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="fallout-input pl-8"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="fallout-button" onClick={handleAddEntry} disabled={!selectedModule}>
                    <Plus className="mr-2 h-4 w-4" /> Add Entry
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-[40vh]">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#1aff80] mx-auto mb-4" />
                    <p className="text-[#1aff80]/70">Loading knowledge entries...</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)] fallout-scrollbar">
                  <AnimatePresence>
                    {filteredEntries.length > 0 ? (
                      <div className="space-y-4">
                        {filteredEntries.map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="fallout-card knowledge-card border-[#1aff80]/30 overflow-hidden">
                              <CardContent className="p-0">
                                <Accordion type="single" collapsible>
                                  <AccordionItem value={entry.id} className="border-0">
                                    <AccordionTrigger className="px-4 py-3 hover:bg-[#1aff80]/10 hover:no-underline">
                                      <div className="flex flex-1 items-center justify-between pr-4">
                                        <h3 className="font-bold text-[#1aff80] text-left">
                                          {searchQuery ? (
                                            <HighlightedText text={entry.title} query={searchQuery} />
                                          ) : (
                                            entry.title
                                          )}
                                        </h3>
                                        <div className="flex space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleEditEntry(entry)
                                            }}
                                            className="h-8 w-8 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setShowDeleteConfirm(entry.id)
                                                }}
                                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-black/90 border-red-500/50">
                                              <DialogHeader>
                                                <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
                                                <DialogDescription>
                                                  Are you sure you want to delete "{entry.title}"? This action cannot be
                                                  undone.
                                                </DialogDescription>
                                              </DialogHeader>
                                              <DialogFooter className="mt-4">
                                                <Button
                                                  variant="outline"
                                                  onClick={() => setShowDeleteConfirm(null)}
                                                  className="border-[#1aff80]/50 text-[#1aff80]"
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  onClick={() => handleDeleteEntry(entry.id)}
                                                  className="bg-red-500 hover:bg-red-600"
                                                >
                                                  Delete
                                                </Button>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-black/30 border-t border-[#1aff80]/20">
                                      <div className="p-4">
                                        <p className="text-gray-300 mb-3">
                                          {searchQuery ? (
                                            <HighlightedText text={entry.content} query={searchQuery} />
                                          ) : (
                                            entry.content
                                          )}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                          {entry.keywords.map((keyword, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="outline"
                                              className={`bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30 ${
                                                searchQuery && keyword.toLowerCase().includes(searchQuery.toLowerCase())
                                                  ? "bg-[#1aff80]/30 border-[#1aff80]/50"
                                                  : ""
                                              }`}
                                              onClick={() => setSearchQuery(keyword)}
                                            >
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                        {entry.updatedAt && (
                                          <p className="text-[#1aff80]/50 text-xs mt-4">
                                            Last updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 border-2 border-dashed border-[#1aff80]/30 rounded-lg bg-black/30">
                        <Database className="h-12 w-12 text-[#1aff80]/30 mx-auto mb-4" />
                        <h3 className="text-[#1aff80] font-mono text-lg mb-2">No Entries Found</h3>
                        <p className="text-[#1aff80]/70">
                          {searchQuery
                            ? "No entries match your search query"
                            : "This module doesn't have any entries yet"}
                        </p>
                        <Button className="mt-4 fallout-button" onClick={handleAddEntry} disabled={!selectedModule}>
                          <Plus className="mr-2 h-4 w-4" /> Add New Entry
                        </Button>
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="flex-1 p-0 m-0">
            <div className="p-4 h-full">
              <div className="mb-4 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1aff80]/50" />
                  <Input
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="fallout-input pl-8"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="fallout-button" onClick={handleAddModule}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-220px)] fallout-scrollbar pr-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[40vh]">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-[#1aff80] mx-auto mb-4" />
                      <p className="text-[#1aff80]/70">Loading modules...</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"
                    }
                  >
                    <AnimatePresence>
                      {modules
                        .filter(
                          (module) =>
                            !searchQuery ||
                            module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            module.description.toLowerCase().includes(searchQuery.toLowerCase()),
                        )
                        .map((module) => (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ModuleCard
                              module={module}
                              category={getModuleCategory(module.id)}
                              entryCount={entries.length}
                              onSelect={() => setSelectedModule(module.id)}
                              onEdit={() => handleEditModule(module)}
                              onExport={() => handleExportModule(module.id)}
                              selected={selectedModule === module.id}
                            />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="flex-1 p-0 m-0">
            <div className="p-4 h-full">
              <ScrollArea className="h-[calc(100vh-220px)] fallout-scrollbar pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="fallout-card border-[#1aff80]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
                          <Download className="h-6 w-6 text-[#1aff80]" />
                        </div>
                        <div>
                          <h3 className="text-[#1aff80] font-mono text-lg">Export Knowledge Base</h3>
                          <p className="text-[#1aff80]/70 text-sm">Save your knowledge base for backup or sharing</p>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6">
                        Export your entire knowledge base as a JSON file. You can use this file to restore your data or
                        share it with others.
                      </p>

                      <Button onClick={handleExportDatabase} className="fallout-button w-full" disabled={isExporting}>
                        {isExporting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" /> Export Knowledge Base
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="fallout-card border-[#1aff80]/30">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-[#1aff80]" />
                        </div>
                        <div>
                          <h3 className="text-[#1aff80] font-mono text-lg">Import Knowledge Base</h3>
                          <p className="text-[#1aff80]/70 text-sm">Load knowledge base from a file</p>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6">
                        Import a knowledge base from a JSON file. This will merge with your existing database without
                        overwriting existing entries.
                      </p>

                      <div className="flex items-center justify-center">
                        <Label
                          htmlFor="import-file"
                          className={`flex items-center justify-center w-full py-2 px-4 fallout-button cursor-pointer ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" /> Import Knowledge Base
                            </>
                          )}
                        </Label>
                        <Input
                          id="import-file"
                          type="file"
                          accept=".json"
                          onChange={handleImportDatabase}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="fallout-card border-[#1aff80]/30 mt-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
                        <Download className="h-5 w-5 text-[#1aff80]" />
                      </div>
                      <div>
                        <h3 className="text-[#1aff80] font-mono text-lg">Export/Import Individual Modules</h3>
                        <p className="text-[#1aff80]/70 text-sm">Share specific modules with others</p>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">
                      You can export individual modules to share with others or import modules created by the community.
                      This is useful for building a collection of specialized knowledge modules.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleExportModule(selectedModule)}
                        className="fallout-button"
                        disabled={!selectedModule || isExportingModule}
                      >
                        {isExportingModule ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" /> Export Selected Module
                          </>
                        )}
                      </Button>

                      <div>
                        <Label
                          htmlFor="import-module-input-2"
                          className={`flex items-center justify-center w-full py-2 px-4 fallout-button cursor-pointer ${isImportingModule ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isImportingModule ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" /> Import Module
                            </>
                          )}
                        </Label>
                        <Input
                          id="import-module-input-2"
                          type="file"
                          accept=".json"
                          onChange={handleImportModule}
                          className="hidden"
                          disabled={isImportingModule}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30 mt-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-amber-500 font-mono text-lg">Database Management</h3>
                        <p className="text-amber-500/70 text-sm">Important information about your knowledge base</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-gray-300">
                      <p>Your knowledge base is stored entirely in your browser's IndexedDB storage. This means:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>All data remains on your device and is never sent to any server</li>
                        <li>Clearing your browser data will delete your knowledge base</li>
                        <li>Different browsers or devices will have separate knowledge bases</li>
                      </ul>
                      <p className="font-bold text-[#1aff80]">Regular exports are recommended to prevent data loss!</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="extend" className="flex-1 p-0 m-0">
            <div className="p-4 h-full">
              <ScrollArea className="h-[calc(100vh-220px)] fallout-scrollbar pr-4">
                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
                        <Code className="h-6 w-6 text-[#1aff80]" />
                      </div>
                      <div>
                        <h3 className="text-[#1aff80] font-mono text-lg">Extend Knowledge Base</h3>
                        <p className="text-[#1aff80]/70 text-sm">Add custom modules via TypeScript files</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-gray-300">
                      <p>
                        You can extend the knowledge base by adding TypeScript files to the <code>/modules</code>{" "}
                        folder. Each file should export a default module definition that follows this structure:
                      </p>

                      <div className="bg-black/50 p-4 rounded-md border border-[#1aff80]/30 overflow-x-auto">
                        <pre className="text-sm text-gray-300">
                          <code>{`import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

const moduleId = "your-module-id"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Your Module Name",
  description: "Description of your module",
  version: "1.0.0",
  author: "Your Name",
  categoryId: "general", // Optional: Category ID
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Entry Title",
      content: "Entry content with detailed information...",
      keywords: ["keyword1", "keyword2", "keyword3"],
    },
    // Add more entries as needed
  ],
}

export default module`}</code>
                        </pre>
                      </div>

                      <div className="flex items-center space-x-2 text-amber-500">
                        <Info className="h-5 w-5" />
                        <p>Modules are automatically loaded when the application starts.</p>
                      </div>

                      <h4 className="text-[#1aff80] font-mono text-md mt-6">Module Structure</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong className="text-[#1aff80]">id</strong>: A unique identifier for the module (use a
                          fixed string)
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">name</strong>: The display name of the module
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">description</strong>: A brief description of the module's
                          content
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">version</strong>: The module version (semver format)
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">author</strong>: (Optional) The module creator's name
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">categoryId</strong>: (Optional) The category ID for this
                          module
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">entries</strong>: An array of knowledge entries
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">dependencies</strong>: (Optional) IDs of modules this
                          module depends on
                        </li>
                      </ul>

                      <h4 className="text-[#1aff80] font-mono text-md mt-6">Entry Structure</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong className="text-[#1aff80]">id</strong>: A unique identifier for the entry (generated
                          with nanoid)
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">moduleId</strong>: The ID of the parent module
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">title</strong>: The title of the knowledge entry
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">content</strong>: The main content of the entry
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">keywords</strong>: An array of keywords for search
                          functionality
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
                        <Info className="h-5 w-5 text-[#1aff80]" />
                      </div>
                      <div>
                        <h3 className="text-[#1aff80] font-mono text-lg">Best Practices</h3>
                        <p className="text-[#1aff80]/70 text-sm">Tips for creating effective knowledge modules</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-gray-300">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Group related information into a single module</li>
                        <li>Use clear, descriptive titles for entries</li>
                        <li>Keep entry content concise and focused</li>
                        <li>Include relevant keywords to improve search results</li>
                        <li>Use numbered lists for step-by-step instructions</li>
                        <li>Organize entries in a logical order within each module</li>
                        <li>Test your modules by searching for keywords to ensure they're discoverable</li>
                        <li>Use fixed module IDs for stability across application updates</li>
                        <li>Version your modules to track changes</li>
                        <li>Assign appropriate categories to help users find your modules</li>
                      </ul>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="fallout-button w-full"
                        onClick={() => document.getElementById("tutorial-tab-trigger")?.click()}
                      >
                        <BookOpen className="h-4 w-4 mr-2" /> View Detailed Tutorial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="tutorial" id="tutorial-tab-trigger" className="flex-1 p-0 m-0 h-full">
            <ModuleTutorial />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        entry={editingEntry}
        isOpen={isEditingEntry}
        onClose={() => setIsEditingEntry(false)}
        onSave={handleSaveEntry}
        isLoading={isSavingEntry}
      />

      {/* Edit Module Dialog */}
      <EditModuleDialog
        module={editingModule}
        categories={categories}
        isOpen={isEditingModule}
        onClose={() => setIsEditingModule(false)}
        onSave={handleSaveModule}
        isLoading={isSavingModule}
      />
    </div>
  )
}
