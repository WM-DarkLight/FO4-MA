"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard, Info } from "lucide-react"
import type { KeyboardShortcut } from "@/lib/types"

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function KeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Check for keyboard shortcuts
      for (const shortcut of shortcuts) {
        // Check if all keys in the shortcut are pressed
        const allKeysPressed = shortcut.keys.every((key) => {
          if (key === "Ctrl") return e.ctrlKey
          if (key === "Alt") return e.altKey
          if (key === "Shift") return e.shiftKey
          return e.key.toLowerCase() === key.toLowerCase()
        })

        if (allKeysPressed) {
          e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-[#1aff80]/30">
        <DialogHeader>
          <DialogTitle className="text-[#1aff80] flex items-center">
            <Keyboard className="h-5 w-5 mr-2" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            {enabled
              ? "Use these keyboard shortcuts to navigate the application quickly."
              : "Keyboard shortcuts are currently disabled. Enable them in Settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.id} className="flex justify-between items-center">
                <div className="text-[#1aff80]">{shortcut.name}</div>
                <div className="flex items-center">
                  {shortcut.keys.map((key, index) => (
                    <span key={index}>
                      {index > 0 && <span className="mx-1 text-gray-500">+</span>}
                      <kbd className="px-2 py-1 bg-black/50 border border-[#1aff80]/30 rounded text-[#1aff80]/80 text-xs">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!enabled && (
            <div className="mt-6 flex items-start p-3 bg-[#1aff80]/10 border border-[#1aff80]/30 rounded-md">
              <Info className="h-5 w-5 text-[#1aff80] mr-2 mt-0.5" />
              <div className="text-[#1aff80]/80 text-sm">
                Keyboard shortcuts are disabled. You can enable them in the Settings panel.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
