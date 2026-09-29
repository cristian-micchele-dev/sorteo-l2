import { unbiasedIndex } from './rng'
import type { Participant, RandomSource } from './types'

/**
 * Elige UN integrante del pozo. Acá vive la justicia del sorteo:
 * la ruleta de la UI sólo dramatiza lo que esta función ya decidió.
 */
export const drawWinner = (
  participants: readonly Participant[],
  next: RandomSource,
): Participant => {
  if (participants.length === 0) {
    throw new Error('No se puede sortear: el pozo de integrantes está vacío')
  }

  return participants[unbiasedIndex(participants.length, next)]!
}
