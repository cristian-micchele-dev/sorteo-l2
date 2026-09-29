import { useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { Panel } from '../../../shared/ui/Panel'
import type { Item } from '../domain/types'
import { EntryList } from './EntryList'

interface ItemsPanelProps {
  readonly items: readonly Item[]
  readonly locked: boolean
  readonly onAdd: (text: string) => void
  readonly onRemove: (id: string) => void
}

export const ItemsPanel = ({ items, locked, onAdd, onRemove }: ItemsPanelProps) => {
  const [text, setText] = useState('')

  const submit = () => {
    if (text.trim().length === 0) return
    onAdd(text)
    setText('')
  }

  return (
    <Panel title="Items del botín" count={items.length} accent="adena" className="min-h-72 lg:min-h-0 lg:flex-1">
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
          placeholder={'Draco Leather Armor\nZubei Helmet, Soul Bow'}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit()
          }}
          className="max-h-56 w-full resize-y rounded-sm border border-steel bg-obsidian/70 px-2.5 py-2 text-sm leading-relaxed text-parchment field-sizing-content placeholder:text-ash/35 focus:border-adena/60 focus:outline-none disabled:opacity-40"
        />
        <Button type="submit" variant="primary" disabled={locked} className="w-full">
          Cargar items
        </Button>
      </form>

      <EntryList
        entries={items.map((item) => ({ id: item.id, name: item.name }))}
        emptyHint="Sin items en la cola. Pegá los drops separados por saltos de línea o comas — los repetidos valen."
        onRemove={onRemove}
        removeLabel="Quitar item"
        disabled={locked}
        highlightFirst
      />
    </Panel>
  )
}
