import { NextResponse } from 'next/server'

// ─── Настройки берутся из переменных окружения ───────────────────────────────
// TELEGRAM_BOT_TOKEN   — токен бота от @BotFather
// TELEGRAM_LOG_CHAT_ID — id чата/канала, куда слать логи
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_LOG_CHAT_ID

// Подписи событий для сообщения в чат.
function eventLabel(event: string, detail?: string): string {
  switch (event) {
    case 'open':
      return '🚀 Открыл мини-апп'
    case 'app_open':
      return `📱 Открыл приложение${detail ? `: ${detail}` : ''}`
    case 'install_start':
      return '📥 Перешёл к установке'
    case 'support':
      return '💬 Нажал «Написать в поддержку»'
    default:
      return event
  }
}

type Body = {
  event?: string
  detail?: string
  user?: {
    id?: number
    first_name?: string
    last_name?: string
    username?: string
  }
}

export async function POST(request: Request) {
  // Если токен/чат не заданы — тихо выходим, мини-апп продолжает работать.
  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ ok: false, reason: 'not_configured' })
  }

  try {
    const { event, detail, user }: Body = await request.json()
    if (!event) return NextResponse.json({ ok: false })

    const name =
      [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
      'Без имени'
    const username = user?.username ? `@${user.username}` : 'без юзернейма'

    // Первая строка — краткая инфа о пользователе, дальше — событие.
    const text = `${username} · ${name}\n${eventLabel(event, detail)}`

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
