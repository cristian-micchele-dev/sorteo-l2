import { describe, expect, it } from 'vitest'
import { fitName, labelSize, pointAt, RIM, sliceLabel, slicePath } from '../wheelGeometry'
import { MAX_SLICES } from '../wheelRing'

describe('pointAt', () => {
  it('el cero apunta ARRIBA, no a la derecha: es donde está el puntero', () => {
    const [x, y] = pointAt(0, 100)
    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(-100, 6)
  })

  it('crece en sentido horario', () => {
    const [x] = pointAt(90, 100)
    expect(x).toBeCloseTo(100, 6)
  })
})

describe('slicePath', () => {
  it('con un solo candidato dibuja un disco, porque un arco no cierra 360', () => {
    const path = slicePath(0, 1)
    expect(path).not.toContain('M 0 0')
    expect((path.match(/A /g) ?? []).length).toBe(2)
  })

  it('cada sector arranca en el centro y cierra', () => {
    const path = slicePath(3, 8)
    expect(path.startsWith('M 0 0')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('usa el arco largo solo cuando el sector pasa de media vuelta', () => {
    expect(slicePath(0, 2)).toContain(` ${RIM} 0 0 1 `)
    expect(slicePath(0, 3)).toContain(` ${RIM} 0 0 1 `)
  })
})

/** Los ángulos dan la vuelta: 360° y 0° son la misma inclinación. */
const upright = (degrees: number): number => (((degrees % 360) + 540) % 360) - 180

describe('sliceLabel', () => {
  it('el texto NUNCA queda cabeza abajo', () => {
    for (let slices = 2; slices <= MAX_SLICES; slices++) {
      for (let index = 0; index < slices; index++) {
        const tilt = upright(sliceLabel(index, slices).rotation)
        // Una inclinación fuera de [-90, 90] significa texto invertido.
        expect(tilt).toBeGreaterThanOrEqual(-90)
        expect(tilt).toBeLessThanOrEqual(90)
      }
    }
  })

  it('la mitad izquierda se ancla por el otro extremo', () => {
    // Con 4 sectores, el tercero cae en la mitad izquierda.
    expect(sliceLabel(0, 4).anchor).toBe('end')
    expect(sliceLabel(2, 4).anchor).toBe('start')
  })
})

describe('escalas', () => {
  it('a mas sectores, letra mas chica: nunca al reves', () => {
    let previous = Number.POSITIVE_INFINITY
    for (let slices = 2; slices <= MAX_SLICES; slices++) {
      const size = labelSize(slices)
      expect(size).toBeLessThanOrEqual(previous)
      previous = size
    }
  })

  it('los nombres largos se recortan con puntos suspensivos', () => {
    expect(fitName('Kaiser', 8)).toBe('Kaiser')
    const recortado = fitName('NombreInterminableDeVerdad', 64)
    expect(recortado).toHaveLength(8)
    expect(recortado.endsWith('…')).toBe(true)
  })
})
