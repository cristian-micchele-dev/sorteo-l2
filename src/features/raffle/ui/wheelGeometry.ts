/**
 * Geometría y escalas de la rueda. Todo puro y sin React: son cuentas, no
 * interfaz, y estaban enterradas dentro del componente donde no se podían
 * probar sin montar un SVG.
 */

export const RIM = 190

/** El texto arranca pegado al borde y corre hacia el centro. */
export const LABEL_RADIUS = 176

/** Ángulo de la rueda (0 arriba, creciendo en sentido horario) a coordenadas SVG. */
export const pointAt = (angle: number, radius: number): [number, number] => {
  const rad = (angle * Math.PI) / 180
  return [radius * Math.sin(rad), -radius * Math.cos(rad)]
}

export const slicePath = (index: number, slices: number): string => {
  if (slices === 1) {
    // Un arco no puede cerrar 360°: con un solo candidato la rueda es un disco.
    return `M 0 -${RIM} A ${RIM} ${RIM} 0 1 1 0 ${RIM} A ${RIM} ${RIM} 0 1 1 0 -${RIM} Z`
  }

  const step = 360 / slices
  const [x0, y0] = pointAt(index * step, RIM)
  const [x1, y1] = pointAt((index + 1) * step, RIM)
  const largeArc = step > 180 ? 1 : 0

  return `M 0 0 L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${RIM} ${RIM} 0 ${largeArc} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

/**
 * Nombres largos en sectores finos no entran: se recortan antes de dibujar.
 * El texto corre hacia el centro, y ahí el arco se angosta — por eso el
 * límite baja a medida que crece la cantidad de sectores.
 */
export const fitName = (name: string, slices: number): string => {
  const max = slices <= 8 ? 15 : slices <= 14 ? 12 : slices <= 24 ? 11 : slices <= 40 ? 10 : 8
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

export const labelSize = (slices: number): number => {
  if (slices <= 10) return 13
  if (slices <= 16) return 11
  if (slices <= 24) return 9.5
  if (slices <= 32) return 8
  if (slices <= 44) return 7
  if (slices <= 54) return 6.2
  return 5.6
}

/** Con muchos sectores un borde grueso se come el color. */
export const sliceStroke = (slices: number): number =>
  slices <= 24 ? 1.5 : slices <= 44 ? 0.8 : 0.5

export interface SliceLabel {
  readonly x: number
  readonly y: number
  /**
   * El texto corre A LO LARGO del radio, así que va girado 90° menos que el
   * sector. En la mitad izquierda saldría cabeza abajo: ahí se voltea y pasa
   * a anclarse por el otro extremo.
   */
  readonly rotation: number
  readonly anchor: 'start' | 'end'
}

export const sliceLabel = (index: number, slices: number): SliceLabel => {
  const middle = (index + 0.5) * (360 / slices)
  const flip = middle > 180
  const [x, y] = pointAt(middle, LABEL_RADIUS)

  return {
    x,
    y,
    rotation: flip ? middle + 90 : middle - 90,
    anchor: flip ? 'start' : 'end',
  }
}
