"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Copy, CheckCircle2, FileCode, BookOpen, Code, Lightbulb, AlertTriangle, HelpCircle } from "lucide-react"

export default function ModuleTutorial() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-black/50 p-4 rounded-md border border-[#1aff80]/30 overflow-x-auto text-sm text-gray-300 my-4">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
        onClick={() => copyToClipboard(code, id)}
      >
        {copied === id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )

  return (
    <div className="h-full bg-black/50 flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-[#1aff80]" />
          </div>
          <div>
            <h2 className="text-[#1aff80] font-mono text-xl">MODULE SYSTEM TUTORIAL</h2>
            <p className="text-[#1aff80]/70">Learn how to extend the knowledge base with custom modules</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-black/50 border border-[#1aff80]/30 mb-6">
            <TabsTrigger value="overview" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Step-by-Step
            </TabsTrigger>
            <TabsTrigger value="examples" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Examples
            </TabsTrigger>
            <TabsTrigger value="advanced" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Advanced
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-220px)] fallout-scrollbar pr-4">
              <TabsContent value="overview" className="mt-0">
                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Module System Architecture</h3>
                    <p className="text-gray-300 mb-4">
                      The Fallout 4 Modding Assistant uses a modular knowledge base system that allows you to extend its
                      capabilities by adding custom knowledge modules. Each module contains a collection of knowledge
                      entries related to a specific aspect of Fallout 4 modding.
                    </p>

                    <div className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30 mb-6">
                      <h4 className="text-[#1aff80] font-mono text-md mb-2">Key Components:</h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-300">
                        <li>
                          <strong className="text-[#1aff80]">Module Registry</strong> - Central system that manages all
                          knowledge modules
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">Module Definition</strong> - TypeScript interface that
                          defines the structure of a module
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">Knowledge Entries</strong> - Individual pieces of
                          information within a module
                        </li>
                        <li>
                          <strong className="text-[#1aff80]">Search System</strong> - Finds relevant entries based on
                          user queries
                        </li>
                      </ul>
                    </div>

                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Module Structure</h3>
                    <p className="text-gray-300 mb-4">
                      Each module is defined as a TypeScript file that exports a <code>ModuleDefinition</code> object
                      with the following properties:
                    </p>

                    <CodeBlock
                      id="module-structure"
                      code={`interface ModuleDefinition {
  id: string           // Unique identifier for the module
  name: string         // Display name of the module
  description: string  // Brief description of the module's content
  version: string      // Module version (semver format)
  author?: string      // Optional: Module creator's name
  entries: KnowledgeEntry[]  // Array of knowledge entries
  dependencies?: string[]    // Optional: IDs of modules this module depends on
}`}
                    />

                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Knowledge Entry Structure</h3>
                    <p className="text-gray-300 mb-4">
                      Each knowledge entry within a module has the following structure:
                    </p>

                    <CodeBlock
                      id="entry-structure"
                      code={`interface KnowledgeEntry {
  id: string           // Unique identifier for the entry
  moduleId: string     // ID of the parent module
  title: string        // Title of the knowledge entry
  content: string      // Main content of the entry
  keywords: string[]   // Keywords for search functionality
  createdAt?: number   // Optional: Creation timestamp
  updatedAt?: number   // Optional: Last update timestamp
}`}
                    />
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Benefits of the Module System</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30"
                      >
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#1aff80]/20 flex items-center justify-center mr-2">
                            <FileCode className="h-4 w-4 text-[#1aff80]" />
                          </div>
                          <h4 className="text-[#1aff80] font-mono">Extensibility</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Add new knowledge without modifying the core application code
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30"
                      >
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#1aff80]/20 flex items-center justify-center mr-2">
                            <Code className="h-4 w-4 text-[#1aff80]" />
                          </div>
                          <h4 className="text-[#1aff80] font-mono">Organization</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Group related information into logical modules for better management
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30"
                      >
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#1aff80]/20 flex items-center justify-center mr-2">
                            <Lightbulb className="h-4 w-4 text-[#1aff80]" />
                          </div>
                          <h4 className="text-[#1aff80] font-mono">Specialization</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Create modules focused on specific aspects of Fallout 4 modding
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30"
                      >
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-[#1aff80]/20 flex items-center justify-center mr-2">
                            <HelpCircle className="h-4 w-4 text-[#1aff80]" />
                          </div>
                          <h4 className="text-[#1aff80] font-mono">Community</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Share modules with other users to build a comprehensive knowledge base
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutorial" className="mt-0">
                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Creating a New Module: Step-by-Step</h3>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="step1" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 1: Create a new TypeScript file
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-2">
                            Create a new file in the <code>/modules</code> directory with a descriptive name that
                            reflects the module's content.
                          </p>
                          <p className="mb-4">
                            For example: <code>quest-mods.ts</code> for a module about quest mods.
                          </p>
                          <div className="bg-black/30 p-3 rounded-md border border-[#1aff80]/30">
                            <p className="text-[#1aff80]/70 text-sm">
                              <strong>Tip:</strong> Use kebab-case for file names (e.g., <code>quest-mods.ts</code>, not{" "}
                              <code>questMods.ts</code>)
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step2" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 2: Import required types and utilities
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">At the top of your file, import the necessary types and utilities:</p>
                          <CodeBlock
                            id="import-types"
                            code={`import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"`}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step3" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 3: Define a unique module ID
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">
                            Create a constant for your module ID. This should be unique across all modules:
                          </p>
                          <CodeBlock
                            id="module-id"
                            code={`// Use a fixed ID for production stability
const moduleId = "quest-mods-module"`}
                          />
                          <div className="bg-black/30 p-3 rounded-md border border-[#1aff80]/30 mt-4">
                            <p className="text-[#1aff80]/70 text-sm">
                              <strong>Important:</strong> Using a fixed ID ensures stability across application updates.
                              Don't use <code>nanoid()</code> directly for the module ID as it would generate a
                              different ID each time the application loads.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step4" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 4: Create the module definition
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">
                            Define your module using the <code>ModuleDefinition</code> interface:
                          </p>
                          <CodeBlock
                            id="module-definition"
                            code={`const module: ModuleDefinition = {
  id: moduleId,
  name: "Quest Modifications",
  description: "Information about quest mods for Fallout 4",
  version: "1.0.0",
  author: "Your Name",
  entries: [
    // Knowledge entries will go here
  ],
}`}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step5" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 5: Add knowledge entries
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">
                            Add knowledge entries to your module. Each entry should have a unique ID, title, content,
                            and relevant keywords:
                          </p>
                          <CodeBlock
                            id="knowledge-entries"
                            code={`entries: [
  {
    id: nanoid(),
    moduleId: moduleId,
    title: "Popular Quest Mods",
    content: 
      "Some of the most popular quest mods for Fallout 4 include: " +
      "1. The Machine and Her - A quest about a unique synth companion. " +
      "2. Fusion City Rising - A massive quest mod with a new city. " +
      "3. America Rising - Join the Enclave in the Commonwealth. " +
      "4. Atomic Radio and Tales from the Commonwealth - New quests and a radio station. " +
      "5. Depravity - An evil-character quest line with multiple endings.",
    keywords: ["quest", "mods", "popular", "recommended", "story", "missions"],
  },
  {
    id: nanoid(),
    moduleId: moduleId,
    title: "Installing Quest Mods",
    content:
      "When installing quest mods, follow these guidelines: " +
      "1. Always read the mod description for specific installation instructions. " +
      "2. Many quest mods require all DLCs or specific DLCs to function. " +
      "3. Quest mods often have compatibility patches for other popular mods. " +
      "4. Some quest mods should be installed on a new game for best results. " +
      "5. Always check for required dependencies like F4SE or other framework mods.",
    keywords: ["quest", "installation", "compatibility", "requirements", "dependencies"],
  },
  // Add more entries as needed
]`}
                          />
                          <div className="bg-black/30 p-3 rounded-md border border-[#1aff80]/30 mt-4">
                            <p className="text-[#1aff80]/70 text-sm">
                              <strong>Tip:</strong> Use <code>nanoid()</code> to generate unique IDs for each entry. The{" "}
                              <code>moduleId</code> should match the constant defined earlier.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step6" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 6: Export the module
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">Export your module as the default export:</p>
                          <CodeBlock id="export-module" code={`export default module`} />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="step7" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Step 7: Register your module
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">
                            Open <code>app/page.tsx</code> and add your module to the imports and registration:
                          </p>
                          <CodeBlock
                            id="register-module"
                            code={`// Import your module
import questMods from "@/modules/quest-mods"

// In the initialize function, add:
moduleRegistry.registerModule(questMods)`}
                          />
                          <div className="bg-black/30 p-3 rounded-md border border-amber-500/30 mt-4">
                            <p className="text-amber-500/70 text-sm flex items-start">
                              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Important:</strong> After adding a new module, you need to restart the
                                application for the changes to take effect.
                              </span>
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Complete Module Example</h3>
                    <p className="text-gray-300 mb-4">Here's a complete example of a module file:</p>

                    <CodeBlock
                      id="complete-example"
                      code={`/**
 * Quest Modifications Knowledge Module
 *
 * This module contains information about quest mods for Fallout 4,
 * including popular mods, installation tips, and compatibility information.
 */

import type { ModuleDefinition } from "@/lib/types"
import { nanoid } from "@/lib/utils"

// Use a fixed ID for production stability
const moduleId = "quest-mods-module"

const module: ModuleDefinition = {
  id: moduleId,
  name: "Quest Modifications",
  description: "Information about quest mods for Fallout 4",
  version: "1.0.0",
  author: "Your Name",
  entries: [
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Popular Quest Mods",
      content: 
        "Some of the most popular quest mods for Fallout 4 include: " +
        "1. The Machine and Her - A quest about a unique synth companion. " +
        "2. Fusion City Rising - A massive quest mod with a new city. " +
        "3. America Rising - Join the Enclave in the Commonwealth. " +
        "4. Atomic Radio and Tales from the Commonwealth - New quests and a radio station. " +
        "5. Depravity - An evil-character quest line with multiple endings.",
      keywords: ["quest", "mods", "popular", "recommended", "story", "missions"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Installing Quest Mods",
      content:
        "When installing quest mods, follow these guidelines: " +
        "1. Always read the mod description for specific installation instructions. " +
        "2. Many quest mods require all DLCs or specific DLCs to function. " +
        "3. Quest mods often have compatibility patches for other popular mods. " +
        "4. Some quest mods should be installed on a new game for best results. " +
        "5. Always check for required dependencies like F4SE or other framework mods.",
      keywords: ["quest", "installation", "compatibility", "requirements", "dependencies"],
    },
    {
      id: nanoid(),
      moduleId: moduleId,
      title: "Quest Mod Compatibility",
      content:
        "Quest mods can conflict with each other if they: " +
        "1. Modify the same locations in the game world. " +
        "2. Change the same NPCs or factions. " +
        "3. Alter vanilla quests that other mods depend on. " +
        "4. Use the same custom worldspaces or cell names. " +
        "Use FO4Edit to check for conflicts between quest mods and create compatibility patches if needed.",
      keywords: ["quest", "compatibility", "conflicts", "patches", "fo4edit"],
    },
  ],
}

export default module`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples" className="mt-0">
                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Example Module Types</h3>
                    <p className="text-gray-300 mb-4">
                      Here are some examples of different types of modules you could create:
                    </p>

                    <div className="space-y-6">
                      <div className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30">
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Game Mechanic Module</h4>
                        <p className="text-gray-300 mb-3">
                          Focuses on explaining and enhancing specific game mechanics.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">Survival Mode</Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">
                            Crafting System
                          </Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">Perk System</Badge>
                        </div>
                        <CodeBlock
                          id="mechanic-example"
                          code={`// Example entry for a Survival Mode module
{
  id: nanoid(),
  moduleId: moduleId,
  title: "Survival Mode Needs System",
  content:
    "In Survival Mode, you must manage three basic needs: " +
    "1. Hunger - Increases over time, reduces AP and eventually SPECIAL stats. " +
    "2. Thirst - Increases faster than hunger, affects AP and SPECIAL. " +
    "3. Fatigue - Builds up as you stay awake, reduces AP and accuracy. " +
    "Use the Survival Options mod to customize the rate at which these needs increase.",
  keywords: ["survival", "needs", "hunger", "thirst", "fatigue", "management"],
}`}
                        />
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30">
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Mod Tool Module</h4>
                        <p className="text-gray-300 mb-3">
                          Provides information about specific modding tools and utilities.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">FO4Edit</Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">Creation Kit</Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">BodySlide</Badge>
                        </div>
                        <CodeBlock
                          id="tool-example"
                          code={`// Example entry for a FO4Edit module
{
  id: nanoid(),
  moduleId: moduleId,
  title: "Creating Merged Patches in FO4Edit",
  content:
    "To create a merged patch in FO4Edit: " +
    "1. Launch FO4Edit and load all your mods. " +
    "2. Wait for background loading to complete. " +
    "3. Right-click in the left pane and select 'Other > Create Merged Patch'. " +
    "4. Name your patch (usually 'Merged Patch') and click OK. " +
    "5. Wait for the process to complete, then save. " +
    "6. Place the merged patch at the end of your load order.",
  keywords: ["fo4edit", "xedit", "merged", "patch", "conflict", "resolution"],
}`}
                        />
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-[#1aff80]/30">
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Troubleshooting Module</h4>
                        <p className="text-gray-300 mb-3">Helps users diagnose and fix common modding problems.</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">Crashes</Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">Performance</Badge>
                          <Badge className="bg-[#1aff80]/10 text-[#1aff80]/80 border-[#1aff80]/30">
                            Visual Glitches
                          </Badge>
                        </div>
                        <CodeBlock
                          id="troubleshooting-example"
                          code={`// Example entry for a Troubleshooting module
{
  id: nanoid(),
  moduleId: moduleId,
  title: "Diagnosing Crash to Desktop (CTD)",
  content:
    "When experiencing crashes to desktop (CTD), follow these steps: " +
    "1. Check your crash logs in Documents\\\\My Games\\\\Fallout4\\\\F4SE\\\\. " +
    "2. Look for the last plugin mentioned before the crash. " +
    "3. Disable that plugin and test if the issue persists. " +
    "4. If using ENB, try disabling it temporarily. " +
    "5. Verify you have enough free VRAM for your texture mods. " +
    "6. Check for mod conflicts using FO4Edit. " +
    "7. Ensure you're not exceeding the plugin limit.",
  keywords: ["crash", "CTD", "troubleshooting", "diagnosis", "logs", "stability"],
}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Content Formatting Tips</h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Numbered Lists</h4>
                        <p className="text-gray-300 mb-2">Use numbered lists for step-by-step instructions:</p>
                        <CodeBlock
                          id="numbered-list"
                          code={`"content:
  "To install mods with Vortex: " +
  "1. Download and install Vortex from Nexus Mods. " +
  "2. Set up Vortex for Fallout 4. " +
  "3. Download mods using the 'Mod Manager Download' button on Nexus. " +
  "4. Install the mod in Vortex. " +
  "5. Enable the mod. " +
  "6. Deploy your mods to apply changes.",`}
                        />
                      </div>

                      <div>
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Categorized Information</h4>
                        <p className="text-gray-300 mb-2">Group related information with headers:</p>
                        <CodeBlock
                          id="categorized-info"
                          code={`"content:
  "ReShade and ENB are different post-processing tools with distinct advantages: " +
  "1. ReShade: " +
  "   - Lower performance impact than ENB " +
  "   - Easier to install and configure " +
  "   - More shader effects available " +
  "2. ENB: " +
  "   - More advanced effects like subsurface scattering " +
  "   - Better integration with Fallout 4's engine " +
  "   - Higher performance impact ",`}
                        />
                      </div>

                      <div>
                        <h4 className="text-[#1aff80] font-mono text-md mb-2">Effective Keywords</h4>
                        <p className="text-gray-300 mb-2">Include a variety of keywords to improve search results:</p>
                        <CodeBlock
                          id="keywords-example"
                          code={`"keywords: [
  "performance", 
  "optimization", 
  "FPS", 
  "framerate", 
  "stutter", 
  "lag", 
  "boost", 
  "improve", 
  "speed"
],`}
                        />
                        <p className="text-gray-300 mt-2">
                          Include synonyms, abbreviations, and common misspellings to ensure users can find the
                          information.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0">
                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Advanced Module Features</h3>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dependencies" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Module Dependencies
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">
                            You can specify dependencies to ensure modules load in the correct order:
                          </p>
                          <CodeBlock
                            id="dependencies-example"
                            code={`const module: ModuleDefinition = {
  id: moduleId,
  name: "Advanced Settlement Building",
  description: "Advanced techniques for settlement building",
  version: "1.0.0",
  author: "Your Name",
  // This module depends on the basic settlement module
  dependencies: ["settlement-mods-module"],
  entries: [
    // ...entries
  ]
}`}
                          />
                          <p className="mt-4">
                            Dependencies ensure that the required modules are loaded before your module. This is useful
                            when your module builds upon concepts explained in other modules.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="versioning" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Module Versioning
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">Use semantic versioning (MAJOR.MINOR.PATCH) for your modules:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>
                              <strong>MAJOR</strong>: Increment when making incompatible changes (e.g., restructuring
                              entries)
                            </li>
                            <li>
                              <strong>MINOR</strong>: Increment when adding functionality in a backward-compatible
                              manner (e.g., new entries)
                            </li>
                            <li>
                              <strong>PATCH</strong>: Increment when making backward-compatible bug fixes (e.g.,
                              correcting information)
                            </li>
                          </ul>
                          <CodeBlock
                            id="versioning-example"
                            code={`// Initial version
version: "1.0.0"

// After adding new entries
version: "1.1.0"

// After fixing typos or incorrect information
version: "1.1.1"

// After restructuring the module
version: "2.0.0"`}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="timestamps" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Entry Timestamps
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">You can add creation and update timestamps to your entries:</p>
                          <CodeBlock
                            id="timestamps-example"
                            code={`{
  id: nanoid(),
  moduleId: moduleId,
  title: "Entry Title",
  content: "Entry content...",
  keywords: ["keyword1", "keyword2"],
  createdAt: Date.now(),
  updatedAt: Date.now()
}`}
                          />
                          <p className="mt-4">
                            Timestamps are useful for tracking when information was added or last updated. The system
                            will automatically add these if you don't provide them.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="organization" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Module Organization Strategies
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">Consider these strategies for organizing your modules:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>
                              <strong>Topic-based</strong>: Organize by subject matter (weapons, armor, settlements)
                            </li>
                            <li>
                              <strong>Problem-based</strong>: Organize by issues users might face (crashes,
                              incompatibilities)
                            </li>
                            <li>
                              <strong>Workflow-based</strong>: Organize by the modding process (installation,
                              configuration, troubleshooting)
                            </li>
                            <li>
                              <strong>Skill-based</strong>: Organize by user expertise level (beginner, intermediate,
                              advanced)
                            </li>
                          </ul>
                          <p className="mt-4">
                            Choose an organization strategy that makes the most sense for your content and will help
                            users find information quickly.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="sharing" className="border-[#1aff80]/30">
                        <AccordionTrigger className="text-[#1aff80] hover:text-[#1aff80] hover:no-underline">
                          Sharing Modules with Others
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          <p className="mb-4">To share your modules with other users:</p>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>
                              Export your module file (e.g., <code>quest-mods.ts</code>)
                            </li>
                            <li>Share it on modding communities like Nexus Mods or Fallout 4 forums</li>
                            <li>Include clear instructions on how to add it to the application</li>
                            <li>Document any dependencies your module has on other modules</li>
                            <li>Consider creating a collection of related modules as a package</li>
                          </ol>
                          <div className="bg-black/30 p-3 rounded-md border border-[#1aff80]/30 mt-4">
                            <p className="text-[#1aff80]/70 text-sm">
                              <strong>Tip:</strong> Include a README file with your module that explains its purpose,
                              content, and any special installation instructions.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                <Card className="fallout-card border-[#1aff80]/30 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-[#1aff80] font-mono text-lg mb-4">Troubleshooting Module Issues</h3>

                    <div className="space-y-6">
                      <div className="bg-black/30 p-4 rounded-md border border-amber-500/30">
                        <h4 className="text-amber-500 font-mono text-md mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Module Not Appearing
                        </h4>
                        <p className="text-gray-300 mb-2">If your module doesn't appear in the knowledge base:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>
                            Verify that you've imported and registered the module in <code>app/page.tsx</code>
                          </li>
                          <li>Check the browser console for any JavaScript errors</li>
                          <li>Ensure your module ID is unique and not conflicting with existing modules</li>
                          <li>Restart the application after adding the module</li>
                        </ul>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-amber-500/30">
                        <h4 className="text-amber-500 font-mono text-md mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Entries Not Searchable
                        </h4>
                        <p className="text-gray-300 mb-2">If your entries don't appear in search results:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>Check that your keywords are relevant to the search terms users might use</li>
                          <li>Add more varied keywords, including synonyms and common variations</li>
                          <li>Ensure your entry content contains the terms users might search for</li>
                          <li>Verify that the module is properly registered and initialized</li>
                        </ul>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-amber-500/30">
                        <h4 className="text-amber-500 font-mono text-md mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          TypeScript Errors
                        </h4>
                        <p className="text-gray-300 mb-2">If you encounter TypeScript errors:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>
                            Ensure your module structure matches the <code>ModuleDefinition</code> interface
                          </li>
                          <li>Check that all required fields are present (id, name, description, version, entries)</li>
                          <li>
                            Verify that your entry structure matches the <code>KnowledgeEntry</code> interface
                          </li>
                          <li>
                            Make sure you're importing the correct types from <code>@/lib/types</code>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
