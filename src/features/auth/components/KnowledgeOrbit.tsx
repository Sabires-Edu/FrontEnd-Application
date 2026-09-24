import { useEffect, useRef, type CSSProperties } from 'react'
import { Atom, BookOpen, Brain, Globe, GraduationCap, Lightbulb, MessageCircle, Music, Paintbrush, Sparkles, Users } from 'lucide-react'

const icons = [
  { Icon: BookOpen, radius: 100, delay: 0, reverse: false },
  { Icon: Lightbulb, radius: 100, delay: 10, reverse: false },
  { Icon: Users, radius: 160, delay: 3, reverse: true },
  { Icon: MessageCircle, radius: 160, delay: 13, reverse: true },
  { Icon: GraduationCap, radius: 220, delay: 6, reverse: false },
  { Icon: Brain, radius: 220, delay: 16, reverse: false },
  { Icon: Globe, radius: 280, delay: 1, reverse: true },
  { Icon: Sparkles, radius: 280, delay: 11, reverse: true },
]

const students = [
  { initials: 'LA', x: 16, y: 15, depth: 48 },
  { initials: 'RM', x: 82, y: 24, depth: 16 },
  { initials: 'BC', x: 12, y: 72, depth: 28 },
  { initials: 'JP', x: 79, y: 82, depth: 56 },
]

const subjects = [
  { Icon: Atom, x: 65, y: 8 },
  { Icon: Paintbrush, x: 7, y: 42 },
  { Icon: Music, x: 94, y: 60 },
]

const communityLinks = ['M16 15 Q32 12 50 50', 'M82 24 Q70 42 50 50', 'M12 72 Q32 82 50 50', 'M79 82 Q60 85 50 50', 'M16 15 Q4 40 12 72', 'M82 24 Q100 52 79 82']

// Órbitas com contrarrotação e ondas concêntricas do original 21st.dev.
function usePanelParallax() {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const media = window.matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    let detach = () => {}

    function configure() {
      detach()
      if (!panel || !media.matches) return
      let frame = 0
      let lastTime = 0
      let x = 0
      let y = 0
      let targetX = 0
      let targetY = 0
      let bounds: DOMRect | undefined

      function render(time: number) {
        if (!panel) return
        const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16
        lastTime = time
        const blend = 1 - Math.exp(-elapsed / 160)
        x += (targetX - x) * blend
        y += (targetY - y) * blend
        const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.001
        if (settled) { x = targetX; y = targetY }
        panel.style.setProperty('--pointer-x', String(x))
        panel.style.setProperty('--pointer-y', String(y))
        frame = settled ? 0 : requestAnimationFrame(render)
        if (settled) lastTime = 0
      }
      function schedule() {
        if (!frame) frame = requestAnimationFrame(render)
      }
      function move(event: PointerEvent) {
        if (event.pointerType !== 'mouse' || !panel) return
        bounds ??= panel.getBoundingClientRect()
        targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
        targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
        schedule()
      }
      function reset() {
        targetX = 0
        targetY = 0
        bounds = undefined
        schedule()
      }
      function invalidateBounds() { bounds = undefined }
      panel.addEventListener('pointermove', move, { passive: true })
      panel.addEventListener('pointerleave', reset)
      panel.addEventListener('pointercancel', reset)
      window.addEventListener('blur', reset)
      window.addEventListener('resize', invalidateBounds, { passive: true })
      window.addEventListener('scroll', invalidateBounds, { passive: true, capture: true })
      detach = () => {
        cancelAnimationFrame(frame)
        panel.removeEventListener('pointermove', move)
        panel.removeEventListener('pointerleave', reset)
        panel.removeEventListener('pointercancel', reset)
        window.removeEventListener('blur', reset)
        window.removeEventListener('resize', invalidateBounds)
        window.removeEventListener('scroll', invalidateBounds, true)
        panel.style.removeProperty('--pointer-x')
        panel.style.removeProperty('--pointer-y')
      }
    }
    configure()
    media.addEventListener('change', configure)
    return () => { detach(); media.removeEventListener('change', configure) }
  }, [])

  return panelRef
}

