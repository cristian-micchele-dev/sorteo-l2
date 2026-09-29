import type { ReactNode } from 'react'

interface PanelProps {
  readonly title: string
  readonly count?: number
  readonly accent?: 'adena' | 'blood' | 'steel'
  readonly children: ReactNode
  readonly className?: string
}

const accentRing = {
  adena: 'border-adena/30',
  blood: 'border-blood/40',
  steel: 'border-steel',
} as const

const accentText = {
  adena: 'text-adena',
  blood: 'text-ember',
  steel: 'text-ash',
} as const

export const Panel = ({
  title,
  count,
  accent = 'steel',
  children,
  className = '',
}: PanelProps) => (
  <section
    className={`flex min-h-0 flex-col rounded-sm border bg-abyss/92 backdrop-blur-md ${accentRing[accent]} ${className}`}
  >
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-steel/70 px-4 py-2.5">
      <h2
        className={`font-display text-[0.7rem] font-bold tracking-[0.22em] uppercase ${accentText[accent]}`}
      >
        {title}
      </h2>
      {count !== undefined && (
        <span className="rounded-sm border border-steel bg-forge px-2 py-0.5 font-mono text-xs text-ash tabular-nums">
          {count}
        </span>
      )}
    </header>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </section>
)
