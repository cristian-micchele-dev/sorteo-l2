import { useEffect } from 'react'
import { Button } from '../../../shared/ui/Button'
import { ClanCrestInline } from '../../../shared/ui/ClanCrest'
import type { Item, Participant, RafflePhase, Winner } from '../domain/types'
import { RouletteWheel } from './RouletteWheel'

interface PresentationStageProps {
  readonly participants: readonly Participant[]
  readonly winners: readonly Winner[]
  readonly nextItem: Item | null
  readonly remaining: number
  readonly phase: RafflePhase
  readonly spotlight: Winner | null
  readonly canSpin: boolean
  readonly onSpin: () => void
  readonly onExit: () => void
}

export const PresentationStage = ({
  participants,
  winners,
  nextItem,
  remaining,
  phase,
  spotlight,
  canSpin,
  onSpin,
  onExit,
}: PresentationStageProps) => {
  /*
   * Con el clan mirando por Discord, el mouse sobra: Espacio gira y Escape
   * sale. Mientras el anuncio del ganador está abierto, el foco lo tiene su
   * botón y Espacio lo activa solo — por eso acá no hace falta tocarlo.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onExit()
        return
      }

      if (event.key === ' ' && canSpin) {
        event.preventDefault()
        onSpin()
      }
    }

    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [canSpin, onSpin, onExit])

  const finished = phase === 'finished'

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-obsidian/92 backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-steel/60 px-5 py-2.5">
        <ClanCrestInline />
        <Button onClick={onExit} title="Salir del modo presentación (Escape)">
          Salir
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-3">
        <div className="shrink-0 text-center">
          <p className="font-mono text-[0.6875rem] tracking-[0.3em] text-ash/60 uppercase">
            {nextItem ? 'Se juega' : 'Nada en juego'}
          </p>
          <p className="mt-1 font-display text-2xl font-bold break-words text-adena-bright sm:text-3xl">
            {nextItem ? nextItem.name : '—'}
          </p>
        </div>

        <RouletteWheel
          participants={participants}
          phase={phase}
          spotlight={spotlight}
          canSpin={canSpin}
          onSpin={onSpin}
          stage
        />

        <p className="min-h-5 shrink-0 text-center text-sm text-ash/70">
          {finished ? (
            'Reparto terminado.'
          ) : canSpin ? (
            <>
              <kbd className="rounded-xs border border-steel bg-forge px-1.5 py-0.5 font-mono text-xs text-parchment">
                Espacio
              </kbd>{' '}
              para girar
            </>
          ) : (
            ' '
          )}
        </p>
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-steel/60 px-5 py-2 text-xs">
        <span className="font-mono tracking-[0.16em] text-ash/50 uppercase">
          Pozo {participants.length} · Quedan {remaining}
        </span>
        {winners.map((winner) => (
          <span key={winner.id} className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-adena-bright">
              {winner.participant.name}
            </span>
            <span className="text-ash/35">←</span>
            <span className="text-ash">{winner.item.name}</span>
          </span>
        ))}
      </footer>
    </div>
  )
}
