'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        platform?: string
        ready: () => void
        expand: () => void
        setHeaderColor?: (color: string) => void
        setBackgroundColor?: (color: string) => void
        openTelegramLink?: (url: string) => void
        openLink?: (url: string) => void
        initDataUnsafe?: {
          start_param?: string
          user?: {
            id?: number
            first_name?: string
            last_name?: string
            username?: string
          }
        }
        HapticFeedback?: {
          impactOccurred: (style: string) => void
          notificationOccurred: (type: string) => void
        }
      }
    }
  }
}

export function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    try {
      tg.ready()
      tg.expand()
      tg.setHeaderColor?.('#ffffff')
      tg.setBackgroundColor?.('#ffffff')
    } catch {
      // running outside Telegram — ignore
    }
  }, [])

  return null
}

// Платформа Telegram Mini App: 'ios' | 'macos' | 'android' | 'tdesktop' |
// 'web' | 'weba' | 'webk' | 'unknown'. Пусто, если Telegram ещё не загружен.
export function getTelegramPlatform(): string | undefined {
  try {
    return window.Telegram?.WebApp?.platform
  } catch {
    return undefined
  }
}

// Параметр deep-link'а (?startapp=... в Telegram). Вне Telegram — из URL,
// чтобы ссылки можно было тестировать в обычном браузере.
export function getStartParam(): string | undefined {
  try {
    const fromTg = window.Telegram?.WebApp?.initDataUnsafe?.start_param
    if (fromTg) return fromTg
    const params = new URLSearchParams(window.location.search)
    return (
      params.get('startapp') ||
      params.get('tgWebAppStartParam') ||
      undefined
    )
  } catch {
    return undefined
  }
}

export type TelegramUser = {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
}

// Данные пользователя Telegram (имя / юзернейм) для логирования.
// Пусто, если открыто вне Telegram.
export function getTelegramUser(): TelegramUser | undefined {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user
  } catch {
    return undefined
  }
}

// Поделиться ссылкой: внутри Telegram — нативный диалог пересылки,
// иначе — системный Share или копирование в буфер обмена.
// Возвращает true, если ссылка была скопирована (для показа уведомления).
export function shareLink(url: string, text = ''): boolean {
  haptic('light')
  const tg = window.Telegram?.WebApp
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    url,
  )}&text=${encodeURIComponent(text)}`
  try {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl)
      return false
    }
  } catch {
    // fall through
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ url, text }).catch(() => {})
      return false
    }
  } catch {
    // fall through
  }
  try {
    navigator.clipboard?.writeText(url)
    return true
  } catch {
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    return false
  }
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style)
  } catch {
    // ignore
  }
}

// Открыть чат поддержки: внутри Telegram — нативно, иначе — новая вкладка.
export function openSupport(url: string) {
  haptic('light')
  const tg = window.Telegram?.WebApp
  try {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url)
      return
    }
    if (tg?.openLink) {
      tg.openLink(url)
      return
    }
  } catch {
    // fall through to window.open
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
