import { describe, expect, it } from 'vitest'
import { isValidPassword } from '../password'

describe('isValidPassword', () => {
  it('acepta la contraseña del clan', () => {
    expect(isValidPassword('BT2026')).toBe(true)
  })

  it('perdona los espacios de un copiar y pegar', () => {
    expect(isValidPassword('  BT2026  ')).toBe(true)
  })

  it('distingue mayusculas', () => {
    expect(isValidPassword('bt2026')).toBe(false)
    expect(isValidPassword('Bt2026')).toBe(false)
  })

  it('rechaza lo que no es', () => {
    for (const wrong of ['', '   ', 'BT2025', 'BT20266', 'blacktemplars']) {
      expect(isValidPassword(wrong)).toBe(false)
    }
  })
})
