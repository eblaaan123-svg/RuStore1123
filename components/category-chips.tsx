'use client'

import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/rustore-types'

export function CategoryChips({
  active,
  onChange,
}: {
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(c.key)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            active === c.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
