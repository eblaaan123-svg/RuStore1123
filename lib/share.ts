// Утилиты для шеринга ссылок на мини-апп и конкретные приложения.
// Клиентобезопасно — без побочных эффектов и без server-only импортов.

import { CUSTOM_APP_SLUGS } from '@/lib/custom-apps'

// Бот и short name мини-аппа. Ссылки вида:
// https://t.me/RuStoreHelperBot/RuStore?startapp=<slug>
export const TG_BOT = 'RuStoreHelperBot'
export const TG_MINIAPP = 'RuStore'

// Обратная карта slug -> packageName для кастомных приложений.
const SLUG_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(CUSTOM_APP_SLUGS).map(([id, slug]) => [slug, id]),
)

// packageName -> slug для параметра startapp.
// Telegram разрешает только [A-Za-z0-9_-]. У кастомных приложений — «красивый»
// slug из таблицы; для остальных точки в packageName заменяем на дефис
// (в именах Android-пакетов дефис не встречается, поэтому преобразование обратимо).
export function appSlug(appId: string): string {
  return CUSTOM_APP_SLUGS[appId] ?? appId.replace(/\./g, '-')
}

// slug из startapp -> packageName.
export function appIdFromSlug(slug: string): string {
  const s = slug.trim()
  if (SLUG_TO_ID[s]) return SLUG_TO_ID[s]
  return s.replace(/-/g, '.')
}

// Базовая ссылка на весь мини-апп.
export function miniAppUrl(): string {
  return `https://t.me/${TG_BOT}/${TG_MINIAPP}`
}

// Ссылка, которая при открытии сразу ведёт на конкретное приложение.
export function appShareUrl(appId: string): string {
  return `${miniAppUrl()}?startapp=${appSlug(appId)}`
}
