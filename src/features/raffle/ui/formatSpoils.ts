import type { Winner } from '../domain/types'

/** El reparto en texto plano, para pegar donde el clan pueda auditarlo. */
export const formatSpoils = (winners: readonly Winner[]): string => {
  if (winners.length === 0) return 'Todavía no se repartió nada.'

  const lines = winners.map(
    (winner, index) => `${index + 1}. ${winner.item.name} -> ${winner.participant.name}`,
  )

  return ['=== REPARTO DE BOTIN ===', ...lines].join('\n')
}
