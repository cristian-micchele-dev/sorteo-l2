import type { RandomSource } from './types'

/** Cantidad de valores distintos que entran en 32 bits. */
export const UINT32_RANGE = 2 ** 32

/** Cuántos descartes seguidos tolerar antes de declarar la fuente rota. */
const MAX_REJECTIONS = 128

/** Azar criptográfico del navegador. Es la fuente de producción. */
export const cryptoUint32: RandomSource = () => globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!

/**
 * Generador congruencial lineal. NO usar para sortear de verdad:
 * existe para que los tests sean deterministas.
 */
export const lcg = (seed: number): RandomSource => {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state
  }
}

/**
 * Índice uniforme en [0, max) SIN sesgo de módulo.
 *
 * El truco ingenuo `valor % max` reparte mal cuando `max` no divide a 2^32:
 * los primeros índices reciben un valor extra y salen más seguido. Acá se
 * parte el rango en `max` baldes iguales y se DESCARTA el sobrante,
 * volviendo a tirar. Cada índice queda con exactamente la misma cantidad
 * de valores crudos a favor.
 */
export const unbiasedIndex = (max: number, next: RandomSource): number => {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError(`El rango del sorteo tiene que ser un entero positivo, llegó: ${max}`)
  }

  const bucketSize = Math.floor(UINT32_RANGE / max)
  const ceiling = bucketSize * max

  for (let attempt = 0; attempt <= MAX_REJECTIONS; attempt++) {
    const raw = next()
    if (raw < ceiling) return Math.floor(raw / bucketSize)
  }

  throw new Error('La fuente de azar devolvió sólo descartes: no se puede sortear sin sesgo')
}
