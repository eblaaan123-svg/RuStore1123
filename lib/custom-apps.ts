// Кастомные приложения, добавленные поверх живого каталога RuStore.
// Импортируется и на сервере, и на клиенте — без побочных эффектов.

import type { AppCard, AppFull } from '@/lib/rustore-types'

// Телеграм агента поддержки — используется во всех точках «поддержка/помощь».
export const SUPPORT_TELEGRAM = 'rustorehelper'
export const SUPPORT_URL = `https://t.me/${SUPPORT_TELEGRAM}`

// Короткие «красивые» slug'и для deep-link'ов кастомных приложений.
// Ключ — packageName (id), значение — slug для ?startapp=... (только [A-Za-z0-9_-]).
export const CUSTOM_APP_SLUGS: Record<string, string> = {
  'ru.ozon.influencer': 'ozon_Influencer',
}

export const CUSTOM_APPS: AppFull[] = [
  {
    id: 'ru.ozon.influencer',
    name: 'Ozon Influencer',
    subtitle: 'Заработок для блогеров и магазинов Ozon',
    icon: '/app-icons/ozon-influencer.png',
    rating: 4.8,
    downloads: '1 млн+',
    developer: 'Ozon Tech',
    reviews: 84213,
    category: 'Бизнес',
    age: '12+',
    size: '46 МБ',
    version: '2.4.0',
    fullDescription: `Ozon Influencer — официальное приложение для блогеров, авторов контента и селлеров Ozon. Зарабатывайте на рекомендациях товаров и находите проверенных инфлюенсеров для продвижения своего магазина.

Для блогеров:
• Подключайтесь к партнёрской программе Ozon и получайте до 20% с каждой продажи по вашей ссылке
• Создавайте подборки товаров и делитесь ими в соцсетях в один тап
• Отслеживайте клики, заказы и доход в реальном времени
• Моментальные выплаты на карту или Ozon Кошелёк

Для магазинов:
• Находите блогеров по нише, аудитории и охватам
• Запускайте рекламные кампании и бартер напрямую в приложении
• Прозрачная статистика: охваты, переходы, продажи и ROI
• Безопасные сделки — оплата только за результат

Ozon Influencer соединяет бренды и авторов, помогая обеим сторонам расти на крупнейшем маркетплейсе России. Присоединяйтесь к тысячам блогеров и селлеров, которые уже зарабатывают вместе с Ozon.`,
    whatsNew: `• Новый раздел «Мои сделки» с историей всех коллабораций
• Ускорили вывод средств — теперь выплаты приходят за минуты
• Добавили аналитику Stories и Reels
• Исправили ошибки и улучшили стабильность`,
    screenshots: [
      '/app-icons/ozon-influencer-s1.png',
      '/app-icons/ozon-influencer-s2.png',
      '/app-icons/ozon-influencer-s3.png',
    ],
    verified: true,
    userReviews: [
      {
        author: 'Марина К.',
        rating: 5,
        date: '18 мая 2024',
        text: 'Веду блог про товары для дома, подключилась за пару минут. Выплаты реально приходят быстро, за первый месяц вышло больше, чем ожидала. Статистика по переходам очень наглядная.',
      },
      {
        author: 'Дмитрий Осипов',
        rating: 5,
        date: '6 мая 2024',
        text: 'Как селлер искал блогеров под свою нишу — здесь это удобно. Оплата только за результат, никаких предоплат вслепую. Рекомендую тем, кто продаёт на Ozon.',
      },
      {
        author: 'Алина',
        rating: 4,
        date: '29 апреля 2024',
        text: 'Приложение классное, подборки товаров делать легко. Снял бы звезду только за то, что иногда долго грузится аналитика Reels, но в остальном всё супер.',
      },
      {
        author: 'Сергей В.',
        rating: 5,
        date: '21 апреля 2024',
        text: 'Пользуюсь с запуска. Моментальные выплаты на Ozon Кошелёк — то, что нужно. Поддержка отвечает быстро и по делу.',
      },
    ],
  },
]

export function getCustomApp(id: string): AppFull | undefined {
  return CUSTOM_APPS.find((a) => a.id === id)
}

// Поиск по кастомным приложениям — по названию, описанию, разработчику и категории.
// Используется, чтобы подмешивать кастомные приложения в результаты поиска RuStore.
export function searchCustomApps(query: string): AppFull[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/).filter(Boolean)
  return CUSTOM_APPS.filter((app) => {
    const haystack = [
      app.name,
      app.subtitle,
      app.developer,
      app.category,
      app.fullDescription,
    ]
      .join(' ')
      .toLowerCase()
    // Совпадение, если найдено хотя бы одно слово запроса.
    return words.some((w) => haystack.includes(w))
  })
}

export function customAppCard(app: AppFull): AppCard {
  return {
    id: app.id,
    name: app.name,
    subtitle: app.subtitle,
    icon: app.icon,
    rating: app.rating,
    downloads: app.downloads,
  }
}
