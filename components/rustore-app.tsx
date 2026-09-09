'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  Loader2,
  User,
  Headset,
  ChevronRight,
  Grid2x2,
  Download,
  CreditCard,
  Settings,
  Share2,
} from 'lucide-react'
import { RuStoreHeader } from '@/components/rustore-header'
import { SearchBar } from '@/components/search-bar'
import { CategoryChips } from '@/components/category-chips'
import { BannerCarousel } from '@/components/banner-carousel'
import { AppSection } from '@/components/app-section'
import { AppRow } from '@/components/app-row'
import { BottomNav } from '@/components/bottom-nav'
import { AppDetail } from '@/components/app-detail'
import {
  TelegramInit,
  haptic,
  openSupport,
  getStartParam,
  shareLink,
} from '@/components/telegram-init'
import { CATEGORIES, type AppCard, type Collection } from '@/lib/rustore-types'
import {
  SUPPORT_TELEGRAM,
  SUPPORT_URL,
  getCustomApp,
  customAppCard,
  searchCustomApps,
} from '@/lib/custom-apps'
import { appIdFromSlug, appShareUrl, miniAppUrl } from '@/lib/share'
import { logEvent } from '@/lib/log'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export function RuStoreApp({
  initialCollections,
}: {
  initialCollections: Collection[]
}) {
  const [tab, setTab] = useState('home')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AppCard | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function notify(message: string) {
    haptic('light')
    setNotice(message)
  }

  // Лог: пользователь открыл мини-апп (один раз при заходе).
  useEffect(() => {
    logEvent('open')
  }, [])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(t)
  }, [notice])

  // Deep-link: если мини-апп открыт по ссылке ?startapp=<slug>,
  // сразу показываем нужное приложение.
  useEffect(() => {
    const slug = getStartParam()
    if (!slug) return
    const id = appIdFromSlug(slug)
    const custom = getCustomApp(id)
    const card: AppCard = custom
      ? customAppCard(custom)
      : { id, name: '', subtitle: '', icon: '', rating: 0, downloads: '' }
    setSelected(card)
  }, [])

  const debouncedQuery = useDebounced(query.trim())

  // Определяем активный поисковый запрос для листинга.
  const activeQuery = useMemo(() => {
    if (debouncedQuery) return debouncedQuery
    if (tab === 'games') return 'игры'
    if (tab === 'apps') return 'приложения'
    if (tab === 'home' && category !== 'all') {
      return CATEGORIES.find((c) => c.key === category)?.query ?? null
    }
    return null
  }, [debouncedQuery, tab, category])

  const { data, isLoading } = useSWR<{ apps: AppCard[] }>(
    activeQuery
      ? `/api/rustore/search?query=${encodeURIComponent(activeQuery)}&pageSize=40`
      : null,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false },
  )

  // Подмешиваем кастомные приложения в результаты: они ищутся так же,
  // как и приложения из API RuStore, и показываются первыми.
  const results = useMemo<AppCard[]>(() => {
    const apiApps = data?.apps ?? []
    if (!activeQuery) return apiApps
    const custom = searchCustomApps(activeQuery).map(customAppCard)
    if (custom.length === 0) return apiApps
    const customIds = new Set(custom.map((a) => a.id))
    return [...custom, ...apiApps.filter((a) => !customIds.has(a.id))]
  }, [data, activeQuery])

  function openApp(app: AppCard) {
    logEvent('app_open', app.name || app.id)
    setSelected(app)
    window.scrollTo({ top: 0 })
  }

  if (selected) {
    return (
      <main className="mx-auto min-h-dvh max-w-md bg-background">
        <TelegramInit />
        <AppDetail
          appId={selected.id}
          fallback={selected}
          onBack={() => setSelected(null)}
        />
      </main>
    )
  }

  const showHome = tab === 'home' && activeQuery === null
  const listTitle = debouncedQuery
    ? 'Результаты поиска'
    : tab === 'games'
      ? 'Игры'
      : tab === 'apps'
        ? 'Приложения'
        : (CATEGORIES.find((c) => c.key === category)?.label ?? 'Каталог')

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-background pb-24">
      <TelegramInit />
      <RuStoreHeader />

      {tab !== 'profile' && (
        <>
          <SearchBar value={query} onChange={setQuery} />
          {tab === 'home' && (
            <CategoryChips active={category} onChange={setCategory} />
          )}
        </>
      )}

      {showHome && (
        <>
          <BannerCarousel />
          {initialCollections.map((c) => (
            <AppSection
              key={c.title}
              title={c.title}
              apps={c.apps}
              onOpen={openApp}
              onMore={() => {
                setTab('home')
                setQuery(c.query)
              }}
            />
          ))}
        </>
      )}

      {tab === 'profile' ? (
        <ProfileView notify={notify} />
      ) : (
        !showHome && (
          <ResultList
            title={listTitle}
            items={results}
            loading={isLoading && results.length === 0}
            onOpen={openApp}
          />
        )
      )}

      {notice && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-md justify-center px-4"
        >
          <p className="rounded-2xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background shadow-lg">
            {notice}
          </p>
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} />
    </main>
  )
}

function ResultList({
  title,
  items,
  loading,
  onOpen,
}: {
  title: string
  items: AppCard[]
  loading: boolean
  onOpen: (app: AppCard) => void
}) {
  return (
    <section className="px-4 pt-4">
      <h2 className="mb-1 text-lg font-bold text-foreground">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Загружаем каталог…</span>
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Ничего не найдено
        </p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((app) => (
            <AppRow key={app.id} app={app} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  )
}

function ProfileView({ notify }: { notify: (m: string) => void }) {
  const items = [
    { label: 'Мои приложения', icon: Grid2x2 },
    { label: 'Загрузки', icon: Download },
    { label: 'Способы оплаты', icon: CreditCard },
    { label: 'Настройки', icon: Settings },
  ]

  const contactSupport = () => openSupport(SUPPORT_URL)

  const shareApp = () => {
    const copied = shareLink(
      miniAppUrl(),
      'RuStore — магазин приложений и игр для Android',
    )
    if (copied) notify('Ссылка на приложение скопирована')
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-4 rounded-3xl bg-secondary p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <User className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">Гость</p>
          <p className="text-sm text-muted-foreground">
            Войдите, чтобы синхронизировать покупки
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border">
        {items.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              notify('Раздел пока недоступен в мини-апп версии, но мы над этим работаем')
            }
            className="flex w-full items-center gap-3 px-4 py-4 text-left text-[15px] font-medium text-foreground"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
        <button
          type="button"
          onClick={shareApp}
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-[15px] font-medium text-foreground"
        >
          <Share2 className="h-5 w-5 text-primary" />
          <span className="flex-1">Поделиться приложением</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={contactSupport}
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-[15px] font-medium text-foreground"
        >
          <Headset className="h-5 w-5 text-primary" />
          <span className="flex-1">Помощь и поддержка</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Карточка связи с поддержкой */}
      <button
        type="button"
        onClick={contactSupport}
        className="mt-4 flex w-full items-center gap-3 rounded-3xl bg-primary p-4 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
          <Headset className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-primary-foreground">
            Свяжитесь с аг��нтом поддержки в Telegram
          </p>
          <p className="truncate text-sm text-primary-foreground/80">
            @{SUPPORT_TELEGRAM}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary-foreground/80" />
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        RuStore Mini App · версия 1.0
      </p>
    </div>
  )
}
