import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { Panel } from '../../../shared/ui/Panel'
import type { Participant } from '../domain/types'
import { EntryList } from './EntryList'

interface ParticipantsPanelProps {
  readonly participants: readonly Participant[]
  readonly locked: boolean
  readonly onAdd: (text: string) => void
  readonly onRemove: (id: string) => void
}

export const ParticipantsPanel = ({
  participants,
  locked,
  onAdd,
  onRemove,
}: ParticipantsPanelProps) => {
  const [text, setText] = useState('')

  const submit = () => {
    if (text.trim().length === 0) return
    onAdd(text)
    setText('')
  }

  return (
    <Panel title="Integrantes en el pozo" count={participants.length} className="min-h-72 lg:min-h-0 lg:flex-1">
      <form
        className="shrink-0 space-y-2 border-b border-steel/70 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={locked}
          rows={6}
          placeholder={'Kaiser\nNyx, Ragnar\nMel'}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit()
          }}
          className="max-h-56 w-full resize-y rounded-sm border border-steel bg-obsidian/70 px-2.5 py-2 text-sm leading-relaxed text-parchment field-sizing-content placeholder:text-ash/35 focus:border-adena/60 focus:outline-none disabled:opacity-40"
        />
        <Button type="submit" disabled={locked} className="w-full">
          Anotar integrantes
        </Button>
      </form>

      <EntryList
        entries={participants.map((participant) => ({
          id: participant.id,
          name: participant.name,
        }))}
        emptyHint="Pozo vacío. Pegá la lista del clan de una sola vez: los duplicados y los que ya ganaron se descartan solos."
        onRemove={onRemove}
        removeLabel="Sacar del pozo"
        disabled={locked}
      />
    </Panel>
  )
}
