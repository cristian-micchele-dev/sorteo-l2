import { useCallback, useState } from 'react'

const SESSION_KEY = 'ruleta-rusa-l2:session'

const readSession = (): boolean => {
  try {
    return globalThis.sessionStorage?.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * La sesión vive en `sessionStorage`, no en `localStorage`: al cerrar el
 * navegador se pide la clave de nuevo. Si quedara guardada para siempre, el
 * login no filtraría nada en la práctica.
 */
export const useSession = () => {
  const [authenticated, setAuthenticated] = useState(readSession)

  const logIn = useCallback(() => {
    try {
      globalThis.sessionStorage?.setItem(SESSION_KEY, '1')
    } catch {
      // Modo incógnito: la sesión vale mientras la pestaña siga abierta.
    }
    setAuthenticated(true)
  }, [])

  const logOut = useCallback(() => {
    try {
      globalThis.sessionStorage?.removeItem(SESSION_KEY)
    } catch {
      // idem
    }
    setAuthenticated(false)
  }, [])

  return { authenticated, logIn, logOut }
}
