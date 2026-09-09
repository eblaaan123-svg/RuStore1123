const banners = [
  {
    id: 'b1',
    subtitle: 'Коллекция недели',
    title: 'Приложения, без которых сложно',
    from: '#0062F5',
    to: '#3B8CFF',
  },
  {
    id: 'b2',
    subtitle: 'Только в RuStore',
    title: 'Российские сервисы и госуслуги',
    from: '#1FA971',
    to: '#37D399',
  },
  {
    id: 'b3',
    subtitle: 'Играй бесплатно',
    title: 'Топовые игры этого месяца',
    from: '#F5820B',
    to: '#FFB443',
  },
  {
    id: 'b4',
    subtitle: 'Подборка редакции',
    title: 'Банки, платежи и финансы',
    from: '#6D3BF5',
    to: '#9B6BFF',
  },
]

export function BannerCarousel() {
  return (
    <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {banners.map((b) => (
        <article
          key={b.id}
          className="relative flex h-40 w-64 shrink-0 flex-col justify-end overflow-hidden rounded-3xl p-4"
          style={{
            backgroundImage: `linear-gradient(135deg, ${b.from}, ${b.to})`,
          }}
        >
          <p className="text-xs font-semibold text-white/80">{b.subtitle}</p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-white text-balance">
            {b.title}
          </h3>
        </article>
      ))}
    </div>
  )
}
