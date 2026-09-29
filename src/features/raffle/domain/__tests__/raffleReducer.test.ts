import { describe, expect, it } from 'vitest'
import {
  canSpin,
  initialRaffleState,
  parseNames,
  raffleReducer,
  selectPhase,
} from '../raffleReducer'
import { lcg } from '../rng'
import type { RaffleState, RandomSource } from '../types'

const loaded = (itemNames: string[], participantNames: string[]): RaffleState => {
  const withItems = raffleReducer(initialRaffleState, {
    type: 'ADD_ITEMS',
    names: itemNames,
  })
  return raffleReducer(withItems, { type: 'ADD_PARTICIPANTS', names: participantNames })
}

/** Un giro completo: decidir -> revelar -> confirmar. */
const spinOnce = (state: RaffleState, next: RandomSource): RaffleState => {
  const spinning = raffleReducer(state, { type: 'SPIN', next })
  const revealed = raffleReducer(spinning, { type: 'REVEAL' })
  return raffleReducer(revealed, { type: 'ACK' })
}

describe('parseNames', () => {
  it('parte por saltos de linea y comas, recorta y descarta vacios', () => {
    expect(parseNames(' Kaiser \n\n Nyx,Ragnar \n , \n Mel ')).toEqual([
      'Kaiser',
      'Nyx',
      'Ragnar',
      'Mel',
    ])
  })

  it('con texto vacio devuelve lista vacia', () => {
    expect(parseNames('   \n  ')).toEqual([])
  })
})

describe('alta de integrantes', () => {
  it('agrega recortando el nombre', () => {
    const state = raffleReducer(initialRaffleState, {
      type: 'ADD_PARTICIPANTS',
      names: ['  Kaiser  '],
    })
    expect(state.participants).toHaveLength(1)
    expect(state.participants[0]!.name).toBe('Kaiser')
  })

  it('rechaza duplicados ignorando mayusculas: una persona, un ticket', () => {
    const state = raffleReducer(initialRaffleState, {
      type: 'ADD_PARTICIPANTS',
      names: ['Kaiser', 'KAISER', 'kaiser ', 'Nyx'],
    })
    expect(state.participants.map((p) => p.name)).toEqual(['Kaiser', 'Nyx'])
  })

  it('rechaza volver a anotar a alguien que YA gano', () => {
    const start = loaded(['Draco Leather'], ['Kaiser'])
    const afterDraw = spinOnce(start, () => 0)
    expect(afterDraw.winners[0]!.participant.name).toBe('Kaiser')

    const reAdded = raffleReducer(afterDraw, { type: 'ADD_PARTICIPANTS', names: ['kaiser'] })
    expect(reAdded.participants).toHaveLength(0)
  })

  it('REMOVE_PARTICIPANT saca solo al apuntado', () => {
    const state = loaded([], ['Kaiser', 'Nyx', 'Mel'])
    const pruned = raffleReducer(state, {
      type: 'REMOVE_PARTICIPANT',
      id: state.participants[1]!.id,
    })
    expect(pruned.participants.map((p) => p.name)).toEqual(['Kaiser', 'Mel'])
  })
})

describe('alta de items', () => {
  it('PERMITE items repetidos: en un raid caen dos iguales', () => {
    const state = raffleReducer(initialRaffleState, {
      type: 'ADD_ITEMS',
      names: ['Draco Leather', 'Draco Leather'],
    })
    expect(state.items).toHaveLength(2)
    expect(state.items[0]!.id).not.toBe(state.items[1]!.id)
    expect(state.items.map((i) => i.name)).toEqual(['Draco Leather', 'Draco Leather'])
  })

  it('REMOVE_ITEM saca solo el item apuntado', () => {
    const state = loaded(['A', 'B', 'C'], [])
    const pruned = raffleReducer(state, { type: 'REMOVE_ITEM', id: state.items[1]!.id })
    expect(pruned.items.map((i) => i.name)).toEqual(['A', 'C'])
  })
})

