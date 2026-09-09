'use client'

import { Star } from 'lucide-react'
import { AppIcon } from '@/components/app-icon'
import { InstallButton } from '@/components/install-button'
import { haptic } from '@/components/telegram-init'
import type { AppCard } from '@/lib/rustore-types'

export function AppRow({
  app,
  onOpen,
}: {
  app: AppCard
  onOpen: (app: AppCard) => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        haptic('light')
        onOpen(app)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          haptic('light')
          onOpen(app)
        }
      }}
      className="flex w-full cursor-pointer items-center gap-3 py-2 text-left"
    >
      <AppIcon src={app.icon} name={app.name} className="h-14 w-14" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-foreground">
          {app.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          {app.rating > 0 && (
            <>
              <span className="flex items-center gap-0.5 shrink-0">
                <Star className="h-3 w-3 fill-rating text-rating" />
                {app.rating.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          <span className="truncate">{app.subtitle}</span>
        </div>
      </div>
      <InstallButton appId={app.id} variant="pill" />
    </div>
  )
}
