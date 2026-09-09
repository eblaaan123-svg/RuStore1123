'use client'

import { Search, X } from 'lucide-react'

export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Поиск приложений и игр"
          className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Поиск приложений и игр"
        />
        {value && (
          <button
            type="button"
            aria-label="Очистить"
            onClick={() => onChange('')}
            className="shrink-0 text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
