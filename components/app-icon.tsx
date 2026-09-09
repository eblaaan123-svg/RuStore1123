import { cn } from '@/lib/utils'

export function AppIcon({
  src,
  name,
  className,
}: {
  src: string
  name: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] border border-border/60 bg-card',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || '/placeholder.svg'}
        alt={`Иконка ${name}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
