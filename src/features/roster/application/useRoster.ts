import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addMembers,
  presentNames,
  removeMember,
  setAllPresent,
  togglePresent,
} from '../domain/roster'
import type { Roster, RosterMember } from '../domain/roster'

/**
 * Clave PROPIA, distinta a la del sorteo. Eso es lo que hace que Reiniciar
 * no se lleve puesto el roster: no comparten almacenamiento.
 */
const ROSTER_KEY = 'ruleta-rusa-l2:roster'

const isMember = (value: unknown): value is RosterMember => {
  if (typeof value !== 'object' || value === null) return false
  const member = value as Record<string, unknown>
  return (
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.present === 'boolean'
  )
}

const readRoster = (): Roster => {
  try {
    const raw = globalThis.localStorage?.getItem(ROSTER_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isMember) : []
  } catch {
    return []
  }
}

export const useRoster = () => {
  const [roster, setRoster] = useState<Roster>(readRoster)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    try {
      globalThis.localStorage?.setItem(ROSTER_KEY, JSON.stringify(roster))
    } catch {
      // Modo incógnito o cuota llena: vale mientras dure la pestaña.
    }
  }, [roster])

  const add = useCallback((names: readonly string[]) => {
    setRoster((current) => addMembers(current, names))
  }, [])

  const remove = useCallback((id: string) => {
    setRoster((current) => removeMember(current, id))
  }, [])

  const toggle = useCallback((id: string) => {
    setRoster((current) => togglePresent(current, id))
  }, [])

  const markAll = useCallback((present: boolean) => {
    setRoster((current) => setAllPresent(current, present))
  }, [])

  /*
   * Sin este memo, cada render de App recorría los 40+ integrantes para
   * recalcular los presentes y devolvía objetos nuevos, lo que impide
   * memoizar cualquier cosa que reciba estas props.
   */
  const actions = useMemo(
    () => ({ add, remove, toggle, markAll }),
    [add, remove, toggle, markAll],
  )

  return useMemo(
    () => ({ roster, presentNames: presentNames(roster), actions }),
    [roster, actions],
  )
}
