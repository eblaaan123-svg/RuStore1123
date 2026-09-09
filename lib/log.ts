// Отправка событий в чат-логгер. Работает тихо: любые ошибки сети игнорируются,
// чтобы логирование никогда не ломало сам мини-апп.
import { getTelegramUser } from '@/components/telegram-init'

export type LogEvent = 'open' | 'app_open' | 'install_start' | 'support'

// Чтобы одинаковые события не спамили чат (напр. «открыл» в dev-режиме
// монтируется дважды) — не шлём то же самое событие подряд.
let lastKey = ''

export function logEvent(event: LogEvent, detail?: string) {
  try {
    const key = `${event}:${detail ?? ''}`
    if (key === lastKey) return
    lastKey = key

    void fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, detail, user: getTelegramUser() }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
