'use client'

import { cn } from '@/lib/utils'
import { useInstallFlow } from '@/components/install-flow'

export function InstallButton({
  appId,
  variant = 'pill',
  className,
}: {
  appId: string
  variant?: 'pill' | 'full'
  className?: string
}) {
  const { startInstall } = useInstallFlow()

  function handleInstall(e: React.MouseEvent) {
    // Не даём клику "проваливаться" в карточку приложения.
    e.stopPropagation()
    void appId
    // Запускаем цепочку модалок установки (Apple ID → инструкция → поддержка).
    startInstall()
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleInstall}
        aria-label="Установить"
        className={cn(
          'w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]',
          className,
        )}
      >
        Установить
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Установить"
      className={cn(
        'shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-bold text-primary transition-transform active:scale-95',
        className,
      )}
    >
      Установить
    </button>
  )
}
