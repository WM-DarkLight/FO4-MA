"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/category-badge"
import { FileText, Edit, Trash2, Download } from "lucide-react"
import type { KnowledgeModule, ModuleCategory } from "@/lib/types"

interface ModuleCardProps {
  module: KnowledgeModule
  category?: ModuleCategory
  entryCount: number
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
  onExport?: () => void
  selected?: boolean
}

export function ModuleCard({
  module,
  category,
  entryCount,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  selected = false,
}: ModuleCardProps) {
  return (
    <Card
      className={`fallout-card knowledge-card border-[#1aff80]/30 overflow-hidden transition-all hover:shadow-lg ${
        selected ? "border-[#1aff80] shadow-[0_0_15px_rgba(26,255,128,0.3)]" : ""
      }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-[#1aff80] flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {module.name}
            </CardTitle>
            {module.version && <div className="text-xs text-[#1aff80]/50 mt-1">v{module.version}</div>}
          </div>
          {category && <CategoryBadge name={category.name} color={category.color} />}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <CardDescription className="text-gray-300 mb-2">{module.description}</CardDescription>
        <div className="text-xs text-[#1aff80]/70">
          {entryCount} {entryCount === 1 ? "entry" : "entries"}
          {module.author && <> • By {module.author}</>}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelect}
          className="border-[#1aff80]/50 text-[#1aff80] hover:bg-[#1aff80]/10"
        >
          View Entries
        </Button>
        <div className="flex space-x-2">
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="h-8 w-8 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-[#1aff80]/70 hover:text-[#1aff80] hover:bg-[#1aff80]/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
