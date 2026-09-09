import { Bell } from 'lucide-react'

export function RuStoreHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-black leading-none text-primary-foreground">
            R
          </span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          RuStore
        </span>
      </div>
      <button
        type="button"
        aria-label="Уведомления"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
      >
        <Bell className="h-5 w-5" />
      </button>
    </header>
  )
}
