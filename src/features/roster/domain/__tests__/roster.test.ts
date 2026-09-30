import { describe, expect, it } from 'vitest'
import {
  addMembers,
  presentNames,
  removeMember,
  setAllPresent,
  togglePresent,
} from '../roster'
import type { Roster } from '../roster'

const build = (...names: string[]): Roster => addMembers([], names)

describe('addMembers', () => {
  it('agrega recortando y marcando presente por defecto', () => {
    const roster = build('  Kaiser  ', 'Nyx')
    expect(roster.map((m) => m.name)).toEqual(['Kaiser', 'Nyx'])
    expect(roster.every((m) => m.present)).toBe(true)
  })

  it('rechaza duplicados ignorando mayusculas', () => {
    expect(build('Kaiser', 'KAISER', 'kaiser ', 'Nyx')).toHaveLength(2)
  })

  it('no re-agrega a alguien que ya esta en el roster', () => {
    const roster = build('Kaiser', 'Nyx')
    expect(addMembers(roster, ['kaiser', 'Mel']).map((m) => m.name)).toEqual([
      'Kaiser',
      'Nyx',
      'Mel',
    ])
  })

  it('sin nombres nuevos devuelve el MISMO roster', () => {
    const roster = build('Kaiser')
    expect(addMembers(roster, ['KAISER', '  '])).toBe(roster)
  })
})

describe('asistencia', () => {
  it('destildar a alguien lo saca de los presentes, pero NO del roster', () => {
    const roster = build('Kaiser', 'Nyx', 'Mel')
    const afterToggle = togglePresent(roster, 'nyx')

    expect(afterToggle).toHaveLength(3)
    expect(presentNames(afterToggle)).toEqual(['Kaiser', 'Mel'])
  })

  it('volver a tildarlo lo devuelve', () => {
    const roster = togglePresent(togglePresent(build('Kaiser', 'Nyx'), 'nyx'), 'nyx')
    expect(presentNames(roster)).toEqual(['Kaiser', 'Nyx'])
  })

  it('Todos y Ninguno mueven a todo el roster de una', () => {
    const roster = build('Kaiser', 'Nyx', 'Mel')
    expect(presentNames(setAllPresent(roster, false))).toEqual([])
    expect(presentNames(setAllPresent(setAllPresent(roster, false), true))).toHaveLength(3)
  })

  it('togglePresent con un id inexistente no cambia nada', () => {
    const roster = build('Kaiser')
    expect(togglePresent(roster, 'fantasma')).toBe(roster)
  })
})

describe('removeMember', () => {
  it('saca solo al apuntado', () => {
    const roster = build('Kaiser', 'Nyx', 'Mel')
    expect(removeMember(roster, 'nyx').map((m) => m.name)).toEqual(['Kaiser', 'Mel'])
  })

  it('con un id inexistente devuelve el MISMO roster', () => {
    const roster = build('Kaiser')
    expect(removeMember(roster, 'fantasma')).toBe(roster)
  })
})
