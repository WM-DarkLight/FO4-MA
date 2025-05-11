"use client"

import { useMemo } from "react"

interface HighlightedTextProps {
  text: string
  query: string
  className?: string
}

export function HighlightedText({ text, query, className = "" }: HighlightedTextProps) {
  const highlightedText = useMemo(() => {
    if (!query.trim()) return text

    // Escape special regex characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    // Create a regex that matches the query (case insensitive)
    const regex = new RegExp(`(${escapedQuery})`, "gi")

    // Split the text by the regex matches
    const parts = text.split(regex)

    // Map the parts to JSX, highlighting the matches
    return parts.map((part, i) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <mark key={i} className="bg-[#1aff80]/30 text-white px-0.5 rounded">
            {part}
          </mark>
        )
      }
      return part
    })
  }, [text, query])

  return <span className={className}>{highlightedText}</span>
}
