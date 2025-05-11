"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { getSettings, updateSettings } from "@/lib/settings"
import type { Settings } from "@/lib/types"
import {
  Save,
  RefreshCw,
  Settings2,
  Sliders,
  Eye,
  Terminal,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  History,
  Search,
  Palette,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    relevanceThreshold: 0.5,
    maxResults: 3,
    debugMode: false,
    autoExpandModules: true,
    theme: "dark",
    keyboardShortcuts: true,
    showRecentSearches: true,
    searchHighlighting: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const loadedSettings = await getSettings()
      setSettings(loadedSettings)
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await updateSettings(settings)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = async () => {
    try {
      const defaultSettings: Settings = {
        darkMode: true,
        relevanceThreshold: 0.5,
        maxResults: 3,
        debugMode: false,
        autoExpandModules: true,
        theme: "dark",
        keyboardShortcuts: true,
        showRecentSearches: true,
        searchHighlighting: true,
      }

      await updateSettings(defaultSettings)
      setSettings(defaultSettings)

      toast({
        title: "Success",
        description: "Settings reset to defaults",
      })
    } catch (error) {
      console.error("Failed to reset settings:", error)
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-[#1aff80] mx-auto mb-4" />
          <p className="text-[#1aff80]/70">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black/50">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-[#1aff80]/20 flex items-center justify-center">
            <Settings2 className="h-6 w-6 text-[#1aff80]" />
          </div>
          <div>
            <h2 className="text-[#1aff80] font-mono text-xl">SYSTEM SETTINGS</h2>
            <p className="text-[#1aff80]/70">Configure your Pip-Boy assistant</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-black/50 border border-[#1aff80]/30 mb-6">
            <TabsTrigger value="general" className="fallout-tab data-[state=active]:text-[#1aff80]">
              General
            </TabsTrigger>
            <TabsTrigger value="search" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Search
            </TabsTrigger>
            <TabsTrigger value="appearance" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="advanced" className="fallout-tab data-[state=active]:text-[#1aff80]">
              Advanced
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="general">
              <Card className="fallout-card border-[#1aff80]/30 mb-4">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Terminal className="h-5 w-5 text-[#1aff80]" />
                      <Label htmlFor="auto-expand" className="text-[#1aff80]">
                        Auto-Expand Modules
                      </Label>
                    </div>
                    <Switch
                      id="auto-expand"
                      checked={settings.autoExpandModules}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoExpandModules: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Keyboard className="h-5 w-5 text-[#1aff80]" />
                      <Label htmlFor="keyboard-shortcuts" className="text-[#1aff80]">
                        Keyboard Shortcuts
                      </Label>
                    </div>
                    <Switch
                      id="keyboard-shortcuts"
                      checked={settings.keyboardShortcuts !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, keyboardShortcuts: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <History className="h-5 w-5 text-[#1aff80]" />
                      <Label htmlFor="recent-searches" className="text-[#1aff80]">
                        Show Recent Searches
                      </Label>
                    </div>
                    <Switch
                      id="recent-searches"
                      checked={settings.showRecentSearches !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, showRecentSearches: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search">
              <Card className="fallout-card border-[#1aff80]/30 mb-4">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Sliders className="h-5 w-5 text-[#1aff80]" />
                      <Label className="text-[#1aff80]">
                        Relevance Threshold: {settings.relevanceThreshold.toFixed(2)}
                      </Label>
                    </div>
                    <Slider
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={[settings.relevanceThreshold]}
                      onValueChange={(value) => setSettings({ ...settings, relevanceThreshold: value[0] })}
                      className="py-4"
                    />
                    <p className="text-[#1aff80]/70 text-sm">
                      Higher values require more relevant matches. Lower values return more results but may be less
                      accurate.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Zap className="h-5 w-5 text-[#1aff80]" />
                      <Label className="text-[#1aff80]">Maximum Results: {settings.maxResults}</Label>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.maxResults]}
                      onValueChange={(value) => setSettings({ ...settings, maxResults: Math.round(value[0]) })}
                      className="py-4"
                    />
                    <p className="text-[#1aff80]/70 text-sm">
                      The maximum number of knowledge entries to consider when answering a question.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Search className="h-5 w-5 text-[#1aff80]" />
                      <Label htmlFor="search-highlighting" className="text-[#1aff80]">
                        Search Highlighting
                      </Label>
                    </div>
                    <Switch
                      id="search-highlighting"
                      checked={settings.searchHighlighting !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, searchHighlighting: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="fallout-card border-[#1aff80]/30 mb-4">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Palette className="h-5 w-5 text-[#1aff80]" />
                      <Label className="text-[#1aff80]">Theme</Label>
                    </div>
                    <RadioGroup
                      value={settings.theme || "dark"}
                      onValueChange={(value) =>
                        setSettings({ ...settings, theme: value as "dark" | "light" | "system" })
                      }
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" className="border-[#1aff80]" />
                        <Label htmlFor="theme-dark" className="text-[#1aff80]/80">
                          Dark Mode (Default)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" className="border-[#1aff80]" />
                        <Label htmlFor="theme-light" className="text-[#1aff80]/80">
                          Light Mode
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="theme-system" className="border-[#1aff80]" />
                        <Label htmlFor="theme-system" className="text-[#1aff80]/80">
                          System Preference
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-[#1aff80]/70 text-sm">
                      Note: Theme changes will take effect after reloading the application.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-[#1aff80]" />
                      <Label htmlFor="dark-mode" className="text-[#1aff80]">
                        Dark Mode
                      </Label>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card className="fallout-card border-[#1aff80]/30 mb-4">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <Label htmlFor="debug-mode" className="text-[#1aff80]">
                        Debug Mode
                      </Label>
                    </div>
                    <Switch
                      id="debug-mode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
                      className="data-[state=checked]:bg-[#1aff80]"
                    />
                  </div>
                  <p className="text-amber-500/70 text-sm pl-8">
                    Warning: Debug mode may affect performance and is intended for development purposes only.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-6">
            <Button
              onClick={handleSaveSettings}
              className="fallout-button flex-1 relative overflow-hidden"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" /> Save Settings
                </>
              )}

              <AnimatePresence>
                {showSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center bg-[#1aff80]"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2 text-black" />
                    <span className="text-black font-bold">Saved!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="flex-1 border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
            >
              <RefreshCw className="h-5 w-5 mr-2" /> Reset to Defaults
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
