import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { Panel } from '../../../shared/ui/Panel'
import type { Winner } from '../domain/types'
import { formatSpoils } from './formatSpoils'

interface WinnersPanelProps {
  readonly winners: readonly Winner[]
  readonly locked: boolean
  readonly onReturnToPool: (winnerId: string) => void
}

export const WinnersPanel = ({ winners, locked, onReturnToPool }: WinnersPanelProps) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatSpoils(winners))
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Panel title="Ganadores" count={winners.length} accent="blood" className="min-h-0">
      {winners.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs leading-relaxed text-ash/60 italic">
          Nadie se llevó nada todavía. Cada giro paga un item y saca a esa persona del pozo.
        </p>
      ) : (
        <>
          <ol className="min-h-0 flex-1 overflow-y-auto">
            {winners.map((winner, index) => (
              <li
                key={winner.id}
                className="group animate-enter border-b border-steel/40 px-3 py-2.5 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 font-mono text-[0.625rem] text-ash/45 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-adena-bright">
                    {winner.participant.name}
                  </span>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => onReturnToPool(winner.id)}
                    title="Deshacer: devuelve el item a la cola y la persona al pozo"
                    aria-label={`Deshacer la asignación de ${winner.item.name} a ${winner.participant.name}`}
                    className="shrink-0 rounded-sm px-1.5 text-ash/40 opacity-0 transition hover:text-ember focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    ↺
                  </button>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 pl-7">
                  <span className="text-ash/40">└</span>
                  <span className="min-w-0 truncate text-xs text-ash" title={winner.item.name}>
                    {winner.item.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <footer className="shrink-0 border-t border-steel/70 p-3">
            <Button onClick={copy} className="w-full">
              {copied ? '✓ Copiado' : 'Copiar reparto'}
            </Button>
          </footer>
        </>
      )}
    </Panel>
  )
}
