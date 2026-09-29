import { drawWinner } from './drawWinner'
import type {
  Item,
  Participant,
  RafflePhase,
  RaffleState,
  RandomSource,
} from './types'

export type RaffleAction =
  | { type: 'ADD_ITEMS'; names: readonly string[] }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'ADD_PARTICIPANTS'; names: readonly string[] }
  | { type: 'REMOVE_PARTICIPANT'; id: string }
  | { type: 'SPIN'; next: RandomSource }
  | { type: 'REVEAL' }
  | { type: 'ACK' }
  | { type: 'RETURN_TO_POOL'; winnerId: string }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: RaffleState }

export const initialRaffleState: RaffleState = {
  status: 'idle',
  items: [],
  participants: [],
  winners: [],
  spotlight: null,
  seq: 0,
}

/** Dos nombres son el mismo si sólo se diferencian en espacios o mayúsculas. */
const normalize = (name: string): string => name.trim().toLowerCase()

/**
 * Convierte el pegado de un chat en nombres. Nadie va a tipear 40 nicks
 * de a uno: se pegan separados por saltos de línea, comas o punto y coma.
 */
export const parseNames = (text: string): string[] =>
  text
    .split(/[\n,;]+/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

export const canSpin = (state: RaffleState): boolean =>
  state.status === 'idle' && state.items.length > 0 && state.participants.length > 0

/**
 * La fase visible se DERIVA. Guardarla sería aceptar estados imposibles,
 * como un sorteo "terminado" con items todavía en la cola.
 */
export const selectPhase = (state: RaffleState): RafflePhase => {
  if (state.status !== 'idle') return state.status
  if (state.items.length > 0 && state.participants.length > 0) return 'ready'
  return state.winners.length > 0 ? 'finished' : 'empty'
}

export const raffleReducer = (state: RaffleState, action: RaffleAction): RaffleState => {
  switch (action.type) {
    // Cargar y descargar sólo se permite con la ruleta quieta.
    case 'ADD_ITEMS': {
      if (state.status !== 'idle') return state

      const names = action.names.map((name) => name.trim()).filter(Boolean)
      if (names.length === 0) return state

      // Los items repetidos SÍ valen: en un raid caen dos Draco Leather iguales.
      let seq = state.seq
      const added: Item[] = names.map((name) => ({ id: `i${seq++}`, name }))

      return { ...state, items: [...state.items, ...added], seq }
    }

    case 'ADD_PARTICIPANTS': {
      if (state.status !== 'idle') return state

      // Una persona, un ticket. Y quien ya ganó no vuelve a entrar:
      // para eso está RETURN_TO_POOL, que es explícito y auditable.
      const taken = new Set([
        ...state.participants.map((p) => normalize(p.name)),
        ...state.winners.map((w) => normalize(w.participant.name)),
      ])

      let seq = state.seq
      const added: Participant[] = []
      for (const raw of action.names) {
        const name = raw.trim()
        const key = normalize(name)
        if (name.length === 0 || taken.has(key)) continue
        taken.add(key)
        added.push({ id: `p${seq++}`, name })
      }

      if (added.length === 0) return state
      return { ...state, participants: [...state.participants, ...added], seq }
    }

    case 'REMOVE_ITEM': {
      if (state.status !== 'idle') return state
      const items = state.items.filter((item) => item.id !== action.id)
      return items.length === state.items.length ? state : { ...state, items }
    }

    case 'REMOVE_PARTICIPANT': {
      if (state.status !== 'idle') return state
      const participants = state.participants.filter((p) => p.id !== action.id)
      return participants.length === state.participants.length ? state : { ...state, participants }
    }

    /**
     * Decide el ganador y arranca el giro. Los pozos quedan INTACTOS:
     * si sacáramos el nombre del pozo ahora, la lista spoilearía el
     * resultado antes de que la ruleta frene.
     */
    case 'SPIN': {
      if (!canSpin(state)) return state

      const item = state.items[0]!
      const participant = drawWinner(state.participants, action.next)

      return { ...state, status: 'spinning', spotlight: { id: item.id, item, participant } }
    }

    /** La ruleta frenó: recién acá se paga el item y el ganador sale del pozo. */
    case 'REVEAL': {
      if (state.status !== 'spinning' || state.spotlight === null) return state

      const { spotlight } = state
      return {
        ...state,
        status: 'revealing',
        items: state.items.filter((item) => item.id !== spotlight.item.id),
        participants: state.participants.filter((p) => p.id !== spotlight.participant.id),
        winners: [...state.winners, spotlight],
      }
    }

    case 'ACK': {
      if (state.status !== 'revealing') return state
      return { ...state, status: 'idle', spotlight: null }
    }

    /** Deshacer una asignación: el clásico "pará, ese ya no está en el clan". */
    case 'RETURN_TO_POOL': {
      if (state.status !== 'idle') return state

      const winner = state.winners.find((w) => w.id === action.winnerId)
      if (!winner) return state

      return {
        ...state,
        winners: state.winners.filter((w) => w.id !== action.winnerId),
        items: [...state.items, winner.item],
        participants: [...state.participants, winner.participant],
      }
    }

    /*
     * El contador de ids NO vuelve a cero: reusar ids viejos sería pedir
     * problemas si un ganador anterior sigue referenciado en algún lado.
     */
    case 'RESET':
      return { ...initialRaffleState, seq: state.seq }

    /**
     * Nunca se restaura un giro a medias: si se recargó la página en pleno
     * giro, ese giro no pasó.
     */
    case 'HYDRATE':
      return { ...action.state, status: 'idle', spotlight: null }
  }
}
