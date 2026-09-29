import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Root } from '../../../Root'

const typePassword = (value: string) => {
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: /log in/i }))
}

/** El sorteo sólo existe una vez adentro. */
const insideApp = () => screen.queryByRole('button', { name: /girar la ruleta/i })

describe('puerta de entrada', () => {
  beforeEach(() => {
    globalThis.sessionStorage.clear()
    globalThis.localStorage.clear()
  })

  afterEach(cleanup)

  it('sin sesion NO se monta el sorteo, solo el login', () => {
    render(<Root />)

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(insideApp()).not.toBeInTheDocument()
  })

  it('la clave correcta abre la aplicacion', () => {
    render(<Root />)
    typePassword('BT2026')

    expect(insideApp()).toBeInTheDocument()
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  it('la clave incorrecta avisa, limpia el campo y no deja pasar', () => {
    render(<Root />)
    typePassword('BT2025')

    expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toHaveValue('')
    expect(insideApp()).not.toBeInTheDocument()
  })

  it('el error desaparece al volver a escribir', () => {
    render(<Root />)
    typePassword('mal')
    expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'B' } })
    expect(screen.queryByText(/contraseña incorrecta/i)).not.toBeInTheDocument()
  })

  it('la sesion sobrevive a una recarga de la pestaña', () => {
    const first = render(<Root />)
    typePassword('BT2026')
    first.unmount()

    render(<Root />)
    expect(insideApp()).toBeInTheDocument()
  })

  it('Salir cierra la sesion y vuelve al login', () => {
    render(<Root />)
    typePassword('BT2026')

    fireEvent.click(screen.getByRole('button', { name: /^salir$/i }))

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(insideApp()).not.toBeInTheDocument()
  })
})
