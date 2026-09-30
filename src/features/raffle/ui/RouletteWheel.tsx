import { useEffect, useMemo, useState } from 'react'
import { SPIN_DURATION_MS } from '../application/useRaffle'
import type { Participant, RafflePhase, Winner } from '../domain/types'
import { RIM } from './wheelGeometry'
import { buildRing, nextWheelAngle } from './wheelRing'
import { WheelSlices } from './WheelSlices'

interface RouletteWheelProps {
  readonly participants: readonly Participant[]
  readonly phase: RafflePhase
  readonly spotlight: Winner | null
  readonly canSpin: boolean
  readonly onSpin: () => void
  /** En el escenario la rueda manda: crece con el alto de la pantalla. */
  readonly stage?: boolean
}

export const RouletteWheel = ({
  participants,
  phase,
  spotlight,
  canSpin,
  onSpin,
  stage = false,
}: RouletteWheelProps) => {
  const [angle, setAngle] = useState(0)

  const ring = useMemo(
    () => buildRing(participants, spotlight?.participant.id ?? null),
    [participants, spotlight],
  )

  /*
   * La ruleta persigue al ganador que el dominio YA eligió. El giro nunca
   * decide nada: sólo va a buscar el sector correcto.
   */
  useEffect(() => {
    if (phase !== 'spinning' || ring.winnerSlot < 0) return
    setAngle((current) => nextWheelAngle(current, ring.winnerSlot, ring.slices.length))
  }, [phase, ring.winnerSlot, ring.slices.length])

  const isSpinning = phase === 'spinning'
  const isRevealing = phase === 'revealing'
  const hidden = participants.length - ring.slices.length

  return (
    <div className="flex flex-col items-center gap-3">
      {/*
        La rueda ENTERA es el botón, como en cualquier ruleta de sorteos:
        el gesto natural es tocar la rueda, no buscar un botón aparte.
      */}
      <button
        type="button"
        disabled={!canSpin}
        onClick={onSpin}
        aria-label="Girar la ruleta"
        className={`group relative aspect-square rounded-full transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-adena focus-visible:outline-none enabled:hover:scale-[1.02] disabled:cursor-not-allowed ${
          stage ? 'w-[min(72vh,44rem)]' : 'w-[17rem] sm:w-[23rem] xl:w-[27rem]'
        }`}
      >
        {/* Puntero fijo: la ruleta gira, él no. Marca los cero grados. */}
        <span className="absolute top-0 left-1/2 z-30 -translate-x-1/2 -translate-y-1.5">
          <span
            className={`block h-0 w-0 border-x-[11px] border-t-[20px] border-x-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
              isRevealing ? 'border-t-ember' : 'border-t-adena'
            }`}
          />
        </span>

        <svg
          viewBox="-200 -200 400 400"
          className={`wheel absolute inset-0 size-full ${canSpin ? 'animate-ember rounded-full' : ''}`}
          style={{ transform: `rotate(${angle}deg)`, transitionDuration: `${SPIN_DURATION_MS}ms` }}
          role="presentation"
        >
          <defs>
            <radialGradient id="wheel-depth" cx="50%" cy="50%" r="50%">
              <stop offset="58%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          <WheelSlices
            slices={ring.slices}
            winnerSlot={ring.winnerSlot}
            revealing={isRevealing}
          />

          {/* Sombra del borde: le da profundidad al plato. */}
          <circle r={RIM} fill="url(#wheel-depth)" pointerEvents="none" />
          <circle r={RIM} fill="none" stroke="#c9a227" strokeOpacity="0.4" strokeWidth="4" />
          <circle r={RIM - 7} fill="none" stroke="#080706" strokeOpacity="0.7" strokeWidth="2" />
        </svg>

        {/* El agujero del centro: qué hacer, o quién ganó. */}
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span
            className={`flex flex-col items-center justify-center gap-0.5 rounded-full border-2 border-steel bg-obsidian px-2 text-center shadow-[0_0_28px_rgba(0,0,0,0.95)] ${
              stage ? 'size-40 sm:size-48' : 'size-28 sm:size-32'
            }`}
          >
            {isRevealing && spotlight ? (
              <span className="animate-slam font-display text-sm leading-tight font-bold break-words text-adena-bright sm:text-base">
                {spotlight.participant.name}
              </span>
            ) : isSpinning ? (
              <span className="font-display text-xs tracking-[0.2em] text-ember uppercase">
                girando
              </span>
            ) : canSpin ? (
              <span className="font-display text-lg font-bold tracking-[0.12em] text-adena-bright uppercase transition-colors group-hover:text-parchment sm:text-xl">
                Girar
              </span>
            ) : (
              <>
                <span className="font-mono text-[0.5625rem] tracking-[0.18em] text-ash/60 uppercase">
                  en el pozo
                </span>
                <span className="font-display text-2xl font-bold text-parchment tabular-nums">
                  {participants.length}
                </span>
              </>
            )}
          </span>
        </span>

        {/* Fogonazo del disparo */}
        {isRevealing && spotlight && (
          <span
            key={spotlight.id}
            className="animate-flash pointer-events-none absolute inset-0 z-10 rounded-full bg-radial from-ember/60 via-blood/20 to-transparent"
          />
        )}
      </button>

      {hidden > 0 && (
        <p className="text-center text-[0.6875rem] text-ash/55">
          La ruleta muestra {ring.slices.length} de {participants.length}: entran todos al
          sorteo, no todos caben en el dibujo.
        </p>
      )}
    </div>
  )
}
