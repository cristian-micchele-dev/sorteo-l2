/**
 * La identidad del clan: escudo, nombre y lema.
 *
 * Vive en un solo lugar porque aparece en la cabecera y en el escenario. Si
 * cada pantalla la dibujara a mano, cambiar el lema sería cazar copias por
 * todo el proyecto.
 *
 * El logo va con alt vacío a propósito: "Black Templars" está escrito al
 * lado, y repetirlo en el alt haría que un lector de pantalla lo lea dos
 * veces.
 */

const NAME = 'Black Templars'
const LOGO = '/clan-logo.png'

/** Variante de una línea, para barras donde el espacio vertical es oro. */
export const ClanCrestInline = () => (
  <div className="flex items-center gap-3">
    <img src={LOGO} width={80} height={40} alt="" className="h-8 w-auto" />
    <span className="title-sheen font-display text-base font-bold tracking-[0.22em] uppercase">
      {NAME}
    </span>
  </div>
)

/** Variante de cabecera: ES el encabezado de la página, con el lema debajo. */
export const ClanCrestHeading = () => (
  <div>
    <h1 className="flex flex-col items-start gap-1.5">
      <img src={LOGO} width={80} height={40} alt="" className="animate-crest h-10 w-auto" />
      <span className="title-sheen font-display text-xl leading-none font-bold tracking-[0.16em] uppercase sm:text-2xl">
        {NAME}
      </span>
    </h1>

    {/* Las cruces son adorno: un lector de pantalla lee sólo el lema. */}
    <p className="mt-1.5 flex items-center gap-1.5 text-xs tracking-wide text-ash italic">
      <span aria-hidden="true" className="text-sm not-italic text-crimson">
        ✠
      </span>
      El miedo No cruza este estandarte
      <span aria-hidden="true" className="text-sm not-italic text-crimson">
        ✠
      </span>
    </p>
  </div>
)
