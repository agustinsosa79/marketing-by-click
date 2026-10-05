import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { PLAY_FOUNDER_VIDEO } from '../../lib/events'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { deferSetup } from '../../lib/schedule'

interface PlayerLabels {
  play: string
  resume: string
  hint: string
  replay: string
  cursorPlay: string
  cursorPause: string
  pauseAria: string
  playAria: string
  muteAria: string
  unmuteAria: string
  seekAria: string
}

interface VideoPlayerProps {
  src: string
  poster: string
  label: string
  labels: PlayerLabels
  /** Responde al evento global "mirá el video de Ian" (botón del hero). */
  listenGlobalPlay?: boolean
}

type Mode = 'preview' | 'playing' | 'paused' | 'ended'

const fmt = (t: number) => {
  const s = Math.max(0, Math.floor(t))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Reproductor con sonido:
 *  - preview: corre muteado en loop mientras está en pantalla, con un CTA grande "Mirá el video · con sonido"
 *  - click: arranca desde el principio con audio; pausa / play, barra de progreso con seek, tiempo y mute
 *  - si sale de pantalla reproduciendo, se pausa
 *  - teclado: Espacio/K play-pausa, ← → ±5 s, M mute
 */
export function VideoPlayer({ src, poster, label, labels, listenGlobalPlay = false }: VideoPlayerProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('preview')
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const modeRef = useRef<Mode>('preview')
  const reduced = useReducedMotion()

  const setModeBoth = (m: Mode) => {
    modeRef.current = m
    setMode(m)
  }

  const startWithSound = useCallback(() => {
    const v = video.current
    if (!v) return
    v.loop = false
    v.muted = false
    v.currentTime = 0
    setMuted(false)
    v.play().catch(() => {
      // Si el navegador bloquea el audio, arranca muteado y deja el botón de sonido a mano
      v.muted = true
      setMuted(true)
      v.play().catch(() => {})
    })
    setModeBoth('playing')
  }, [])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (modeRef.current === 'preview' || modeRef.current === 'ended') return startWithSound()
    if (v.paused) {
      v.play().catch(() => {})
      setModeBoth('playing')
    } else {
      v.pause()
      setModeBoth('paused')
    }
  }

  const toggleMute = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const seekTo = (t: number) => {
    const v = video.current
    if (!v || !v.duration) return
    v.currentTime = Math.min(v.duration, Math.max(0, t))
  }

  const onSeekClick = (e: MouseEvent<HTMLDivElement>) => {
    const v = video.current
    if (!v?.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - r.left) / r.width) * v.duration
    if (modeRef.current !== 'playing' && modeRef.current !== 'paused') startWithSound()
    seekTo(t)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const v = video.current
    if (!v) return
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
      e.preventDefault()
      toggle()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      seekTo(v.currentTime + 5)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      seekTo(v.currentTime - 5)
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute()
    }
  }

  // Eventos del <video>
  useEffect(() => {
    const v = video.current
    if (!v) return
    const onMeta = () => setTime((t) => ({ ...t, duration: v.duration }))
    const onTime = () => setTime({ current: v.currentTime, duration: v.duration || 0 })
    const onEnded = () => {
      if (modeRef.current !== 'preview') setModeBoth('ended')
    }
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnded)
    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnded)
    }
  }, [])

  // Botón del hero: "Conocé a Ian"
  useEffect(() => {
    if (!listenGlobalPlay) return
    window.addEventListener(PLAY_FOUNDER_VIDEO, startWithSound)
    return () => window.removeEventListener(PLAY_FOUNDER_VIDEO, startWithSound)
  }, [listenGlobalPlay, startWithSound])

  // Barra de progreso fluida (ticker, no timeupdate) + preview/pausa según visibilidad
  useGSAP(
    (_, contextSafe) =>
      // armado diferido: no compite con el preloader (lib/schedule.ts)
      deferSetup(
        contextSafe!(() => {
          const v = video.current!
          const setFill = gsap.quickSetter(fill.current, 'scaleX')
          // escribe solo cuando cambia el tiempo (en pausa no toca el DOM)
          let last = -1
          const tick = () => {
            if (!v.duration || v.currentTime === last) return
            last = v.currentTime
            setFill(last / v.duration)
          }
          gsap.ticker.add(tick)

          const st = ScrollTrigger.create({
            trigger: wrap.current,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              if (self.isActive) {
                if (modeRef.current === 'preview' && !reduced) v.play().catch(() => {})
              } else if (modeRef.current === 'playing') {
                v.pause()
                setModeBoth('paused')
              } else if (modeRef.current === 'preview') {
                v.pause()
              }
            },
          })

          return () => {
            gsap.ticker.remove(tick)
            st.kill()
          }
        }),
      ),
    { scope: wrap, dependencies: [reduced] },
  )

  const showCta = mode !== 'playing'
  const ctaText = mode === 'ended' ? labels.replay : mode === 'paused' ? labels.resume : labels.play

  return (
    <div ref={wrap} className="group/player relative">
      <div
        className="relative overflow-hidden rounded-3xl bg-brand-night text-white shadow-lift ring-1 ring-white/10 md:rounded-4xl"
        tabIndex={0}
        role="group"
        aria-label={label}
        onKeyDown={onKey}
      >
        <video
          ref={video}
          className="aspect-video w-full object-cover"
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          data-cursor={mode === 'playing' ? labels.cursorPause : labels.cursorPlay}
          onClick={toggle}
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* CTA central: preview, pausa o final */}
        <button
          type="button"
          onClick={toggle}
          data-cursor={labels.cursorPlay}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-t from-brand-night/70 to-brand-night/10 transition-opacity duration-500 ${showCta ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <span className="relative grid size-18 place-items-center rounded-full bg-brand-signal text-white transition-transform duration-500 ease-expo group-hover/player:scale-110 md:size-24">
            {showCta && !reduced && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-brand-signal/40" />}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="relative size-7 translate-x-0.5 fill-current md:size-9">
              {mode === 'ended' ? <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /> : <path d="M7 4v16l13-8z" />}
            </svg>
          </span>
          <span className="flex items-center gap-2 text-sm font-bold md:text-base">
            {ctaText}
            {mode === 'preview' && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">{labels.hint}</span>}
          </span>
        </button>

        {/* Controles */}
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-brand-night/85 px-3 py-2 backdrop-blur-md transition-opacity duration-500 md:gap-4 md:px-4 md:py-3 ${mode === 'preview' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <button type="button" onClick={toggle} aria-label={mode === 'playing' ? labels.pauseAria : labels.playAria} className="grid size-10 place-items-center rounded-full bg-white/10 transition duration-300 ease-expo hover:scale-110 hover:bg-brand-signal active:scale-95">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
              {mode === 'playing' ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4v16l13-8z" />}
            </svg>
          </button>

          <div
            role="slider"
            tabIndex={0}
            aria-label={labels.seekAria}
            aria-valuemin={0}
            aria-valuemax={Math.round(time.duration)}
            aria-valuenow={Math.round(time.current)}
            aria-valuetext={`${fmt(time.current)} / ${fmt(time.duration)}`}
            onClick={onSeekClick}
            onKeyDown={onKey}
            className="group/seek relative flex h-6 flex-1 cursor-pointer items-center"
          >
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20 transition-transform duration-300 group-hover/seek:scale-y-150">
              <div ref={fill} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brand-signal" />
            </div>
          </div>

          <span className="text-label font-semibold tabular-nums">
            {fmt(time.current)} / {fmt(time.duration)}
          </span>

          <button type="button" onClick={toggleMute} aria-label={muted ? labels.unmuteAria : labels.muteAria} className="grid size-10 place-items-center rounded-full bg-white/10 transition duration-300 ease-expo hover:scale-110 hover:bg-brand-signal active:scale-95">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2">
              <path d="M4 9h4l5-4v14l-5-4H4z" className="fill-current" />
              {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
