# Ruleta Rusa — Reparto de botín (Lineage II)

Sorteo por eliminación para repartir drops entre los integrantes de un clan.
Un giro paga UN item a UNA persona, y esa persona sale del pozo: **nadie gana dos veces**.

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run test       # suite completa (dominio + flujo)
npm run typecheck  # tsc --noEmit
```

## Cómo se usa

1. Pegá los items del botín (uno por línea o separados por comas).
2. **Roster** guarda la lista del clan una sola vez. Destildá a quien no vino y **Cargar al pozo** suma sólo a los presentes. También podés pegar integrantes a mano en su panel.
3. **Presentación** agranda la ruleta y esconde los paneles de carga — es el modo para transmitir por Discord. **Espacio** gira, **Escape** sale.
4. Tocá la ruleta (o Espacio) para girar. Se sortea el primer item de la cola.
5. Cuando frena, el ganador aparece en grande a pantalla completa. **Continuar** cierra el anuncio y pasa al siguiente item — no se cierra solo, para que el clan alcance a leerlo.
6. Al terminar, **Copiar reparto** deja el resultado en texto plano para pegarlo donde el clan lo pueda auditar.
7. **Reiniciar** limpia la mesa para el próximo raid. No se guarda nada: el reparto se hace en el momento y el registro queda en el Discord.

El sorteo en curso se guarda en `localStorage`: si se recarga la página en medio del reparto, no se pierde nada.
El **roster vive en su propia clave**, así que Reiniciar no lo toca: un reparto va y viene, el clan queda.
El botón `↺` de cada ganador deshace la asignación (devuelve el item a la cola y la persona al pozo).

## Publicar

Sitio estático, sin backend. Cualquier hosting de archivos sirve.

```bash
npm run build     # genera dist/
npx vercel --prod # sube dist/ y devuelve la URL
```

**Qué NO hace el deploy:** no hay estado compartido. Cada persona que abre la
URL tiene su propio sorteo, guardado en el
`localStorage` de SU navegador. Si el clan quisiera compartir estado, hace
falta un backend — y ahí la contraseña tendría que validarse
del lado del servidor.

**La contraseña no es seguridad.** Vive en el bundle, que viaja al navegador
de cualquiera. Es una tranca contra curiosos, nada más: se saltea escribiendo
`sessionStorage.setItem('ruleta-rusa-l2:session', '1')` en la consola. No hay
nada que proteger detrás igual, porque los datos son locales de cada uno.

## Decisiones que importan

**El ganador lo decide el dominio, no la ruleta.** `drawWinner` elige ANTES de que arranque la
animación; la rueda sólo va a buscar el sector correcto. Por eso el sorteo se puede testear
sin tocar el DOM, y por eso con 60 integrantes la ruleta puede mostrar sólo 20 sin afectar el
resultado: entran todos al sorteo, no todos caben en el dibujo.

**Azar criptográfico sin sesgo de módulo.** `Math.random() * n | 0` reparte mal cuando `n` no
divide al rango: los primeros índices salen más seguido. `unbiasedIndex` parte el rango de 32 bits
en baldes iguales y descarta el sobrante. En un sorteo entre gente que se conoce y que va a
discutir el resultado, la imparcialidad no es un detalle estético.

**La fase visible se deriva, no se guarda.** Sólo se persisten los estados del giro
(`idle`/`spinning`/`revealing`). `ready`, `empty` y `finished` salen de las listas — guardarlos
sería aceptar estados imposibles, como un sorteo "terminado" con items todavía en la cola.

**Los items repetidos valen, los integrantes duplicados no.** En un raid caen dos Draco Leather
iguales. Una persona, en cambio, tiene un solo ticket — y quien ya ganó no puede volver a entrar
salvo por el `↺`, que es explícito.

## Estructura

```
src/features/raffle/
├─ domain/        lógica pura del sorteo — CERO imports de React
├─ application/   useRaffle: reducer + reloj de la animación + persistencia
└─ ui/            presentacionales: props entran, eventos salen

src/features/auth/      login por contraseña
src/features/roster/    lista estable del clan y asistencia
```
