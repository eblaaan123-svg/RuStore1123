'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  ArrowLeft,
  Star,
  Download,
  ShieldCheck,
  Baby,
  Headset,
  ChevronRight,
  Share2,
  Check,
  BadgeCheck,
} from 'lucide-react'
import { AppIcon } from '@/components/app-icon'
import { InstallButton } from '@/components/install-button'
import { haptic, openSupport, shareLink } from '@/components/telegram-init'
import type { AppCard, AppFull, Review } from '@/lib/rustore-types'
import { ratingHistogram } from '@/lib/rustore-types'
import { SUPPORT_TELEGRAM, SUPPORT_URL } from '@/lib/custom-apps'
import { appShareUrl } from '@/lib/share'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function Stat({
  value,
  label,
  icon,
}: {
  value: string
  label: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 text-center">
      <span className="flex items-center gap-1 text-[15px] font-bold text-foreground">
        {icon}
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

// Склонение: 1 отзыв / 2 отзыва / 5 отзывов
function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Оценка ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${className} ${
            s <= Math.round(rating)
              ? 'fill-rating text-rating'
              : 'fill-border text-border'
          }`}
        />
      ))}
    </div>
  )
}

function RatingBreakdown({ rating, reviews }: { rating: number; reviews: number }) {
  const bars = ratingHistogram(rating, reviews)
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-secondary px-4 py-4">
      <div className="flex flex-col items-center">
        <span className="text-4xl font-extrabold leading-none text-foreground">
          {rating.toFixed(1).replace('.', ',')}
        </span>
        <div className="mt-1.5">
          <Stars rating={rating} className="h-3.5 w-3.5" />
        </div>
        <span className="mt-1 text-xs text-muted-foreground">
          {reviews.toLocaleString('ru-RU')}{' '}
          {plural(reviews, ['оценка', 'оценки', 'оценок'])}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {bars.map((b) => (
          <div key={b.star} className="flex items-center gap-2">
            <span className="w-2 text-right text-xs text-muted-foreground">
              {b.star}
            </span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-rating"
                style={{ width: `${b.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.author.trim().charAt(0).toUpperCase()
  return (
    <div className="w-72 shrink-0 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {review.author}
          </p>
          <p className="text-xs text-muted-foreground">{review.date}</p>
        </div>
      </div>
      <div className="mt-3">
        <Stars rating={review.rating} className="h-3.5 w-3.5" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
        {review.text}
      </p>
    </div>
  )
}

export function AppDetail({
  appId,
  fallback,
  onBack,
}: {
  appId: string
  fallback: AppCard
  onBack: () => void
}) {
  const { data } = useSWR<{ app: AppFull }>(
    `/api/rustore/app/${encodeURIComponent(appId)}`,
    fetcher,
  )
  const app = data?.app
  const loading = !app

  const name = app?.name ?? fallback.name
  const icon = app?.icon ?? fallback.icon
  const developer = app?.developer ?? fallback.subtitle

  const [copied, setCopied] = useState(false)

  function handleShare() {
    const didCopy = shareLink(appShareUrl(appId), `${name} — установить из RuStore`)
    if (didCopy) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          aria-label="Назад"
          onClick={() => {
            haptic('light')
            onBack()
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="truncate text-base font-bold text-foreground">
          {name}
        </span>
        <button
          type="button"
          aria-label={copied ? 'Ссылка скопирована' : 'Поделиться'}
          onClick={handleShare}
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          {copied ? (
            <Check className="h-5 w-5 text-primary" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </button>
      </header>

      <div className="flex items-center gap-4 px-4 pt-4">
        <AppIcon src={icon} name={name} className="h-20 w-20" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight text-foreground text-balance">
            {name}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
            <span className="truncate">{developer}</span>
            {app?.verified && (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-primary"
                aria-label="Проверенный разработчик"
              />
            )}
          </p>
          {app?.verified && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Официальный разработчик
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <InstallButton appId={appId} variant="full" />
      </div>

      <div className="mt-5 flex items-stretch divide-x divide-border px-2">
        <Stat
          value={app && app.rating > 0 ? app.rating.toFixed(1).replace('.', ',') : '—'}
          label={app ? `${app.reviews.toLocaleString('ru-RU')} оценок` : 'оценки'}
          icon={<Star className="h-3.5 w-3.5 fill-rating text-rating" />}
        />
        <Stat
          value={app?.downloads ?? fallback.downloads ?? '—'}
          label="загрузок"
          icon={<Download className="h-3.5 w-3.5 text-muted-foreground" />}
        />
        <Stat
          value={app?.age ?? '—'}
          label="возраст"
          icon={<Baby className="h-3.5 w-3.5 text-muted-foreground" />}
        />
        <Stat value={app?.size ?? '—'} label="размер" />
      </div>

      {/* Скриншоты */}
      <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto px-4">
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-80 w-44 shrink-0 animate-pulse rounded-3xl bg-secondary"
            />
          ))}
        {!loading &&
          app.screenshots.slice(0, 10).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src || '/placeholder.svg'}
              alt={`Скриншот ${i + 1} — ${name}`}
              className="h-80 w-44 shrink-0 rounded-3xl border border-border object-cover"
              loading="lazy"
            />
          ))}
        {!loading && app.screenshots.length === 0 && (
          <div className="flex h-40 w-full items-center justify-center rounded-3xl bg-secondary text-sm text-muted-foreground">
            Нет скриншотов
          </div>
        )}
      </div>

      <section className="px-4 pt-6">
        <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm text-foreground">
            Приложение проверено на безопасность
          </span>
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-2 text-lg font-bold text-foreground">Описание</h2>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/80">
            {app.fullDescription}
          </p>
        )}
      </section>

      {!loading && app.whatsNew && (
        <section className="px-4 pt-6">
          <h2 className="mb-2 text-lg font-bold text-foreground">Что нового</h2>
          {app.version && (
            <p className="mb-1 text-sm text-muted-foreground">
              Версия {app.version}
            </p>
          )}
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/80">
            {app.whatsNew}
          </p>
        </section>
      )}

      {/* Оценки и отзывы */}
      {!loading && app.rating > 0 && (
        <section className="px-4 pt-6">
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Оценки и отзывы
          </h2>
          <RatingBreakdown rating={app.rating} reviews={app.reviews} />

          {app.userReviews && app.userReviews.length > 0 && (
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
              {app.userReviews.map((r, i) => (
                <ReviewCard key={`${r.author}-${i}`} review={r} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Поддержка */}
      <section className="px-4 pt-6">
        <button
          type="button"
          onClick={() => openSupport(SUPPORT_URL)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left"
        >
          <Headset className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-foreground">
              Сообщить о проблеме
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Свяжитесь с агентом поддержки в Telegram · @{SUPPORT_TELEGRAM}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </button>
      </section>
    </div>
  )
}
