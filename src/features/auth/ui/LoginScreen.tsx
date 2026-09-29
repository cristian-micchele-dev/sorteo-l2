import { useRef, useState } from 'react'
import { isValidPassword } from '../domain/password'

interface LoginScreenProps {
  readonly onAuthenticated: () => void
}

const fieldClass =
  'w-full rounded-xs border border-iron/80 bg-obsidian px-2 py-1 text-sm text-parchment shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] focus:border-adena/70 focus:outline-none'

const buttonClass =
  'flex-1 rounded-xs border border-iron/90 bg-linear-to-b from-steel to-forge px-4 py-1.5 font-display text-xs font-bold tracking-[0.18em] text-parchment uppercase transition-colors hover:border-adena/70 hover:text-adena-bright active:from-forge active:to-steel'

export const LoginScreen = ({ onAuthenticated }: LoginScreenProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    if (isValidPassword(password)) {
      onAuthenticated()
      return
    }
    setError('Contraseña incorrecta.')
    setPassword('')
    passwordRef.current?.focus()
  }

  const exit = () => {
    // window.close() sólo funciona si la pestaña la abrió un script.
    globalThis.close()
    setExiting(true)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <h1
        id="login-title"
        className="title-sheen font-display text-2xl font-bold tracking-[0.18em] uppercase sm:text-3xl"
      >
        Black Templars
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        aria-labelledby="login-title"
        className="w-full max-w-sm rounded-sm border border-iron/70 bg-linear-to-b from-forge to-abyss p-4 shadow-[0_0_60px_rgba(0,0,0,0.95)]"
      >
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2.5">
          <label htmlFor="account" className="justify-self-end text-xs text-ash">
            Account
          </label>
          <input
            id="account"
            name="account"
            autoComplete="username"
            spellCheck={false}
            className={fieldClass}
          />

          <label htmlFor="password" className="justify-self-end text-xs text-ash">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            ref={passwordRef}
            value={password}
            autoFocus
            autoComplete="current-password"
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
            aria-invalid={error !== null}
            aria-describedby={error ? 'login-error' : undefined}
            className={fieldClass}
          />
        </div>

        <div className="mt-4 flex gap-2.5 border-t border-steel/70 pt-3.5">
          <button type="submit" className={buttonClass}>
            Log In
          </button>
          <button type="button" onClick={exit} className={buttonClass}>
            Exit
          </button>
        </div>
      </form>

      <p
        id="login-error"
        role="status"
        className="min-h-4 text-center text-xs text-ember"
      >
        {error ?? (exiting ? 'Cerrá la pestaña para salir.' : '')}
      </p>
    </main>
  )
}
