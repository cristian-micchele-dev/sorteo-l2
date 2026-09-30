import { describe, expect, it } from 'vitest'
import { buildRing, MAX_SLICES, nextWheelAngle, SLICE_COLORS, sliceColor } from '../wheelRing'
import type { Participant } from '../../domain/types'

const pool = (count: number): Participant[] =>
  Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `Nick${i}` }))

describe('buildRing', () => {
  it('con pocos integrantes muestra a todos y ubica al ganador en su lugar', () => {
    const participants = pool(5)
    const ring = buildRing(participants, 'p3')

    expect(ring.slices).toEqual(participants)
    expect(ring.winnerSlot).toBe(3)
  })

  it('sin ganador todavia no marca ningun sector', () => {
    expect(buildRing(pool(5), null).winnerSlot).toBe(-1)
  })

  it('un clan de 48 entra ENTERO en la rueda, nadie queda afuera del dibujo', () => {
    const participants = pool(48)
    expect(buildRing(participants, null).slices).toEqual(participants)
    expect(buildRing(participants, 'p47').winnerSlot).toBe(47)
  })

  it('con mas integrantes que sectores recorta al maximo', () => {
    expect(buildRing(pool(90), null).slices).toHaveLength(MAX_SLICES)
  })

  it('con 90 integrantes el ganador SIEMPRE entra en la ruleta', () => {
    for (let i = 0; i < 90; i++) {
      const ring = buildRing(pool(90), `p${i}`)
      expect(ring.slices).toHaveLength(MAX_SLICES)
      expect(ring.winnerSlot).toBeGreaterThanOrEqual(0)
      expect(ring.slices[ring.winnerSlot]!.id).toBe(`p${i}`)
    }
  })

  it('no repite nombres dentro de la ruleta', () => {
    const ring = buildRing(pool(90), 'p87')
    expect(new Set(ring.slices.map((s) => s.id)).size).toBe(MAX_SLICES)
  })

  it('con un ganador que no esta en el pozo no marca nada', () => {
    expect(buildRing(pool(30), 'fantasma').winnerSlot).toBe(-1)
  })
})

describe('sliceColor', () => {
  it('reparte la paleta en orden mientras alcanza', () => {
    expect(sliceColor(0, 6)).toBe(SLICE_COLORS[0])
    expect(sliceColor(3, 6)).toBe(SLICE_COLORS[3])
  })

  it('NINGUN sector comparte color con su vecino, ni el ultimo con el primero', () => {
    for (let slices = 2; slices <= MAX_SLICES; slices++) {
      for (let i = 0; i < slices; i++) {
        const next = (i + 1) % slices
        expect(sliceColor(i, slices)).not.toBe(sliceColor(next, slices))
      }
    }
  })

  it('con un solo sector devuelve un color valido', () => {
    expect(SLICE_COLORS).toContain(sliceColor(0, 1))
  })
})

describe('nextWheelAngle', () => {
  it('siempre avanza hacia adelante: la ruleta nunca gira al reves', () => {
    expect(nextWheelAngle(0, 0, 8)).toBeGreaterThan(0)
    expect(nextWheelAngle(5000, 3, 8)).toBeGreaterThan(5000)
  })

  it('deja el CENTRO del sector ganador bajo el puntero, no su borde', () => {
    const slices = 8
    const step = 360 / slices
    for (let slot = 0; slot < slices; slot++) {
      const angle = nextWheelAngle(137, slot, slices)
      // El sector va de slot*step a (slot+1)*step; su centro cae en el medio.
      const middle = (slot + 0.5) * step
      expect((((angle + middle) % 360) + 360) % 360).toBeCloseTo(0, 6)
    }
  })

  it('gira entre CINCO y SEIS vueltas: ni un tironcito ni una eternidad', () => {
    for (let slices = 2; slices <= MAX_SLICES; slices++) {
      for (let slot = 0; slot < slices; slot++) {
        const turned = nextWheelAngle(0, slot, slices)
        expect(turned).toBeGreaterThanOrEqual(1800)
        expect(turned).toBeLessThan(2160)
      }
    }
  })

  it('sin sectores devuelve el angulo actual', () => {
    expect(nextWheelAngle(90, -1, 0)).toBe(90)
  })
})
