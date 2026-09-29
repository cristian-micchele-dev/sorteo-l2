import { describe, expect, it } from 'vitest'
import { drawWinner } from '../drawWinner'
import { lcg, UINT32_RANGE } from '../rng'
import type { Participant } from '../types'

const pool: Participant[] = [
  { id: 'p1', name: 'Kaiser' },
  { id: 'p2', name: 'Nyx' },
  { id: 'p3', name: 'Ragnar' },
  { id: 'p4', name: 'Mel' },
]

describe('drawWinner', () => {
  it('explota si el pozo está vacío — sortear sin gente no es un caso válido', () => {
    expect(() => drawWinner([], () => 0)).toThrow(/pozo/i)
  })

  it('devuelve al candidato que le corresponde al valor sorteado', () => {
    expect(drawWinner(pool, () => 0)).toEqual(pool[0])
    expect(drawWinner(pool, () => UINT32_RANGE - 1)).toEqual(pool[3])
  })

  it('siempre devuelve a alguien que está en el pozo', () => {
    const next = lcg(777)
    for (let i = 0; i < 1000; i++) {
      expect(pool).toContain(drawWinner(pool, next))
    }
  })

  it('a la larga toca a todos', () => {
    const next = lcg(42)
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(drawWinner(pool, next).id)
    expect(seen.size).toBe(pool.length)
  })
})
