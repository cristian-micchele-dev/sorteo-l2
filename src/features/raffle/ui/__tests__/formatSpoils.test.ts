import { describe, expect, it } from 'vitest'
import { formatSpoils } from '../formatSpoils'
import type { Winner } from '../../domain/types'

const winner = (n: number, item: string, participant: string): Winner => ({
  id: `i${n}`,
  item: { id: `i${n}`, name: item },
  participant: { id: `p${n}`, name: participant },
})

describe('formatSpoils', () => {
  it('numera el reparto listo para pegar en el Discord del clan', () => {
    const text = formatSpoils([
      winner(1, 'Draco Leather Armor', 'Kaiser'),
      winner(2, 'Soul Bow', 'Mel'),
    ])

    expect(text).toContain('1. Draco Leather Armor -> Kaiser')
    expect(text).toContain('2. Soul Bow -> Mel')
  })

  it('sin ganadores avisa en vez de devolver texto vacio', () => {
    expect(formatSpoils([])).toMatch(/todav/i)
  })
})
