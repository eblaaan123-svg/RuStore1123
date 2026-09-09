'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import {
  X,
  ChevronRight,
  Clock,
  Lock,
  Info,
  MessageSquare,
  Check,
  LogOut,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { haptic, openSupport } from '@/components/telegram-init'
import { SUPPORT_URL } from '@/lib/custom-apps'
import { logEvent } from '@/lib/log'

type Step = null | 'appleid' | 'instructions' | 'confirm' | 'support'

const InstallFlowContext = createContext<{
  startInstall: () => void
}>({ startInstall: () => {} })

export function useInstallFlow() {
  return useContext(InstallFlowContext)
}

export function InstallFlowProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [step, setStep] = useState<Step>(null)

  const startInstall = useCallback(() => {
    haptic('medium')
    logEvent('install_start')
    setStep('appleid')
  }, [])

  const close = useCallback(() => {
    haptic('light')
    setStep(null)
  }, [])

  return (
    <InstallFlowContext.Provider value={{ startInstall }}>
      {children}

      {step === 'appleid' && (
        <AppleIdSheet
          onClose={close}
          onInstructions={() => {
            haptic('light')
            setStep('instructions')
          }}
          onPrepare={() => {
            haptic('medium')
            setStep('confirm')
          }}
        />
      )}

      {step === 'instructions' && (
        <InstructionsSheet
          onDone={() => {
            haptic('light')
            setStep('appleid')
          }}
        />
      )}

      {step === 'confirm' && (
        <ConfirmSheet
          onClose={close}
          onConfirm={() => {
            haptic('medium')
            setStep('support')
          }}
        />
      )}

      {step === 'support' && (
        <SupportSheet
          onClose={close}
          onSupport={() => {
            logEvent('support')
            openSupport(SUPPORT_URL)
            setStep(null)
          }}
        />
      )}
    </InstallFlowContext.Provider>
  )
}

// ─── Общая обёртка модалки: центрированная плавающая карточка ────────────────
function Sheet({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
      />
      <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFEFF4] text-[#8A8A8E] transition-transform active:scale-90"
    >
      <X className="h-5 w-5" />
    </button>
  )
}

