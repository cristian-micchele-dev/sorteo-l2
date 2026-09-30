import { memo } from 'react'
import type { Participant } from '../domain/types'
import {
  fitName,
  labelSize,
  slicePath,
  sliceLabel,
  sliceStroke,
} from './wheelGeometry'
import { sliceColor, WINNER_COLOR } from './wheelRing'

interface WheelSlicesProps {
  readonly slices: readonly Participant[]
  readonly winnerSlot: number
  readonly revealing: boolean
}

/**
 * Los sectores de la rueda, memoizados.
 *
 * Esto es lo que hace que el giro sea barato: mientras la rueda da vueltas
 * lo único que cambia es el `transform` del `<svg>` padre. Los sectores no
 * dependen del ángulo, así que sin este `memo` React volvería a construir
 * hasta 64 paths con trigonometría en cada render, para dibujar exactamente
 * lo mismo.
 */
export const WheelSlices = memo(({ slices, winnerSlot, revealing }: WheelSlicesProps) => {
  const count = slices.length
  const stroke = sliceStroke(count)
  const fontSize = labelSize(count)

  return (
    <>
      {slices.map((participant, index) => {
        const won = index === winnerSlot && revealing
        const label = sliceLabel(index, count)

        return (
          <g key={`${participant.id}-${index}`}>
            <path
              d={slicePath(index, count)}
              fill={won ? WINNER_COLOR : sliceColor(index, count)}
              stroke={won ? '#f2cf58' : '#080706'}
              strokeWidth={won ? 3 : stroke}
              className="transition-[fill,stroke] duration-300"
            />
            {count > 1 && (
              <text
                x={label.x}
                y={label.y}
                fill={won ? '#0a0908' : '#e9e0ca'}
                fontSize={fontSize}
                fontWeight={won ? 800 : 600}
                textAnchor={label.anchor}
                dominantBaseline="middle"
                transform={`rotate(${label.rotation.toFixed(2)} ${label.x.toFixed(2)} ${label.y.toFixed(2)})`}
                className="transition-[fill] duration-300"
              >
                {fitName(participant.name, count)}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
})

WheelSlices.displayName = 'WheelSlices'
