/**
 * El roster es la lista estable del clan, separada del sorteo.
 *
 * Vive aparte a propósito: un reparto va y viene, el clan queda. Por eso
 * Reiniciar no lo toca — no comparten ni estado ni almacenamiento.
 */

export interface RosterMember {
  readonly id: string
  readonly name: string
  /** Si vino a ESTE raid. Destildarlo no lo borra del clan. */
  readonly present: boolean
}

export type Roster = readonly RosterMember[]

/** El id es el nombre normalizado: estable, único y sin contadores. */
const normalize = (name: string): string => name.trim().toLowerCase()

export const addMembers = (roster: Roster, names: readonly string[]): Roster => {
  const taken = new Set(roster.map((member) => member.id))
  const added: RosterMember[] = []

  for (const raw of names) {
    const name = raw.trim()
    const id = normalize(name)
    if (name.length === 0 || taken.has(id)) continue
    taken.add(id)
    added.push({ id, name, present: true })
  }

  return added.length === 0 ? roster : [...roster, ...added]
}

export const removeMember = (roster: Roster, id: string): Roster => {
  const kept = roster.filter((member) => member.id !== id)
  return kept.length === roster.length ? roster : kept
}

export const togglePresent = (roster: Roster, id: string): Roster => {
  if (!roster.some((member) => member.id === id)) return roster
  return roster.map((member) =>
    member.id === id ? { ...member, present: !member.present } : member,
  )
}

export const setAllPresent = (roster: Roster, present: boolean): Roster =>
  roster.map((member) => (member.present === present ? member : { ...member, present }))

/** Los que entran al sorteo de hoy. */
export const presentNames = (roster: Roster): string[] =>
  roster.filter((member) => member.present).map((member) => member.name)
