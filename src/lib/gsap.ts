import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase)

// "hop": arranque lento, aceleración fuerte en el medio y llegada muy suave. Expansión del preloader y transiciones grandes.
CustomEase.create('hop', 'M0,0 C0.71,0 0.13,1 1,1')
// "reveal" (expo.out): salida rápida y llegada muy suave. Entradas de texto e imágenes.
CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1')
// "aperture": curva medida frame a frame en reference/preloader-ref.mp4 (apertura del video y subida
// del título). Ajuste cúbico sobre reference/preloader-measurements.json, error ±0.04.
CustomEase.create('aperture', 'M0,0 C0.7,0 0.26,0.98 1,1')

gsap.defaults({ ease: 'reveal', duration: 1 })

if (typeof window !== 'undefined' && (import.meta.env.DEV || new URLSearchParams(location.search).has('debug'))) {
  ;(window as unknown as { __gsap: typeof gsap }).__gsap = gsap
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