// ─── Шаг 1: Временный вход в Apple ID ────────────────────────────────────────
function AppleIdSheet({
  onClose,
  onInstructions,
  onPrepare,
}: {
  onClose: () => void
  onInstructions: () => void
  onPrepare: () => void
}) {
  return (
    <Sheet onClose={onClose}>
      {/* Скроллящееся тело */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[27px] font-extrabold leading-tight text-[#1C1C1E] text-balance">
            Временный вход в Apple ID
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="mt-4 space-y-4 rounded-3xl bg-[#F2F2F7] p-5 text-[15px] leading-relaxed text-[#3C3C43]">
          <p>
            Для установки данного приложения на ваш iPhone необходимо выполнить
            временный вход в наш общий аккаунт iCloud (Apple ID).
          </p>
          <p>
            Следуйте простым шагам для выхода из текущего Apple ID и входа в
            новый аккаунт.
          </p>
          <p>
            После выхода нажмите кнопку «Подготовить аккаунт» ниже и введите
            данные нового аккаунта. У вас будет 10 минут для входа.
          </p>
        </div>

        {/* Инфо-карточки */}
        <InfoCard
          icon={<Clock className="h-6 w-6 text-[#0A84FF]" />}
          title="10 минут на установку"
          desc="Этого достаточно, чтобы установить приложение"
        />
        <InfoCard
          icon={<Lock className="h-6 w-6 text-[#0A84FF]" />}
          title="Ваши данные в безопасности"
          desc="Аккаунт используется временно только для установки"
        />

        {/* Ссылка на инструкцию */}
        <button
          type="button"
          onClick={onInstructions}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-[#E5E5EA] px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A84FF]">
            <Info className="h-5 w-5 text-white" />
          </span>
          <span className="flex-1 text-[16px] font-bold text-[#1C1C1E]">
            Инструкция как выйти
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
        </button>
      </div>

      {/* Зафиксированный футер с действиями */}
      <div className="px-5 pb-6 pt-4">
        <button
          type="button"
          onClick={onPrepare}
          className="w-full rounded-2xl bg-[#0A84FF] py-4 text-[17px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          Подготовить аккаунт
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-[#E5E5EA] py-4 text-[17px] font-bold text-[#1C1C1E] transition-transform active:scale-[0.98]"
        >
          Закрыть
        </button>
      </div>
    </Sheet>
  )
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="mt-4 flex items-center gap-4 rounded-3xl bg-[#F2F2F7] p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A84FF]/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-bold text-[#1C1C1E]">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-[#8A8A8E]">{desc}</p>
      </div>
    </div>
  )
}

function SafetyPoint({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A84FF]/10">
        {icon}
      </span>
      <p className="flex-1 text-[14px] leading-snug text-[#3C3C43]">{text}</p>
    </div>
  )
}

// ─── Шаг 2: Инструкция по установке ──────────────────────────────────────────
const STEPS = [
  'Откройте приложение «Настройки» на вашем iPhone',
  'Нажмите на ваше имя в верхней части экрана',
  'Прокрутите вниз и выберите «Выйти»',
  'Введите пароль вашего текущего Apple ID',
  'Подтвердите выход, выбрав «Выйти» в правом верхнем углу',
  'После выхода нажмите кнопку «Подготовить аккаунт» ниже и введите данные нового аккаунта. У вас будет 10 минут для входа',
]

function InstructionsSheet({ onDone }: { onDone: () => void }) {
  return (
    <Sheet onClose={onDone}>
      {/* Скроллящееся тело */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        <h2 className="text-[30px] font-extrabold leading-tight text-[#1C1C1E] text-balance">
          Инструкция по установке
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-[#8A8A8E]">
          Следуйте простым шагам для выхода из текущего Apple ID и входа в новый
          аккаунт.
        </p>

        <ol className="mt-6 divide-y divide-[#E5E5EA]">
          {STEPS.map((text, i) => (
            <li key={i} className="flex items-start gap-4 py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A84FF]/10 text-[16px] font-bold text-[#0A84FF]">
                {i + 1}
              </span>
              <span className="pt-1 text-[17px] leading-snug text-[#1C1C1E]">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Зафиксированный футер */}
      <div className="px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-2xl bg-[#0A84FF] py-4 text-[17px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          Понятно
        </button>
      </div>
    </Sheet>
  )
}

// ─── Шаг 3: Подтверждение выхода из Apple ID ─────────────────────────────────
function ConfirmSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  const [checked, setChecked] = useState(false)

  return (
    <Sheet onClose={onClose}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[26px] font-extrabold leading-tight text-[#1C1C1E] text-balance">
            Подтвердите выход
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A84FF]/10">
            <LogOut className="h-9 w-9 text-[#0A84FF]" strokeWidth={2} />
          </div>
          <p className="mt-5 max-w-xs text-[16px] leading-relaxed text-[#3C3C43] text-pretty">
            Перед подготовкой аккаунта убедитесь, что вы вышли из своего
            текущего Apple ID (iCloud) на этом iPhone.
          </p>
        </div>

        {/* Чекбокс-подтверждение */}
        <button
          type="button"
          onClick={() => {
            haptic('light')
            setChecked((v) => !v)
          }}
          aria-pressed={checked}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-[#E5E5EA] px-4 py-4 text-left transition-transform active:scale-[0.99]"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
              checked
                ? 'border-[#0A84FF] bg-[#0A84FF]'
                : 'border-[#C7C7CC] bg-white'
            }`}
          >
            {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
          </span>
          <span className="flex-1 text-[16px] font-semibold leading-snug text-[#1C1C1E]">
            Я вышел из своего Apple ID (iCloud)
          </span>
        </button>

        {/* Почему это безопасно */}
        <div className="mt-6 rounded-3xl bg-[#F2F2F7] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#34C759]" strokeWidth={2.2} />
            <p className="text-[16px] font-bold text-[#1C1C1E]">
              Почему это безопасно
            </p>
          </div>
          <div className="mt-3 space-y-3">
            <SafetyPoint
              icon={<EyeOff className="h-4 w-4 text-[#0A84FF]" />}
              text="Мы не видим и не храним данные вашего личного аккаунта"
            />
            <SafetyPoint
              icon={<KeyRound className="h-4 w-4 text-[#0A84FF]" />}
              text="Вам не нужно нигде вводить свой пароль от личного Apple ID"
            />
            <SafetyPoint
              icon={<Clock className="h-4 w-4 text-[#0A84FF]" />}
              text="Общий аккаунт используется только на время установки"
            />
          </div>
        </div>
      </div>

      {/* Зафиксированный футер */}
      <div className="px-6 pb-7 pt-6">
        <button
          type="button"
          disabled={!checked}
          onClick={onConfirm}
          className="w-full rounded-2xl bg-[#0A84FF] py-4 text-[17px] font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#C7C7CC] disabled:active:scale-100"
        >
          Продолжить
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-[#E5E5EA] py-4 text-[17px] font-bold text-[#1C1C1E] transition-transform active:scale-[0.98]"
        >
          Закрыть
        </button>
      </div>
    </Sheet>
  )
}

// ─── Шаг 4: Получение данных через поддержку ─────────────────────────────────
function SupportSheet({
  onClose,
  onSupport,
}: {
  onClose: () => void
  onSupport: () => void
}) {
  return (
    <Sheet onClose={onClose}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[26px] font-extrabold text-[#1C1C1E]">
            Почти готово
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0A84FF]/10">
            <MessageSquare
              className="h-11 w-11 text-[#0A84FF]"
              strokeWidth={2}
            />
          </div>

          <h3 className="mt-5 text-[22px] font-extrabold leading-tight text-[#1C1C1E] text-balance">
            Напишите в поддержку за данными аккаунта
          </h3>
          <p className="mt-2 max-w-xs text-[16px] leading-relaxed text-[#8A8A8E] text-pretty">
            Напишите в поддержку мини-аппа, чтобы получить данные для входа —
            ответ придёт в течение 5 минут.
          </p>
        </div>

        {/* Плашка со временем ответа */}
        <div className="mt-6 flex items-center gap-4 rounded-3xl bg-[#F2F2F7] p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A84FF]/10">
            <Clock className="h-6 w-6 text-[#0A84FF]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[16px] font-bold text-[#1C1C1E]">
                Ответ в течение 5 минут
              </p>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#34C759]/10 px-2 py-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34C759] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34C759]" />
                </span>
                <span className="text-xs font-semibold text-[#248A3D]">
                  Онлайн
                </span>
              </span>
            </div>
            <p className="mt-0.5 text-sm leading-snug text-[#8A8A8E]">
              Оператор пришлёт данные для входа в аккаунт
            </p>
          </div>
        </div>
      </div>

      {/* Зафиксированный футер */}
      <div className="px-6 pb-7 pt-6">
        <button
          type="button"
          onClick={onSupport}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#0A84FF] py-4 text-[17px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          <MessageSquare className="h-5 w-5" />
          Написать в поддержку
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-[#E5E5EA] py-4 text-[17px] font-bold text-[#1C1C1E] transition-transform active:scale-[0.98]"
        >
          Закрыть
        </button>
      </div>
    </Sheet>
  )
}