export function KnowledgeOrbit() {
  const panelRef = usePanelParallax()

  return (
    <aside className="sabires-knowledge-panel relative hidden min-h-dvh overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div ref={panelRef} aria-hidden="true" className="sabires-depth-panel relative h-[620px] w-full shrink-0">
        <div className="sabires-depth-scene">
        <div className="sabires-depth-layer sabires-depth-back"><div className="sabires-ambient-glow" /></div>
        <div className="sabires-depth-layer sabires-depth-back">
          <div className="sabires-dot-texture" />
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="sabires-particle" style={{ left: `${5 + (index * 29) % 90}%`, top: `${6 + (index * 23) % 88}%`, animationDelay: `-${index * 2.1}s`, animationDuration: `${16 + index}s` }} />
          ))}
          <span className="sabires-sculpture sabires-sculpture-ring" />
          <span className="sabires-sculpture sabires-sculpture-sphere" />
        </div>
        <div className="sabires-depth-layer sabires-depth-network">
          <svg className="sabires-community-links" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            {communityLinks.map((path, index) => (
              <g key={path}>
                <path d={path} className="sabires-community-link" vectorEffect="non-scaling-stroke" />
                <path d={path} pathLength="100" className="sabires-connection-pulse" vectorEffect="non-scaling-stroke" style={{ animationDelay: `-${index * 2.7}s`, animationDuration: `${12 + index * 2}s` }} />
              </g>
            ))}
          </svg>
        </div>
        {students.map(({ initials, x, y, depth }, index) => (
          <div key={initials} className="sabires-depth-layer" style={{ '--travel': `${10 + index * 2}px`, '--depth': `${depth}px` } as CSSProperties}>
            <div className="sabires-student-anchor" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className={`sabires-student-node ${index % 2 ? 'sabires-student-lime' : ''}`} style={{ animationDelay: `-${index * 2}s`, animationDuration: `${9 + index}s` }}>
                <span>{initials}</span><i className="sabires-student-signal" />
              </div>
            </div>
          </div>
        ))}
        {subjects.map(({ Icon, x, y }, index) => (
          <div key={index} className="sabires-depth-layer" style={{ '--travel': '6px', '--depth': '-8px' } as CSSProperties}>
            <div className="sabires-subject-anchor" style={{ left: `${x}%`, top: `${y}%` }}>
              <Icon className="sabires-subject-symbol" size={25} strokeWidth={1.3} style={{ animationDelay: `-${index * 3}s` }} />
            </div>
          </div>
        ))}
        <div className="sabires-depth-layer sabires-depth-back pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]">
          {Array.from({ length: 11 }, (_, index) => (
            <span key={index} className="sabires-ripple absolute left-1/2 top-1/2 rounded-full border border-teal-600 bg-[#40E0D0]/10" style={{ width: 100 + index * 70, height: 100 + index * 70, opacity: Math.max(0.025, 0.24 - index * 0.025), animationDelay: `${index * 0.06}s`, borderStyle: index === 10 ? 'dashed' : 'solid' }} />
          ))}
        </div>
        <div className="sabires-depth-layer sabires-depth-network">
        <svg className="absolute h-[560px] w-[560px] text-teal-600/15" viewBox="0 0 560 560" fill="none">
          {['M280 95 440 190 470 350', 'M470 350 280 460 105 370', 'M105 370 120 180 280 95', 'M280 95 280 460', 'M120 180 470 350', 'M105 370 440 190'].map((path, index) => (
            <path key={path} className="sabires-network-link" d={path} stroke="currentColor" strokeWidth="1" style={{ animationDelay: `-${index * 1.7}s` }} />
          ))}
          {[[280, 95], [440, 190], [470, 350], [280, 460], [105, 370], [120, 180]].map(([cx, cy], index) => <circle className="sabires-network-point" style={{ animationDelay: `-${index * 1.3}s` }} key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="currentColor" />)}
          {[100, 160, 220, 280].map((radius) => <circle key={radius} cx="280" cy="280" r={radius} stroke="currentColor" strokeDasharray={radius === 280 ? '4 8' : undefined} />)}
        </svg>
        </div>
        <div className="sabires-depth-layer sabires-depth-brand z-10">
        <div className="sabires-brand-float flex flex-col items-center gap-2">
          <span className="sabires-heading bg-linear-to-b from-[#1F2937] to-teal-700/65 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">Sabires<span className="text-[#84CC16]">.</span></span>
          <span className="text-[10px] font-medium tracking-[0.2em] text-teal-800">SABER CONECTA.</span>
        </div>
        </div>
        {icons.map(({ Icon, radius, delay, reverse }, index) => (
          <div key={index} className="sabires-depth-layer z-10" style={{ '--travel': `${index % 2 ? 14 : 7}px`, '--depth': `${index % 2 ? 36 : 12}px` } as CSSProperties}>
            <div className="sabires-orbit absolute" style={{ '--radius': `${radius}px`, '--angle': `${delay * 18 * (reverse ? -1 : 1)}deg`, '--orbit-duration': `${64 + index * 9}s`, animationDelay: `-${delay}s`, animationDirection: reverse ? 'reverse' : 'normal' } as CSSProperties}>
              <div className={`sabires-orbit-icon flex size-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[0_5px_20px_-8px_#0f766e40] ${index % 2 ? 'text-lime-700' : 'text-teal-700'}`} style={{ animationDuration: `${7 + index * 0.7}s`, animationDelay: `-${delay}s` }}>
                <Icon size={23} strokeWidth={1.6} />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
      <div className="relative -mt-6 max-w-sm px-5 pb-12 text-center">
        <h2 className="sabires-heading text-2xl font-semibold leading-snug">Conhecimento cresce<br />quando a gente compartilha.</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">Uma comunidade de mentes curiosas.<br />Muitas conexões. Infinitas descobertas.</p>
      </div>
    </aside>
  )
}
