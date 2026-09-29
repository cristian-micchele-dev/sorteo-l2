import { App } from './App'
import { useSession } from './features/auth/application/useSession'
import { LoginScreen } from './features/auth/ui/LoginScreen'

/**
 * Puerta de entrada. El sorteo no se monta hasta que hay sesión: así el
 * estado del reparto ni siquiera existe en pantalla antes del login.
 */
export const Root = () => {
  const { authenticated, logIn, logOut } = useSession()

  if (!authenticated) return <LoginScreen onAuthenticated={logIn} />
  return <App onLogOut={logOut} />
}
