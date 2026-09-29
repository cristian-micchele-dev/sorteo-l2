/**
 * Contratos del dominio del sorteo.
 * Esta carpeta no sabe que React existe.
 */

export interface Item {
  readonly id: string
  readonly name: string
}

export interface Participant {
  readonly id: string
  readonly name: string
}

/** Una asignación resuelta: este item quedó para esta persona. */
export interface Winner {
  readonly id: string
  readonly item: Item
  readonly participant: Participant
}

/**
 * Sólo los estados del GIRO se guardan. `ready`/`empty`/`finished` se derivan
 * de las listas — guardarlos sería permitir estados imposibles.
 */
export type SpinStatus = 'idle' | 'spinning' | 'revealing'

export type RafflePhase = 'empty' | 'ready' | 'spinning' | 'revealing' | 'finished'

export interface RaffleState {
  readonly status: SpinStatus
  readonly items: readonly Item[]
  readonly participants: readonly Participant[]
  readonly winners: readonly Winner[]
  /** Resultado ya decidido por el dominio, en pantalla mientras gira la ruleta. */
  readonly spotlight: Winner | null
  /** Contador para ids estables. Mantiene al reducer puro y a los tests legibles. */
  readonly seq: number
}

/** Fuente de azar: enteros uniformes en [0, 2^32). */
export type RandomSource = () => number
