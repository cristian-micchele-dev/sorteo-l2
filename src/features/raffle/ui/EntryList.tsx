import type { ReactNode } from 'react'

export interface Entry {
  readonly id: string
  readonly name: string
  readonly badge?: ReactNode
  readonly note?: string
}

interface EntryListProps {
  readonly entries: readonly Entry[]
  readonly emptyHint: string
  readonly onRemove?: (id: string) => void
  readonly removeLabel?: string
  readonly disabled?: boolean
  readonly highlightFirst?: boolean
}

export const EntryList = ({
  entries,
  emptyHint,
  onRemove,
  removeLabel = 'Quitar',
  disabled = false,
  highlightFirst = false,
}: EntryListProps) => {
  if (entries.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs leading-relaxed text-ash/60 italic">{emptyHint}</p>
    )
  }

  return (
    <ul className="min-h-0 flex-1 overflow-y-auto">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className={`group flex items-center gap-2 border-b border-steel/40 px-3 py-2 last:border-b-0 ${
            highlightFirst && index === 0 ? 'bg-adena/8' : ''
          }`}
        >
          <span className="w-5 shrink-0 font-mono text-[0.625rem] text-ash/45 tabular-nums">
            {index + 1}
          </span>
          {entry.badge}
          <span className="min-w-0 flex-1 truncate text-sm text-parchment" title={entry.name}>
            {entry.name}
          </span>
          {entry.note && (
            <span className="shrink-0 font-mono text-[0.625rem] tracking-wider text-ash/70 uppercase">
              {entry.note}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(entry.id)}
              aria-label={`${removeLabel}: ${entry.name}`}
              title={removeLabel}
              className="shrink-0 rounded-sm px-1.5 text-ash/40 opacity-0 transition hover:text-ember focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
