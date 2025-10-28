"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-balance">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md text-pretty">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-primary hover:bg-primary-hover">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
