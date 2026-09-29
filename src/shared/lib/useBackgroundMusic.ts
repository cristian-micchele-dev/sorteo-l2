import { useCallback, useEffect, useRef, useState } from 'react'

const MUSIC_KEY = 'ruleta-rusa-l2:music'
const THEME_SRC = '/dion-theme.mp3'

/** Música de fondo: acompaña, no tapa. Nadie quiere gritar sobre su propia app. */
const VOLUME = 0.32

/** Por defecto suena; sólo se calla si el usuario lo pidió antes. */
const readEnabled = (): boolean => {
  try {
    return globalThis.localStorage?.getItem(MUSIC_KEY) !== '0'
  } catch {
    return true
  }
}

export const useBackgroundMusic = () => {
  const [enabled, setEnabled] = useState(readEnabled)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // El elemento se crea una sola vez y vive mientras viva la pantalla.
  useEffect(() => {
    let audio: HTMLAudioElement | null = null
    try {
      audio = new Audio(THEME_SRC)
      audio.loop = true
      audio.volume = VOLUME
      audioRef.current = audio
    } catch {
      audioRef.current = null
    }

    return () => {
      audio?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!enabled) {
      audio.pause()
      return
    }

    const started: unknown = audio.play()
    if (started instanceof Promise) {
      started.catch(() => {
        // Normal al recargar con sesión abierta: el navegador exige un gesto
        // antes de sonar. El listener de abajo lo resuelve sin molestar.
      })
    }

    /*
     * Red de seguridad para la política de autoplay: si el navegador bloqueó
     * la reproducción, el primer click en cualquier parte la destraba.
     */
    const retry = () => {
      if (audio.paused) {
        const again: unknown = audio.play()
        if (again instanceof Promise) again.catch(() => undefined)
      }
    }

    globalThis.addEventListener('pointerdown', retry, { once: true })
    return () => globalThis.removeEventListener('pointerdown', retry)
  }, [enabled])

  const toggle = useCallback(() => {
    setEnabled((previous) => {
      const next = !previous
      try {
        globalThis.localStorage?.setItem(MUSIC_KEY, next ? '1' : '0')
      } catch {
        // Modo incógnito: vale para esta sesión.
      }
      return next
    })
  }, [])

  return { musicOn: enabled, toggleMusic: toggle }
}
