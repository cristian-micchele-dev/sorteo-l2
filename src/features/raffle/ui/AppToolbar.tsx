import { Button } from '../../../shared/ui/Button'

interface AppToolbarProps {
  readonly rosterCount: number
  readonly canPresent: boolean
  readonly locked: boolean
  readonly musicOn: boolean
  readonly onPresent: () => void
  readonly onOpenRoster: () => void
  readonly onToggleMusic: () => void
  readonly onReset: () => void
  readonly onLogOut?: () => void
}

/**
 * Los botones de la cabecera. Salieron de App porque eran la mitad del
 * archivo y no tienen nada que ver con el layout del sorteo: acá reciben
 * banderas y devuelven clicks, nada más.
 */
export const AppToolbar = ({
  rosterCount,
  canPresent,
  locked,
  musicOn,
  onPresent,
  onOpenRoster,
  onToggleMusic,
  onReset,
  onLogOut,
}: AppToolbarProps) => (
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <p className="hidden text-right text-[0.6875rem] leading-tight text-ash/60 sm:block">
      Azar criptográfico, sin sesgo.
      <br />
      Nadie gana dos veces.
    </p>

    <Button
      variant="primary"
      disabled={!canPresent}
      onClick={onPresent}
      title="Agranda la ruleta y esconde los paneles, para transmitir"
    >
      Presentación
    </Button>

    <Button onClick={onOpenRoster} disabled={locked}>
      Roster ({rosterCount})
    </Button>

    <Button
      onClick={onToggleMusic}
      aria-pressed={musicOn}
      title={musicOn ? 'Apagar la música de fondo' : 'Encender la música de fondo'}
    >
      {musicOn ? '♪ Música' : 'Sin música'}
    </Button>

    {onLogOut && (
      <Button onClick={onLogOut} title="Cerrar sesión y volver al login">
        Salir
      </Button>
    )}

    <Button variant="danger" disabled={locked} onClick={onReset}>
      Reiniciar
    </Button>
  </div>
)
