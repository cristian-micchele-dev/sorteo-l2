import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  canSpin as canSpinSelector,
  initialRaffleState,
  parseNames,
  raffleReducer,
  selectPhase,
} from '../domain/raffleReducer'
import { cryptoUint32 } from '../domain/rng'
import { loadRaffle, saveRaffle } from './raffleStorage'

/**
 * Cuánto tarda la ruleta en frenar. La usan el reloj del giro Y la
 * transición CSS de la rueda, que la recibe inline: un solo número, sin
 * riesgo de que el reloj y la animación se desincronicen.
 */
export const SPIN_DURATION_MS = 1700

const prefersReducedMotion = (): boolean =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Container: orquesta el reducer, el reloj de la animación y la persistencia.
 * Toda la lógica del sorteo vive en domain/ — acá sólo se coordina.
 */
export const useRaffle = () => {
  const [state, dispatch] = useReducer(raffleReducer, undefined, () => {
    const stored = loadRaffle()
    return stored ? raffleReducer(initialRaffleState, { type: 'HYDRATE', state: stored }) : initialRaffleState
  })

  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    saveRaffle(state)
  }, [state])

  // La ruleta frena sola. Con "reducir movimiento" se revela de una.
  useEffect(() => {
    if (state.status !== 'spinning') return
    const delay = prefersReducedMotion() ? 0 : SPIN_DURATION_MS
    const timer = globalThis.setTimeout(() => dispatch({ type: 'REVEAL' }), delay)
    return () => globalThis.clearTimeout(timer)
  }, [state.status])

  /*
   * El anuncio del ganador NO se cierra solo. Lo cierra quien corre el
   * sorteo: con el clan mirando, un cartel que se va en dos segundos deja
   * gente preguntando "¿quién ganó?".
   */
  const ack = useCallback(() => dispatch({ type: 'ACK' }), [])

  const addItems = useCallback((text: string) => {
    dispatch({ type: 'ADD_ITEMS', names: parseNames(text) })
  }, [])

  const addParticipants = useCallback((text: string) => {
    dispatch({ type: 'ADD_PARTICIPANTS', names: parseNames(text) })
  }, [])

  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', id }), [])

  const removeParticipant = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_PARTICIPANT', id }),
    [],
  )

  const spin = useCallback(() => dispatch({ type: 'SPIN', next: cryptoUint32 }), [])

  const returnToPool = useCallback(
    (winnerId: string) => dispatch({ type: 'RETURN_TO_POOL', winnerId }),
    [],
  )

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const phase = selectPhase(state)

  return useMemo(
    () => ({
      state,
      phase,
      canSpin: canSpinSelector(state),
      nextItem: state.items[0] ?? null,
      lastWinner: state.spotlight ?? state.winners[state.winners.length - 1] ?? null,
      actions: {
        addItems,
        addParticipants,
        removeItem,
        removeParticipant,
        spin,
        ack,
        returnToPool,
        reset,
      },
    }),
    [
      state,
      phase,
      addItems,
      addParticipants,
      removeItem,
      removeParticipant,
      spin,
      ack,
      returnToPool,
      reset,
    ],
  )
}

export type RaffleController = ReturnType<typeof useRaffle>
