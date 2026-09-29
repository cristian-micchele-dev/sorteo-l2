import '@testing-library/jest-dom/vitest'

/*
 * jsdom no trae motor de audio: `play()` y `pause()` escupen un error
 * "Not implemented" que ensucia la salida sin que nada esté roto.
 * Se stubean acá, una vez, en vez de ensuciar el código de producción.
 */
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => undefined,
})
