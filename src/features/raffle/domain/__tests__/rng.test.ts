import { describe, expect, it, vi } from 'vitest'
import { cryptoUint32, lcg, unbiasedIndex, UINT32_RANGE } from '../rng'

describe('unbiasedIndex', () => {
  it('rechaza rangos que no son enteros positivos', () => {
    expect(() => unbiasedIndex(0, () => 0)).toThrow(RangeError)
    expect(() => unbiasedIndex(-3, () => 0)).toThrow(RangeError)
    expect(() => unbiasedIndex(2.5, () => 0)).toThrow(RangeError)
  })

  it('con un solo candidato siempre devuelve 0', () => {
    expect(unbiasedIndex(1, () => UINT32_RANGE - 1)).toBe(0)
  })

  it('mapea el entero crudo al bucket que le corresponde', () => {
    const bucket = UINT32_RANGE / 4 // max=4 divide exacto
    expect(unbiasedIndex(4, () => 0)).toBe(0)
    expect(unbiasedIndex(4, () => bucket)).toBe(1)
    expect(unbiasedIndex(4, () => bucket * 3)).toBe(3)
    expect(unbiasedIndex(4, () => UINT32_RANGE - 1)).toBe(3)
  })

  it('DESCARTA el sobrante que generaría sesgo de módulo y vuelve a tirar', () => {
    // max=3 no divide 2^32: el último valor cae fuera del último bucket completo.
    const next = vi
      .fn<() => number>()
      .mockReturnValueOnce(UINT32_RANGE - 1)
      .mockReturnValueOnce(5)
    expect(unbiasedIndex(3, next)).toBe(0)
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('nunca devuelve un índice fuera de rango', () => {
    const next = lcg(20260929)
    for (let max = 1; max <= 40; max++) {
      for (let i = 0; i < 200; i++) {
        const index = unbiasedIndex(max, next)
        expect(Number.isInteger(index)).toBe(true)
        expect(index).toBeGreaterThanOrEqual(0)
        expect(index).toBeLessThan(max)
      }
    }
  })

  it('reparte parejo: ningún candidato se lleva más del 20% de desvío', () => {
    const next = lcg(1337)
    const candidates = 5
    const draws = 50_000
    const hits = new Array<number>(candidates).fill(0)
    for (let i = 0; i < draws; i++) hits[unbiasedIndex(candidates, next)]!++

    const expected = draws / candidates
    for (const count of hits) {
      expect(Math.abs(count - expected) / expected).toBeLessThan(0.2)
    }
  })

  it('no se cuelga para siempre si la fuente sólo devuelve descartes', () => {
    expect(() => unbiasedIndex(3, () => UINT32_RANGE - 1)).toThrow(/azar/i)
  })
})

describe('cryptoUint32', () => {
  it('devuelve enteros dentro del rango de 32 bits', () => {
    for (let i = 0; i < 100; i++) {
      const value = cryptoUint32()
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(UINT32_RANGE)
    }
  })
})
