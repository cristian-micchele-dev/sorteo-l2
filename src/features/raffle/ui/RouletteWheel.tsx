import { useEffect, useMemo, useState } from 'react'
import type { Participant, RafflePhase, Winner } from '../domain/types'
import { SPIN_DURATION_MS } from '../application/useRaffle'
import { buildRing, nextWheelAngle, sliceColor, WINNER_COLOR } from './wheelRing'

interface RouletteWheelProps {
  readonly participants: readonly Participant[]
  readonly phase: RafflePhase
  readonly spotlight: Winner | null
  readonly canSpin: boolean
  readonly onSpin: () => void
}

const RIM = 190
/** El texto arranca pegado al borde y corre hacia el centro. */
const LABEL_RADIUS = 176

/** Ángulo de la ruleta (0 arriba, creciendo en sentido horario) a coordenadas SVG. */
const pointAt = (angle: number, radius: number): [number, number] => {
  const rad = (angle * Math.PI) / 180
  return [radius * Math.sin(rad), -radius * Math.cos(rad)]
}

const slicePath = (index: number, slices: number): string => {
  if (slices === 1) {
    // Un arco no puede cerrar 360°: con un solo candidato la rueda es un disco.
    return `M 0 -${RIM} A ${RIM} ${RIM} 0 1 1 0 ${RIM} A ${RIM} ${RIM} 0 1 1 0 -${RIM} Z`
  }

  const step = 360 / slices
  const [x0, y0] = pointAt(index * step, RIM)
  const [x1, y1] = pointAt((index + 1) * step, RIM)
  const largeArc = step > 180 ? 1 : 0

  return `M 0 0 L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${RIM} ${RIM} 0 ${largeArc} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

/**
 * Nombres largos en sectores finos no entran: se recortan antes de dibujar.
 * El texto corre hacia el centro, y ahí el arco se angosta — por eso el
 * límite baja a medida que crece la cantidad de sectores.
 */
const fitName = (name: string, slices: number): string => {
  if (slices <= 8) return name.length > 15 ? `${name.slice(0, 14)}…` : name
  const max = slices <= 14 ? 12 : slices <= 24 ? 11 : slices <= 40 ? 10 : 8
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

const labelSize = (slices: number): number => {
  if (slices <= 10) return 13
  if (slices <= 16) return 11
  if (slices <= 24) return 9.5
  if (slices <= 32) return 8
  if (slices <= 44) return 7
  if (slices <= 54) return 6.2
  return 5.6
}

/** Con muchos sectores un borde grueso se come el color. */
const sliceStroke = (slices: number): number =>
  slices <= 24 ? 1.5 : slices <= 44 ? 0.8 : 0.5

export const RouletteWheel = ({
  participants,
  phase,
  spotlight,
  canSpin,
  onSpin,
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
  const slices = ring.slices.length
  const step = slices > 0 ? 360 / slices : 0
  const hidden = participants.length - slices

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
        className="group relative aspect-square w-[17rem] rounded-full xl:w-[27rem] transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-adena focus-visible:outline-none enabled:hover:scale-[1.02] disabled:cursor-not-allowed sm:w-[23rem]"
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

          {ring.slices.map((participant, index) => {
            const isWinner = index === ring.winnerSlot
            const won = isWinner && isRevealing
            const middle = (index + 0.5) * step
            /*
             * El texto corre A LO LARGO del radio, del borde hacia el centro.
             * Para eso hay que girarlo 90° menos que el sector. En la mitad
             * izquierda saldría cabeza abajo, así que se voltea y el texto
             * pasa a anclarse por el otro extremo.
             */
            const flip = middle > 180
            const [lx, ly] = pointAt(middle, LABEL_RADIUS)
            const textAngle = flip ? middle + 90 : middle - 90

            return (
              <g key={`${participant.id}-${index}`}>
                <path
                  d={slicePath(index, slices)}
                  fill={won ? WINNER_COLOR : sliceColor(index, slices)}
                  stroke={won ? '#f2cf58' : '#080706'}
                  strokeWidth={won ? 3 : sliceStroke(slices)}
                  className="transition-[fill,stroke] duration-300"
                />
                {slices > 1 && (
                  <text
                    x={lx}
                    y={ly}
                    fill={won ? '#0a0908' : '#e9e0ca'}
                    fontSize={labelSize(slices)}
                    fontWeight={won ? 800 : 600}
                    textAnchor={flip ? 'start' : 'end'}
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle.toFixed(2)} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
                    className="transition-[fill] duration-300"
                  >
                    {fitName(participant.name, slices)}
                  </text>
                )}
              </g>
            )
          })}

          {/* Sombra del borde: le da profundidad al plato. */}
          <circle r={RIM} fill="url(#wheel-depth)" pointerEvents="none" />
          <circle r={RIM} fill="none" stroke="#c9a227" strokeOpacity="0.4" strokeWidth="4" />
          <circle r={RIM - 7} fill="none" stroke="#080706" strokeOpacity="0.7" strokeWidth="2" />
        </svg>

        {/* El agujero del centro: qué hacer, o quién ganó. */}
        <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="flex size-28 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-steel bg-obsidian px-2 text-center shadow-[0_0_28px_rgba(0,0,0,0.95)] sm:size-32">
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
          La ruleta muestra {slices} de {participants.length}: entran todos al sorteo, no todos
          caben en el dibujo.
        </p>
      )}
    </div>
  )
}
