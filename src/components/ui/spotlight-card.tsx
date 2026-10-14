import { useRef } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import './spotlight-card.css'

export interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean
}

const hues = { blue: 220, purple: 280, green: 120, red: 0, orange: 30, teal: 174 }
type GlowStyle = CSSProperties & { '--glow-hue': number }

// Adapted from the user-provided GlowCard; pointer coordinates are card-local.
export function GlowCard({ children, className = '', glowColor = 'blue', size = 'md', width, height, customSize = false }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const style: GlowStyle = { '--glow-hue': hues[glowColor], width, height }
  function syncPointer(event: PointerEvent<HTMLDivElement>) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const card = cardRef.current
    if (!card) return
    const bounds = card.getBoundingClientRect()
    card.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`)
    card.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`)
  }
  return <div ref={cardRef} onPointerMove={syncPointer} style={style} className={`sabires-glow ${customSize ? '' : `sabires-glow--${size}`} ${className}`}>{children}</div>
}
