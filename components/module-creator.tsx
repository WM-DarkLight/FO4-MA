"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  getAllModules,
  getAllCategories,
  addKnowledgeModule,
  addKnowledgeEntry,
  getEntriesByModule,
} from "@/lib/database"
import type { KnowledgeModule, KnowledgeEntry, ModuleCategory } from "@/lib/types"
import {
  FolderPlus,
  FilePlus,
  Loader2,
  BookOpen,
  FileText,
  PlusCircle,
  Lightbulb,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { EditModuleDialog } from "@/components/edit-module-dialog"
import { EditEntryDialog } from "@/components/edit-entry-dialog"
import { ModuleCard } from "@/components/module-card"
import { CategoryBadge } from "@/components/category-badge"
import { motion, AnimatePresence } from "framer-motion"

export default function ModuleCreator() {
  const [modules, setModules] = useState<KnowledgeModule[]>([])
  const [categories, setCategories] = useState<ModuleCategory[]>([])
  const [selectedModule, setSelectedModule] = useState<KnowledgeModule | null>(null)
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingModule, setIsCreatingModule] = useState(false)
  const [isCreatingEntry, setIsCreatingEntry] = useState(false)
  const [isSavingModule, setIsSavingModule] = useState(false)
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [activeTab, setActiveTab] = useState("modules")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedModule) {
      loadEntries(selectedModule.id)
    }
  }, [selectedModule])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [moduleList, categoryList] = await Promise.all([getAllModules(), getAllCategories()])
      setModules(moduleList)
      setCategories(categoryList)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load modules and categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadEntries = async (moduleId: string) => {
    try {
      const entriesList = await getEntriesByModule(moduleId)
      setEntries(entriesList)
    } catch (error) {
      console.error("Failed to load entries:", error)
      toast({
        title: "Error",
        description: "Failed to load entries for this module",
        variant: "destructive",
      })
    }
  }

  const handleCreateModule = () => {
    setIsCreatingModule(true)
  }

  const handleCreateEntry = () => {
    if (!selectedModule) {
      toast({
        title: "No Module Selected",
        description: "Please select a module first to add an entry",
        variant: "destructive",
      })
      return
    }
    setIsCreatingEntry(true)
  }

  const handleSaveModule = async (moduleData: Omit<KnowledgeModule, "id">) => {
    setIsSavingModule(true)
    try {
      const moduleId = await addKnowledgeModule(moduleData)

      // Reload modules
      const updatedModules = await getAllModules()
      setModules(updatedModules)

      // Find and select the newly created module
      const newModule = updatedModules.find((m) => m.id === moduleId) || null
      setSelectedModule(newModule)

      // Show success message
      setSuccessMessage("Module created successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)

      // Switch to entries tab
      setActiveTab("entries")

      toast({
        title: "Success",
        description: "Module created successfully",
      })
    } catch (error) {
      console.error("Failed to save module:", error)
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      })
    } finally {
      setIsSavingModule(false)
      setIsCreatingModule(false)
    }
  }

  const handleSaveEntry = async (entryData: Omit<KnowledgeEntry, "id" | "moduleId">) => {
    if (!selectedModule) return

    setIsSavingEntry(true)
    try {
      await addKnowledgeEntry({
        ...entryData,
        moduleId: selectedModule.id,
      })

      // Reload entries
      await loadEntries(selectedModule.id)

      // Show success message
      setSuccessMessage("Entry added successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)

      toast({
        title: "Success",
        description: "Entry added successfully",
      })
    } catch (error) {
      console.error("Failed to save entry:", error)
      toast({
        title: "Error",
        description: "Failed to add entry",
        variant: "destructive",
      })
    } finally {
      setIsSavingEntry(false)
      setIsCreatingEntry(false)
    }
  }

  const getModuleCategory = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId)
    if (!module?.categoryId) return undefined
    return categories.find((c) => c.id === module.categoryId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1aff80] mx-auto mb-4" />
          <p className="text-[#1aff80]/70">Loading module creator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black/50 flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-[#1aff80]" />
          </div>
          <div>
            <h2 className="text-[#1aff80] font-mono text-xl">MODULE CREATOR</h2>
            <p className="text-[#1aff80]/70">Create and manage your knowledge modules</p>
          </div>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-[#1aff80]/10 border border-[#1aff80]/30 rounded-md flex items-center"
          >
            <CheckCircle2 className="h-5 w-5 text-[#1aff80] mr-2" />
            <p className="text-[#1aff80]">{successMessage}</p>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-black/50 border border-[#1aff80]/30 mb-6">
            <TabsTrigger value="modules" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Modules
            </TabsTrigger>
            <TabsTrigger value="entries" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Entries
            </TabsTrigger>
            <TabsTrigger value="guide" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Guide
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="modules" className="mt-0 h-full">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[#1aff80] font-mono text-lg flex items-center">
                    <Layers className="h-5 w-5 mr-2" />
                    Your Knowledge Modules
                  </h3>
                  <Button className="fallout-button" onClick={handleCreateModule}>
                    <FolderPlus className="h-4 w-4 mr-2" /> Create New Module
                  </Button>
                </div>

                <ScrollArea className="flex-1 pr-4 fallout-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {modules.map((module) => (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ModuleCard
                            module={module}
                            category={getModuleCategory(module.id)}
                            entryCount={module.id === selectedModule?.id ? entries.length : 0}
                            onSelect={() => {
                              setSelectedModule(module)
                              setActiveTab("entries")
                            }}
                            selected={selectedModule?.id === module.id}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card
                        className="fallout-card border-dashed border-[#1aff80]/30 h-full flex flex-col justify-center items-center cursor-pointer hover:bg-[#1aff80]/5 transition-colors"
                        onClick={handleCreateModule}
                      >
                        <CardContent className="p-6 text-center">
                          <PlusCircle className="h-12 w-12 text-[#1aff80]/30 mx-auto mb-4" />
                          <h3 className="text-[#1aff80] font-mono text-lg mb-2">Create New Module</h3>
                          <p className="text-[#1aff80]/70 text-sm">
                            Add a new knowledge module to organize your entries
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {modules.length === 0 && (
                    <div className="text-center p-8 mt-8 border-2 border-dashed border-[#1aff80]/30 rounded-lg bg-black/30">
                      <Lightbulb className="h-12 w-12 text-[#1aff80]/30 mx-auto mb-4" />
                      <h3 className="text-[#1aff80] font-mono text-lg mb-2">No Modules Yet</h3>
                      <p className="text-[#1aff80]/70 mb-4">
                        Create your first knowledge module to start organizing information
                      </p>
                      <Button className="fallout-button" onClick={handleCreateModule}>
                        <FolderPlus className="h-4 w-4 mr-2" /> Create First Module
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="entries" className="mt-0 h-full">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-[#1aff80] font-mono text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {selectedModule ? `Entries for "${selectedModule.name}"` : "Select a Module"}
                    </h3>
                    {selectedModule && (
                      <div className="flex items-center mt-1">
                        <p className="text-[#1aff80]/70 text-sm mr-2">{selectedModule.description}</p>
                        {selectedModule.categoryId && (
                          <CategoryBadge
                            name={getModuleCategory(selectedModule.id)?.name || ""}
                            color={getModuleCategory(selectedModule.id)?.color || "#1aff80"}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <Button className="fallout-button" onClick={handleCreateEntry} disabled={!selectedModule}>
                    <FilePlus className="h-4 w-4 mr-2" /> Add New Entry
                  </Button>
                </div>

                <ScrollArea className="flex-1 pr-4 fallout-scrollbar">
                  {!selectedModule ? (
                    <div className="text-center p-8 border-2 border-dashed border-[#1aff80]/30 rounded-lg bg-black/30">
                      <BookOpen className="h-12 w-12 text-[#1aff80]/30 mx-auto mb-4" />
                      <h3 className="text-[#1aff80] font-mono text-lg mb-2">No Module Selected</h3>
                      <p className="text-[#1aff80]/70 mb-4">
                        Select a module from the Modules tab to view or add entries
                      </p>
                      <Button className="fallout-button" onClick={() => setActiveTab("modules")}>
                        Go to Modules
                      </Button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-[#1aff80]/30 rounded-lg bg-black/30">
                      <FileText className="h-12 w-12 text-[#1aff80]/30 mx-auto mb-4" />
                      <h3 className="text-[#1aff80] font-mono text-lg mb-2">No Entries Yet</h3>
                      <p className="text-[#1aff80]/70 mb-4">
                        This module doesn't have any entries yet. Add your first knowledge entry.
                      </p>
                      <Button className="fallout-button" onClick={handleCreateEntry}>
                        <FilePlus className="h-4 w-4 mr-2" /> Add First Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {entries.map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="fallout-card border-[#1aff80]/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-[#1aff80]">{entry.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="pb-4">
                                <p className="text-gray-300 whitespace-pre-line">{entry.content}</p>

                                {entry.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {entry.keywords.map((keyword, idx) => (
                                      <CategoryBadge key={idx} name={keyword} color="#1aff80" className="text-xs" />
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Card
                          className="fallout-card border-dashed border-[#1aff80]/30 flex flex-col justify-center items-center cursor-pointer hover:bg-[#1aff80]/5 transition-colors"
                          onClick={handleCreateEntry}
                        >
                          <CardContent className="p-6 text-center">
                            <PlusCircle className="h-8 w-8 text-[#1aff80]/30 mx-auto mb-3" />
                            <h3 className="text-[#1aff80] font-mono text-md mb-1">Add Another Entry</h3>
                            <p className="text-[#1aff80]/70 text-sm">Continue building your knowledge base</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="guide" className="mt-0 h-full">
              <ScrollArea className="pr-4 h-[calc(100vh-220px)] fallout-scrollbar">
                <div className="space-y-6">
                  <Card className="fallout-card border-[#1aff80]/30">
                    <CardHeader>
                      <CardTitle className="text-[#1aff80] flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Getting Started with the Module Creator
                      </CardTitle>
                      <CardDescription>A step-by-step guide to creating your own knowledge modules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Step 1: Create a Module</h3>
                        <p className="text-gray-300">
                          Start by creating a module to organize your knowledge entries. Think of modules as folders or
                          categories that group related information together.
                        </p>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          <li>Go to the "Modules" tab and click "Create New Module"</li>
                          <li>Give your module a clear, descriptive name</li>
                          <li>Write a brief description of what information this module will contain</li>
                          <li>Select an appropriate category to help users find related information</li>
                          <li>Add your name as the author (optional)</li>
                          <li>Set the version number (default is 1.0.0)</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Step 2: Add Knowledge Entries</h3>
                        <p className="text-gray-300">
                          Once you've created a module, you can add knowledge entries to it. Each entry should focus on
                          a specific topic, question, or procedure.
                        </p>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          <li>Select your module and go to the "Entries" tab</li>
                          <li>Click "Add New Entry" to create a new knowledge entry</li>
                          <li>Give your entry a clear, searchable title</li>
                          <li>Write detailed content that addresses the topic</li>
                          <li>Add relevant keywords to make the entry discoverable</li>
                          <li>Use the formatting tools to organize your content</li>
                          <li>Preview your entry to see how it will appear to users</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Step 3: Organize Your Knowledge Base</h3>
                        <p className="text-gray-300">
                          As you add more modules and entries, consider how to organize them effectively:
                        </p>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          <li>Group related information into a single module</li>
                          <li>Use clear, descriptive titles for both modules and entries</li>
                          <li>Add comprehensive keywords to improve searchability</li>
                          <li>Use numbered lists for step-by-step instructions</li>
                          <li>Keep entries focused on a single topic or question</li>
                          <li>Update existing entries as new information becomes available</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="fallout-card border-[#1aff80]/30">
                    <CardHeader>
                      <CardTitle className="text-[#1aff80] flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Tips for Creating Effective Knowledge Entries
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Writing Clear Content</h3>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          <li>Use simple, direct language that's easy to understand</li>
                          <li>Break down complex procedures into numbered steps</li>
                          <li>Include all necessary information without being overly verbose</li>
                          <li>Use formatting (bold, italic, lists) to improve readability</li>
                          <li>Start with the most important information first</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Choosing Effective Keywords</h3>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          <li>Include terms users might search for</li>
                          <li>Add common variations and abbreviations</li>
                          <li>Consider both technical terms and everyday language</li>
                          <li>Include mod names, tools, and specific features</li>
                          <li>Add problem-related terms for troubleshooting entries</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-[#1aff80] font-medium">Example Entry Structure</h3>
                        <div className="bg-black/30 p-4 rounded-md border border-[#1aff80]/20">
                          <p className="text-[#1aff80] font-medium mb-1">Title: Installing ENB for Fallout 4</p>
                          <p className="text-gray-300 whitespace-pre-line mb-3">
                            To install an ENB for Fallout 4: 1. Download the ENB Series binaries from enbdev.com 2.
                            Extract d3d11.dll and d3dcompiler_46e.dll to your Fallout 4 directory 3. Download your
                            preferred ENB preset 4. Extract the preset files to the same directory 5. Launch the game
                            and press Shift+Enter to access the ENB configuration For best performance, make sure your
                            GPU has at least 4GB of VRAM and adjust the settings in the ENB menu if you experience low
                            framerates.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <CategoryBadge name="enb" color="#1aff80" className="text-xs" />
                            <CategoryBadge name="graphics" color="#1aff80" className="text-xs" />
                            <CategoryBadge name="installation" color="#1aff80" className="text-xs" />
                            <CategoryBadge name="visual" color="#1aff80" className="text-xs" />
                            <CategoryBadge name="performance" color="#1aff80" className="text-xs" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EditModuleDialog
        categories={categories}
        isOpen={isCreatingModule}
        onClose={() => setIsCreatingModule(false)}
        onSave={handleSaveModule}
        isLoading={isSavingModule}
      />

      <EditEntryDialog
        isOpen={isCreatingEntry}
        onClose={() => setIsCreatingEntry(false)}
        onSave={handleSaveEntry}
        isLoading={isSavingEntry}
      />
    </div>
  )
}
