'use client'

import { Home, LayoutGrid, Gamepad2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/components/telegram-init'

const tabs = [
  { key: 'home', label: 'Главная', icon: Home },
  { key: 'apps', label: 'Приложения', icon: LayoutGrid },
  { key: 'games', label: 'Игры', icon: Gamepad2 },
  { key: 'profile', label: 'Профиль', icon: User },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: string
  onChange: (key: string) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
      {tabs.map((t) => {
        const Icon = t.icon
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              haptic('light')
              onChange(t.key)
            }}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 pb-1',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 2} />
            <span className="text-[11px] font-medium">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
