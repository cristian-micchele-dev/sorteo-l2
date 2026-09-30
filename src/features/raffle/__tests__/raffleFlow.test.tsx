import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../App'
import { SPIN_DURATION_MS } from '../application/useRaffle'

const load = (items: string, participants: string) => {
  const [itemsBox, participantsBox] = screen.getAllByRole('textbox')

  fireEvent.change(itemsBox!, { target: { value: items } })
  fireEvent.click(screen.getByRole('button', { name: /cargar items/i }))

  fireEvent.change(participantsBox!, { target: { value: participants } })
  fireEvent.click(screen.getByRole('button', { name: /anotar integrantes/i }))
}

/**
 * Gira, espera a que frene la ruleta y cierra el anuncio del ganador.
 * El anuncio NO se va solo: lo cierra quien corre el sorteo.
 */
const spinAndSettle = () => {
  fireEvent.click(screen.getByRole('button', { name: /girar la ruleta/i }))
  act(() => {
    vi.advanceTimersByTime(SPIN_DURATION_MS + 50)
  })
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
}

const winnersPanel = () =>
  screen.getByRole('heading', { name: /ganadores/i }).closest('section')!

describe('flujo completo del sorteo', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('reparte un item por giro y NADIE gana dos veces', () => {
    render(<App />)
    load('Draco Leather\nZubei Helmet\nSoul Bow', 'Kaiser\nNyx\nRagnar\nMel\nDraven')

    for (let i = 0; i < 3; i++) spinAndSettle()

    const panel = within(winnersPanel())
    const items = panel.getAllByRole('listitem')
    expect(items).toHaveLength(3)

    // Tres items repartidos, tres personas distintas.
    for (const name of ['Draco Leather', 'Zubei Helmet', 'Soul Bow']) {
      expect(panel.getByText(name)).toBeInTheDocument()
    }
    const winnerNames = items.map((li) => li.textContent ?? '')
    expect(new Set(winnerNames).size).toBe(3)
  })

  it('al salir sorteado anuncia al ganador EN GRANDE y avisa cual es el siguiente item', () => {
    render(<App />)
    load('Draco Leather\nZubei Helmet', 'Kaiser\nNyx')

    fireEvent.click(screen.getByRole('button', { name: /girar la ruleta/i }))
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS + 50)
    })

    const announcement = within(screen.getByRole('dialog'))
    expect(announcement.getByText(/^ganador$/i)).toBeInTheDocument()
    expect(announcement.getByText('Draco Leather')).toBeInTheDocument()
    expect(announcement.getByText('Zubei Helmet')).toBeInTheDocument()

    // El anuncio NO se va solo: aguanta aunque pase el tiempo.
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el lider vive bajo el panel de ganadores, NO dentro del anuncio', () => {
    render(<App />)

    // Está desde el arranque, sin necesidad de sortear nada.
    expect(screen.getByRole('img', { name: /líder/i })).toHaveAttribute(
      'src',
      '/clan-leader.png',
    )

    load('Draco Leather', 'Kaiser\nNyx')
    fireEvent.click(screen.getByRole('button', { name: /girar la ruleta/i }))
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS + 50)
    })

    expect(
      within(screen.getByRole('dialog')).queryByRole('img', { name: /líder/i }),
    ).not.toBeInTheDocument()
  })

  it('en el ultimo item el anuncio avisa que no queda nada', () => {
    render(<App />)
    load('Unico Item', 'Kaiser\nNyx')

    fireEvent.click(screen.getByRole('button', { name: /girar la ruleta/i }))
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS + 50)
    })

    expect(within(screen.getByRole('dialog')).getByText(/no queda nada/i)).toBeInTheDocument()
  })

  it('se bloquea el giro cuando se agotan los items', () => {
    render(<App />)
    load('Unico Item', 'Kaiser\nNyx')
    spinAndSettle()

    expect(screen.getByRole('button', { name: /girar la ruleta/i })).toBeDisabled()
    expect(screen.getByText(/reparto terminado/i)).toBeInTheDocument()
  })

  it('no explota si hay mas items que integrantes: se corta al vaciarse el pozo', () => {
    render(<App />)
    load('A\nB\nC', 'Kaiser')
    spinAndSettle()

    expect(screen.getByRole('button', { name: /girar la ruleta/i })).toBeDisabled()
    expect(within(winnersPanel()).getAllByRole('listitem')).toHaveLength(1)
  })

  it('el reparto sobrevive a un recargado de pagina', () => {
    const first = render(<App />)
    load('Draco Leather', 'Kaiser\nNyx')
    spinAndSettle()
    const winner = within(winnersPanel()).getAllByRole('listitem')[0]!.textContent
    first.unmount()

    render(<App />)
    expect(within(winnersPanel()).getAllByRole('listitem')[0]!.textContent).toBe(winner)
  })

  it('deshacer devuelve el item a la cola y a la persona al pozo', () => {
    render(<App />)
    load('Draco Leather', 'Kaiser\nNyx')
    spinAndSettle()

    fireEvent.click(within(winnersPanel()).getByRole('button', { name: /deshacer/i }))

    expect(within(winnersPanel()).queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByRole('button', { name: /girar la ruleta/i })).toBeEnabled()
  })

  const openRoster = () => fireEvent.click(screen.getByRole('button', { name: /roster/i }))

  const loadRoster = (names: string) => {
    openRoster()
    fireEvent.change(screen.getByLabelText(/nombres para sumar al roster/i), {
      target: { value: names },
    })
    fireEvent.click(screen.getByRole('button', { name: /sumar al roster/i }))
  }

  it('el roster carga al pozo solo a los que vinieron', () => {
    render(<App />)
    loadRoster('Kaiser\nNyx\nMel')

    // Nyx no vino: se destilda y no entra al sorteo.
    fireEvent.click(screen.getByRole('checkbox', { name: /nyx/i }))
    fireEvent.click(screen.getByRole('button', { name: /cargar 2 al pozo/i }))

    const pool = within(screen.getByRole('heading', { name: /integrantes/i }).closest('section')!)
    expect(pool.getAllByRole('listitem')).toHaveLength(2)
    expect(pool.queryByText('Nyx')).not.toBeInTheDocument()
  })

  it('destildar a alguien NO lo borra del clan', () => {
    render(<App />)
    loadRoster('Kaiser\nNyx')
    fireEvent.click(screen.getByRole('checkbox', { name: /nyx/i }))

    expect(screen.getByRole('checkbox', { name: /nyx/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roster \(2\)/i })).toBeInTheDocument()
  })

  it('el roster SOBREVIVE a Reiniciar y a una recarga', () => {
    const first = render(<App />)
    loadRoster('Kaiser\nNyx\nMel')
    fireEvent.click(screen.getByRole('button', { name: /^cerrar$/i }))

    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: /reiniciar/i }))
    expect(screen.getByRole('button', { name: /roster \(3\)/i })).toBeInTheDocument()
    first.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: /roster \(3\)/i })).toBeInTheDocument()
  })

  it('la musica arranca prendida y su estado se recuerda', () => {
    const first = render(<App />)
    expect(screen.getByRole('button', { name: /música/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: /música/i }))
    expect(screen.getByRole('button', { name: /sin música/i })).toBeInTheDocument()
    first.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: /sin música/i })).toBeInTheDocument()
  })

  it('rechaza integrantes duplicados sin avisos ni duplicados en pantalla', () => {
    render(<App />)
    load('A', 'Kaiser, KAISER, kaiser, Nyx')

    const pool = within(screen.getByRole('heading', { name: /integrantes/i }).closest('section')!)
    expect(pool.getAllByRole('listitem')).toHaveLength(2)
  })
})
