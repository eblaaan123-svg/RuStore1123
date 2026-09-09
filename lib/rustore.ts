import 'server-only'
import type { AppCard, AppFull, Collection } from '@/lib/rustore-types'
import { HOME_COLLECTIONS } from '@/lib/rustore-types'
import { CUSTOM_APPS, customAppCard, getCustomApp } from '@/lib/custom-apps'

const BASE = 'https://backapi.rustore.ru'
const UA =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36'

async function api(path: string, revalidate = 3600): Promise<unknown | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      next: { revalidate },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Байты -> "105 МБ"
export function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(1).replace('.', ',')} ГБ`
  if (mb >= 10) return `${Math.round(mb)} МБ`
  return `${mb.toFixed(1).replace('.', ',')} МБ`
}

// Число оценок -> "155 тыс." / "1,2 млн"
export function formatCount(n?: number): string {
  if (!n || n <= 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} млн`
  if (n >= 1_000) return `${Math.round(n / 1000)} тыс.`
  return String(n)
}

type SearchItem = {
  packageName?: string
  appName?: string
  shortDescription?: string
  iconUrl?: string
  averageUserRating?: number
  roundedDownloadsText?: string
  appType?: string
}

function toCard(item: SearchItem, subtitleFallback = ''): AppCard | null {
  if (!item?.packageName || !item?.appName || !item?.iconUrl) return null
  return {
    id: item.packageName,
    name: item.appName,
    subtitle: item.shortDescription?.trim() || subtitleFallback,
    icon: item.iconUrl,
    rating: Number(item.averageUserRating) || 0,
    downloads: item.roundedDownloadsText || '',
  }
}

// Живой поиск по каталогу RuStore.
export async function searchApps(
  query: string,
  pageSize = 24,
  subtitleFallback = '',
): Promise<AppCard[]> {
  const q = query.trim()
  if (!q) return []
  const data = (await api(
    `/applicationData/apps?query=${encodeURIComponent(q)}&pageSize=${pageSize}`,
  )) as { body?: { content?: SearchItem[] } } | null
  const content = data?.body?.content ?? []
  const seen = new Set<string>()
  const out: AppCard[] = []
  for (const it of content) {
    const card = toCard(it, subtitleFallback)
    if (!card || seen.has(card.id)) continue
    // оставляем обычные приложения (MAIN) и игры (GAMES)
    if (it.appType && it.appType !== 'MAIN' && it.appType !== 'GAMES') continue
    seen.add(card.id)
    out.push(card)
  }
  return out
}

// Тематические подборки главной — параллельные живые запросы.
export async function getHomeCollections(): Promise<Collection[]> {
  const results = await Promise.all(
    HOME_COLLECTIONS.map(async (c) => ({
      title: c.title,
      query: c.query,
      apps: await searchApps(c.query, 6, c.title),
    })),
  )
  const live = results.filter((c) => c.apps.length > 0)

  // Подборка «Выбор редакции» с кастомными приложениями — всегда первой.
  const editors: Collection = {
    title: 'Выбор редакции',
    query: '',
    apps: CUSTOM_APPS.map(customAppCard),
  }
  return [editors, ...live]
}

type FileUrl = { fileUrl?: string; type?: string; ordinal?: number }
type OverallInfo = {
  packageName?: string
  appName?: string
  companyName?: string
  shortDescription?: string
  fullDescription?: string
  whatsNew?: string
  iconUrl?: string
  fileSize?: number
  ageLegal?: string
  versionName?: string
  roundedDownloadsText?: string
  categories?: string[]
  rating?: { average?: number; votes?: number }
  fileUrls?: FileUrl[]
}

// Полные данные приложения (для детальной страницы).
export async function getAppFull(pkg: string): Promise<AppFull | null> {
  // Сначала проверяем кастомные приложения (их нет в API RuStore).
  const custom = getCustomApp(pkg)
  if (custom) return custom

  const data = (await api(
    `/applicationData/overallInfo/${encodeURIComponent(pkg)}`,
  )) as { body?: OverallInfo } | null
  const b = data?.body
  if (!b?.packageName || !b?.appName || !b?.iconUrl) return null

  const screenshots = (b.fileUrls ?? [])
    .filter((f) => f.type === 'SCREENSHOT' && f.fileUrl)
    .sort((a, z) => (a.ordinal ?? 0) - (z.ordinal ?? 0))
    .map((f) => f.fileUrl as string)

  return {
    id: b.packageName,
    name: b.appName,
    subtitle: b.shortDescription?.trim() || '',
    icon: b.iconUrl,
    rating: Number(b.rating?.average) || 0,
    downloads: b.roundedDownloadsText || '—',
    developer: b.companyName || 'Разработчик',
    reviews: Number(b.rating?.votes) || 0,
    fullDescription: b.fullDescription?.trim() || b.shortDescription?.trim() || '',
    whatsNew: b.whatsNew?.trim() || 'Общие улучшения и исправления ошибок.',
    size: formatSize(b.fileSize),
    age: b.ageLegal || '0+',
    version: b.versionName || '',
    screenshots,
    category: b.categories?.[0] || '',
  }
}
