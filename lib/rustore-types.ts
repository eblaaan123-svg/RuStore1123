// Типы данных RuStore. Без побочных эффектов — безопасно импортировать в клиентские компоненты.

export interface AppCard {
  id: string // packageName
  name: string
  subtitle: string
  icon: string
  rating: number
  downloads: string
}

export interface Review {
  author: string
  rating: number // 1..5
  date: string // например "12 мая 2024"
  text: string
}

export interface AppFull extends AppCard {
  developer: string
  reviews: number
  fullDescription: string
  whatsNew: string
  size: string
  age: string
  version: string
  screenshots: string[]
  category: string
  verified?: boolean // официальный/проверенный разработчик
  userReviews?: Review[] // отзывы пользователей
}

// Детерминированное распределение оценок по звёздам (5→1) из среднего рейтинга
// и общего числа голосов. Даёт правдоподобную гистограмму без реальных данных.
export function ratingHistogram(
  average: number,
  total: number,
): { star: number; count: number; percent: number }[] {
  const stars = [5, 4, 3, 2, 1]
  if (!average || !total || total <= 0) {
    return stars.map((star) => ({ star, count: 0, percent: 0 }))
  }
  const sigma = 0.85
  const weights = stars.map((s) =>
    Math.exp(-((s - average) ** 2) / (2 * sigma * sigma)),
  )
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map((w) => (w / sum) * total)

  // Округляем так, чтобы сумма совпала с total.
  const counts = raw.map((r) => Math.floor(r))
  let remainder = total - counts.reduce((a, b) => a + b, 0)
  const fracOrder = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < fracOrder.length && remainder > 0; k++) {
    counts[fracOrder[k].i]++
    remainder--
  }

  const max = Math.max(...counts, 1)
  return stars.map((star, i) => ({
    star,
    count: counts[i],
    percent: Math.round((counts[i] / max) * 100),
  }))
}

export interface Collection {
  title: string
  query: string
  apps: AppCard[]
}

export interface CategoryDef {
  key: string
  label: string
  query: string // пустая строка = главная (подборки)
}

// Категории-чипсы. Каждая (кроме «Все») ведёт на живой поиск по запросу.
export const CATEGORIES: CategoryDef[] = [
  { key: 'all', label: 'Все', query: '' },
  { key: 'games', label: 'Игры', query: 'игры' },
  { key: 'social', label: 'Соцсети', query: 'социальная сеть' },
  { key: 'messengers', label: 'Мессенджеры', query: 'мессенджер' },
  { key: 'finance', label: 'Финансы', query: 'банк' },
  { key: 'shopping', label: 'Покупки', query: 'магазин' },
  { key: 'music', label: 'Музыка', query: 'музыка' },
  { key: 'video', label: 'Видео', query: 'видео' },
  { key: 'navigation', label: 'Навигация', query: 'навигатор' },
  { key: 'food', label: 'Еда', query: 'доставка еды' },
  { key: 'photo', label: 'Фото', query: 'фоторедактор' },
  { key: 'health', label: 'Здоровье', query: 'здоровье' },
]

// Подборки главной страницы — каждая формируется живым запросом к каталогу RuStore.
export const HOME_COLLECTIONS: { title: string; query: string }[] = [
  { title: 'Рекомендуем', query: 'мессенджер' },
  { title: 'Маркетплейсы', query: 'маркетплейс' },
  { title: 'Банки и финансы', query: 'банк' },
  { title: 'Популярные игры', query: 'игры' },
  { title: 'Музыка и подкасты', query: 'музыка' },
  { title: 'Смотрим видео', query: 'видео' },
  { title: 'Навигация и транспорт', query: 'навигатор' },
  { title: 'Доставка еды', query: 'доставка еды' },
  { title: 'Госуслуги и сервисы', query: 'госуслуги' },
  { title: 'Фото и видео', query: 'фоторедактор' },
]