describe('el giro', () => {
  it('no se puede girar sin items', () => {
    const state = loaded([], ['Kaiser'])
    expect(canSpin(state)).toBe(false)
    expect(raffleReducer(state, { type: 'SPIN', next: () => 0 })).toBe(state)
  })

  it('no se puede girar sin integrantes', () => {
    const state = loaded(['Draco Leather'], [])
    expect(canSpin(state)).toBe(false)
    expect(raffleReducer(state, { type: 'SPIN', next: () => 0 })).toBe(state)
  })

  it('SPIN decide el ganador pero NO toca los pozos todavia: spoilear arruina el show', () => {
    const state = loaded(['Draco Leather'], ['Kaiser', 'Nyx', 'Ragnar'])
    const spinning = raffleReducer(state, { type: 'SPIN', next: () => 0 })

    expect(spinning.status).toBe('spinning')
    expect(spinning.spotlight?.participant.name).toBe('Kaiser')
    expect(spinning.spotlight?.item.name).toBe('Draco Leather')
    expect(spinning.participants).toHaveLength(3)
    expect(spinning.items).toHaveLength(1)
    expect(spinning.winners).toHaveLength(0)
  })

  it('girar dos veces sin revelar no hace nada', () => {
    const state = loaded(['A', 'B'], ['Kaiser', 'Nyx'])
    const spinning = raffleReducer(state, { type: 'SPIN', next: () => 0 })
    expect(raffleReducer(spinning, { type: 'SPIN', next: () => 0 })).toBe(spinning)
  })

  it('sortea los items en el orden en que se cargaron', () => {
    const state = loaded(['Primero', 'Segundo'], ['Kaiser', 'Nyx'])
    const spinning = raffleReducer(state, { type: 'SPIN', next: () => 0 })
    expect(spinning.spotlight?.item.name).toBe('Primero')
  })

  it('REVEAL saca al ganador del pozo y consume el item', () => {
    const state = loaded(['Draco Leather'], ['Kaiser', 'Nyx', 'Ragnar'])
    const revealed = raffleReducer(raffleReducer(state, { type: 'SPIN', next: () => 0 }), {
      type: 'REVEAL',
    })

    expect(revealed.status).toBe('revealing')
    expect(revealed.participants.map((p) => p.name)).toEqual(['Nyx', 'Ragnar'])
    expect(revealed.items).toHaveLength(0)
    expect(revealed.winners).toHaveLength(1)
    expect(revealed.spotlight?.participant.name).toBe('Kaiser')
  })

  it('REVEAL sin haber girado no hace nada', () => {
    const state = loaded(['A'], ['Kaiser'])
    expect(raffleReducer(state, { type: 'REVEAL' })).toBe(state)
  })

  it('ACK cierra el giro y limpia el foco', () => {
    const state = spinOnce(loaded(['A'], ['Kaiser', 'Nyx']), () => 0)
    expect(state.status).toBe('idle')
    expect(state.spotlight).toBeNull()
  })

  it('NADIE gana dos veces, ni en 6 giros seguidos', () => {
    let state = loaded(
      ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'],
      ['Kaiser', 'Nyx', 'Ragnar', 'Mel', 'Draven', 'Sylph'],
    )
    const next = lcg(2026)
    for (let i = 0; i < 6; i++) state = spinOnce(state, next)

    const winnerNames = state.winners.map((w) => w.participant.name)
    expect(winnerNames).toHaveLength(6)
    expect(new Set(winnerNames).size).toBe(6)
    expect(state.participants).toHaveLength(0)
    expect(state.items).toHaveLength(0)
  })

  it('bloquea cambios en las listas mientras la ruleta gira', () => {
    const spinning = raffleReducer(loaded(['A'], ['Kaiser', 'Nyx']), {
      type: 'SPIN',
      next: () => 0,
    })
    expect(raffleReducer(spinning, { type: 'ADD_PARTICIPANTS', names: ['Mel'] })).toBe(spinning)
    expect(raffleReducer(spinning, { type: 'ADD_ITEMS', names: ['B'] })).toBe(spinning)
    expect(raffleReducer(spinning, { type: 'REMOVE_PARTICIPANT', id: 'p0' })).toBe(spinning)
  })
})

