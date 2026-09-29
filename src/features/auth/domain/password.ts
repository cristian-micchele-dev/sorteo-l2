/**
 * Hash FNV-1a de 32 bits.
 *
 * NO es criptográfico y NO pretende serlo: existe para que la contraseña no
 * aparezca en texto plano al mirar el bundle. Cualquier validación que corre
 * en el navegador es una tranca, no una cerradura — el código viaja al
 * cliente y ahí se puede leer entero. Para un sorteo de clan alcanza;
 * para datos que importen, la verificación va en un servidor.
 */
const fnv1a = (text: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

const PASSWORD_HASH = 0xf7b48ad5

/** Se recortan los espacios porque casi siempre se llega pegando la clave. */
export const isValidPassword = (input: string): boolean => fnv1a(input.trim()) === PASSWORD_HASH
