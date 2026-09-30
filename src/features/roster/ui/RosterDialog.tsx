import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import type { Roster } from '../domain/roster'

interface RosterDialogProps {
  readonly roster: Roster
  readonly presentNames: readonly string[]
  readonly locked: boolean
  readonly onAdd: (names: readonly string[]) => void
  readonly onRemove: (id: string) => void
  readonly onToggle: (id: string) => void
  readonly onMarkAll: (present: boolean) => void
  readonly onLoadPool: () => void
  readonly onClose: () => void
}

export const RosterDialog = ({
  roster,
  presentNames,
  locked,
  onAdd,
  onRemove,
  onToggle,
  onMarkAll,
  onLoadPool,
  onClose,
}: RosterDialogProps) => {
  const [text, setText] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose])

  // Con 35 nicks, el orden en que se pegaron no sirve para buscar a nadie.
  const sorted = useMemo(
    () => [...roster].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [roster],
  )

  const submit = () => {
    if (text.trim().length === 0) return
    onAdd(text.split(/[\n,;]+/))
    setText('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roster-title"
      onClick={onClose}
      className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 px-4 py-6 backdrop-blur-md"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col rounded-sm border-2 border-adena/40 bg-abyss shadow-[0_0_80px_rgba(0,0,0,0.95)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-steel px-5 py-3.5">
          <h2
            id="roster-title"
            className="font-display text-sm font-bold tracking-[0.22em] text-adena uppercase"
          >
            Roster del clan
          </h2>
          <span className="rounded-sm border border-steel bg-forge px-2 py-0.5 font-mono text-xs text-ash tabular-nums">
            {presentNames.length}/{roster.length}
          </span>
        </header>

        <form
          className="shrink-0 space-y-2 border-b border-steel/70 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder={'Kaiser\nNyx, Ragnar\nMel'}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit()
            }}
            aria-label="Nombres para sumar al roster"
            className="max-h-40 w-full resize-y rounded-sm border border-steel bg-obsidian/70 px-2.5 py-2 text-sm leading-relaxed text-parchment field-sizing-content placeholder:text-ash/35 focus:border-adena/60 focus:outline-none"
          />
          <Button type="submit" className="w-full">
            Sumar al roster
          </Button>
        </form>

        {roster.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm leading-relaxed text-ash/60 italic">
            El roster está vacío. Pegá la lista del clan una sola vez: queda guardada y
            sobrevive a Reiniciar.
          </p>
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-steel/50 px-4 py-2">
              <span className="font-mono text-[0.625rem] tracking-[0.18em] text-ash/60 uppercase">
                Vinieron hoy
              </span>
              <div className="flex gap-2">
                <Button onClick={() => onMarkAll(true)} className="px-2 py-0.5 text-[0.625rem]">
                  Todos
                </Button>
                <Button onClick={() => onMarkAll(false)} className="px-2 py-0.5 text-[0.625rem]">
                  Ninguno
                </Button>
              </div>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              {sorted.map((member) => (
                <li
                  key={member.id}
                  className="group flex items-center gap-3 border-b border-steel/40 px-4 py-1.5 last:border-b-0"
                >
                  <label className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={member.present}
                      onChange={() => onToggle(member.id)}
                      className="size-4 shrink-0 accent-adena"
                    />
                    <span
                      className={`min-w-0 truncate text-sm ${
                        member.present ? 'text-parchment' : 'text-ash/40 line-through'
                      }`}
                    >
                      {member.name}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemove(member.id)}
                    aria-label={`Sacar del clan: ${member.name}`}
                    title="Sacar del clan"
                    className="shrink-0 rounded-sm px-1.5 text-ash/40 opacity-0 transition hover:text-ember focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-steel px-4 py-3">
          <Button
            variant="primary"
            disabled={locked || presentNames.length === 0}
            onClick={onLoadPool}
            title="Suma los presentes al pozo del sorteo"
          >
            Cargar {presentNames.length} al pozo
          </Button>
          <Button ref={closeRef} onClick={onClose}>
            Cerrar
          </Button>
        </footer>
      </div>
    </div>
  )
}