describe('selectPhase', () => {
  it('vacio mientras no haya nada cargado', () => {
    expect(selectPhase(initialRaffleState)).toBe('empty')
  })

  it('listo cuando hay item y gente', () => {
    expect(selectPhase(loaded(['A'], ['Kaiser']))).toBe('ready')
  })

  it('refleja el giro en curso', () => {
    const spinning = raffleReducer(loaded(['A'], ['Kaiser']), { type: 'SPIN', next: () => 0 })
    expect(selectPhase(spinning)).toBe('spinning')
    expect(selectPhase(raffleReducer(spinning, { type: 'REVEAL' }))).toBe('revealing')
  })

  it('terminado cuando ya se repartio y no queda con que seguir', () => {
    const state = spinOnce(loaded(['A'], ['Kaiser']), () => 0)
    expect(selectPhase(state)).toBe('finished')
  })

  it('sigue listo si sobraron items pero quedan integrantes', () => {
    const state = spinOnce(loaded(['A', 'B'], ['Kaiser', 'Nyx']), () => 0)
    expect(selectPhase(state)).toBe('ready')
  })
})

describe('deshacer y reiniciar', () => {
  it('RETURN_TO_POOL devuelve el item a la cola y a la persona al pozo', () => {
    const state = spinOnce(loaded(['Draco Leather'], ['Kaiser', 'Nyx']), () => 0)
    const undone = raffleReducer(state, { type: 'RETURN_TO_POOL', winnerId: state.winners[0]!.id })

    expect(undone.winners).toHaveLength(0)
    expect(undone.items.map((i) => i.name)).toEqual(['Draco Leather'])
    expect(undone.participants.map((p) => p.name).sort()).toEqual(['Kaiser', 'Nyx'])
  })

  it('RETURN_TO_POOL con un id inexistente no cambia nada', () => {
    const state = spinOnce(loaded(['A'], ['Kaiser']), () => 0)
    expect(raffleReducer(state, { type: 'RETURN_TO_POOL', winnerId: 'no-existe' })).toBe(state)
  })

  it('RESET vacia items, integrantes y ganadores', () => {
    const state = spinOnce(loaded(['A', 'B'], ['Kaiser', 'Nyx']), () => 0)
    const clean = raffleReducer(state, { type: 'RESET' })

    expect(clean.items).toHaveLength(0)
    expect(clean.participants).toHaveLength(0)
    expect(clean.winners).toHaveLength(0)
    expect(clean.spotlight).toBeNull()
    expect(clean.status).toBe('idle')
  })

  it('RESET NO reusa ids viejos: el contador sigue donde estaba', () => {
    const state = spinOnce(loaded(['A', 'B'], ['Kaiser', 'Nyx']), () => 0)
    expect(raffleReducer(state, { type: 'RESET' }).seq).toBe(state.seq)
  })
})

describe('HYDRATE', () => {
  it('nunca restaura un giro a medias: vuelve a idle y sin foco', () => {
    const spinning = raffleReducer(loaded(['A'], ['Kaiser', 'Nyx']), {
      type: 'SPIN',
      next: () => 0,
    })
    const hydrated = raffleReducer(initialRaffleState, { type: 'HYDRATE', state: spinning })

    expect(hydrated.status).toBe('idle')
    expect(hydrated.spotlight).toBeNull()
    expect(hydrated.items).toHaveLength(1)
    expect(hydrated.participants).toHaveLength(2)
  })
})
