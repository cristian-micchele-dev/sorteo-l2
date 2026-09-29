import { useEffect, useRef } from 'react'
import { Button } from '../../../shared/ui/Button'
import type { Item, Winner } from '../domain/types'

interface WinnerAnnouncementProps {
  readonly winner: Winner
  readonly nextItem: Item | null
  readonly onContinue: () => void
}

export const WinnerAnnouncement = ({
  winner,
  nextItem,
  onContinue,
}: WinnerAnnouncementProps) => {
  const continueRef = useRef<HTMLButtonElement>(null)

  // El foco viaja al anuncio: quien usa teclado no queda atrás del cartel.
  useEffect(() => {
    continueRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onContinue()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onContinue])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-name"
      onClick={onContinue}
      className="animate-overlay fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-obsidian/85 px-4 py-6 backdrop-blur-md"
    >
      {/* El click en la tarjeta no cierra: sólo el fondo y el botón. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-slam w-full max-w-2xl rounded-sm border-2 border-adena/50 bg-abyss px-6 py-9 text-center shadow-[0_0_80px_rgba(0,0,0,0.95)] sm:px-12 sm:py-12"
      >
        <p className="font-mono text-[0.6875rem] tracking-[0.38em] text-ember uppercase">
          Ganador
        </p>

        <p
          id="winner-name"
          className="mt-3 font-display text-4xl leading-tight font-bold break-words text-adena-bright sm:text-6xl"
        >
          {winner.participant.name}
        </p>

        <div className="mx-auto mt-6 max-w-md border-t border-steel pt-5">
          <p className="font-mono text-[0.625rem] tracking-[0.28em] text-ash/60 uppercase">
            Se lleva
          </p>
          <p className="mt-1.5 font-display text-xl break-words text-parchment sm:text-2xl">
            {winner.item.name}
          </p>
        </div>

        <Button
          ref={continueRef}
          variant="primary"
          onClick={onContinue}
          className="mt-8 w-full max-w-xs px-6 py-3 text-sm"
        >
          Continuar
        </Button>

        <p className="mt-3 min-h-4 text-xs text-ash/65">
          {nextItem ? (
            <>
              Sigue: <span className="text-parchment">{nextItem.name}</span>
            </>
          ) : (
            'No queda nada por repartir.'
          )}
        </p>
      </div>
    </div>
  )
}
