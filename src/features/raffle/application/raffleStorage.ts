import type { Item, Participant, RaffleState, Winner } from '../domain/types'

const STORAGE_KEY = 'ruleta-rusa-l2:v1'

/**
 * localStorage es entrada NO confiable: lo edita cualquiera desde devtools y
 * sobrevive a versiones viejas del código. Todo lo que entra se valida.
 */
const isItem = (value: unknown): value is Item => {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.name === 'string'
}

const isParticipant = (value: unknown): value is Participant => {
  if (typeof value !== 'object' || value === null) return false
  const participant = value as Record<string, unknown>
  return typeof participant.id === 'string' && typeof participant.name === 'string'
}

const isWinner = (value: unknown): value is Winner => {
  if (typeof value !== 'object' || value === null) return false
  const winner = value as Record<string, unknown>
  return (
    typeof winner.id === 'string' && isItem(winner.item) && isParticipant(winner.participant)
  )
}

/** Devuelve el sorteo guardado, o null si no hay nada usable. */
export const loadRaffle = (): RaffleState | null => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const candidate = parsed as Record<string, unknown>
    const items = Array.isArray(candidate.items) ? candidate.items.filter(isItem) : []
    const participants = Array.isArray(candidate.participants)
      ? candidate.participants.filter(isParticipant)
      : []
    const winners = Array.isArray(candidate.winners) ? candidate.winners.filter(isWinner) : []
    const seq = typeof candidate.seq === 'number' && Number.isFinite(candidate.seq) ? candidate.seq : 0

    if (items.length === 0 && participants.length === 0 && winners.length === 0) return null

    // El status y el foco los normaliza el reducer al hidratar.
    return { status: 'idle', spotlight: null, items, participants, winners, seq }
  } catch {
    return null
  }
}

export const saveRaffle = (state: RaffleState): void => {
  try {
    const { items, participants, winners, seq } = state
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, participants, winners, seq }),
    )
  } catch {
    // Modo incógnito o cuota llena: el sorteo sigue funcionando en memoria.
  }
}

