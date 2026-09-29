import type { Participant } from '../domain/types'

/**
 * Tope de sectores dibujados. El texto corre A LO LARGO del radio, así que
 * lo que lo limita es el ANCHO del sector, no su largo: con 40 sectores el
 * arco sigue midiendo unos 28px donde arranca el nombre, de sobra para la
 * tipografía chica. Un clan de 30 o 35 entra entero.
 */
export const MAX_SLICES = 40

/**
 * Diez colores para los sectores: diez matices repartidos cada 36° del
 * círculo cromático, todos a la misma luminosidad baja (20–24%).
 *
 * El reparto parejo NO es capricho. Con tonos elegidos "a ojo" terminás con
 * tres rojos y dos violetas que a simple vista son el mismo color, y en una
 * rueda de 30 sectores eso se lee como sectores repetidos.
 */
export const SLICE_COLORS = [
  '#5c1f1f', // rojo ladrillo
  '#5c431f', // ocre
  '#49541c', // oliva
  '#244d1a', // verde bosque
  '#1b4b33', // esmeralda profundo
  '#1a474d', // petróleo
  '#1f375c', // azul medianoche
  '#2c205b', // índigo
  '#4e2259', // púrpura
  '#5b2043', // magenta oscuro
] as const

/** El sector que ganó: oro, para que no haya que buscarlo. */
export const WINNER_COLOR = '#c9a227'

/**
 * Color de un sector. Rota la paleta, pero corrige el caso en que el último
 * sector quedaría pegado al primero con el mismo color: en un círculo el
 * final ES vecino del principio, y dos sectores iguales juntos se leen como
 * uno solo.
 */
export const sliceColor = (index: number, slices: number): string => {
  const total = SLICE_COLORS.length
  if (slices > total && slices % total === 1 && index === slices - 1) {
    return SLICE_COLORS[Math.floor(total / 2)]!
  }
  return SLICE_COLORS[index % total]!
}

/**
 * Vueltas completas garantizadas antes de frenar.
 *
 * Con 1, el giro total queda entre UNA y DOS vueltas: la vuelta fija más lo
 * que falte para alcanzar al sector ganador. Esa variación es gratis y hace
 * que no se sienta siempre igual.
 */
const FULL_SPINS = 1

export interface WheelRing {
  readonly slices: readonly Participant[]
  /** Índice del sector ganador, o -1 si todavía no hay resultado. */
  readonly winnerSlot: number
}

/**
 * Arma los sectores visibles de la ruleta.
 *
 * Con pozos grandes NO entran todos: se muestra una ventana que SIEMPRE
 * incluye al ganador. Esto es puro decorado — el ganador ya lo decidió el
 * dominio antes de que la rueda arranque.
 */
export const buildRing = (
  participants: readonly Participant[],
  winnerId: string | null,
): WheelRing => {
  const winnerIndex = winnerId ? participants.findIndex((p) => p.id === winnerId) : -1

  if (participants.length <= MAX_SLICES) {
    return { slices: [...participants], winnerSlot: winnerIndex }
  }

  if (winnerIndex === -1) {
    return { slices: participants.slice(0, MAX_SLICES), winnerSlot: -1 }
  }

  const slot = winnerIndex % MAX_SLICES
  const total = participants.length
  const slices = Array.from(
    { length: MAX_SLICES },
    (_, i) => participants[(((winnerIndex + i - slot) % total) + total) % total]!,
  )

  return { slices, winnerSlot: slot }
}

/**
 * Próximo ángulo de la ruleta: acumula vueltas hacia adelante y frena con el
 * CENTRO del sector ganador bajo el puntero (los 0 grados, arriba).
 *
 * Apuntar al centro y no al borde importa: si frenara en el límite entre dos
 * sectores, el puntero quedaría ambiguo y el resultado, discutible.
 */
export const nextWheelAngle = (current: number, winnerSlot: number, slices: number): number => {
  if (slices <= 0 || winnerSlot < 0) return current

  const middle = ((winnerSlot + 0.5) * 360) / slices
  const target = ((-middle % 360) + 360) % 360
  const currentTurn = ((current % 360) + 360) % 360
  const catchUp = (((target - currentTurn) % 360) + 360) % 360

  return current + FULL_SPINS * 360 + catchUp
}
