"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SelectionChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export function SelectionChip({ selected, onClick, children, className }: SelectionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full border transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        selected
          ? "bg-primary/10 border-primary text-primary font-medium"
          : "bg-background border-border text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  )
}
