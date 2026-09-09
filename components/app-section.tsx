'use client'

import { ChevronRight } from 'lucide-react'
import { AppRow } from '@/components/app-row'
import type { AppCard } from '@/lib/rustore-types'

export function AppSection({
  title,
  apps,
  onOpen,
  onMore,
}: {
  title: string
  apps: AppCard[]
  onOpen: (app: AppCard) => void
  onMore?: () => void
}) {
  if (apps.length === 0) return null

  return (
    <section className="px-4 pt-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground text-balance">
          {title}
        </h2>
        <button
          type="button"
          onClick={onMore}
          className="flex items-center gap-0.5 text-sm font-semibold text-primary"
        >
          Ещё
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="divide-y divide-border">
        {apps.map((app) => (
          <AppRow key={`${title}-${app.id}`} app={app} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
