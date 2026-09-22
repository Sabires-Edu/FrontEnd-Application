import type { CSSProperties } from 'react'
import { BookOpen, Brain, Globe, GraduationCap, Lightbulb, MessageCircle, Sparkles, Users } from 'lucide-react'

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

// Órbitas com contrarrotação e ondas concêntricas do original 21st.dev.
export function KnowledgeOrbit() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden border-r border-teal-900/5 bg-[#eefaf5] lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div aria-hidden="true" className="relative flex h-[620px] w-full shrink-0 items-center justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]">
          {Array.from({ length: 11 }, (_, index) => (
            <span key={index} className="sabires-ripple absolute left-1/2 top-1/2 rounded-full border border-teal-600 bg-[#40E0D0]/10" style={{ width: 100 + index * 70, height: 100 + index * 70, opacity: Math.max(0.025, 0.24 - index * 0.025), animationDelay: `${index * 0.06}s`, borderStyle: index === 10 ? 'dashed' : 'solid' }} />
          ))}
        </div>
        <svg className="absolute h-[560px] w-[560px] text-teal-600/15" viewBox="0 0 560 560" fill="none">
          <path d="M280 95 440 190 470 350 280 460 105 370 120 180Z M280 95 280 460 M120 180 470 350 M105 370 440 190" stroke="currentColor" strokeWidth="1" />
          {[[280, 95], [440, 190], [470, 350], [280, 460], [105, 370], [120, 180]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="currentColor" />)}
          {[100, 160, 220, 280].map((radius) => <circle key={radius} cx="280" cy="280" r={radius} stroke="currentColor" strokeDasharray={radius === 280 ? '4 8' : undefined} />)}
        </svg>
        <div className="z-10 flex flex-col items-center gap-2">
          <span className="sabires-heading bg-linear-to-b from-[#1F2937] to-teal-700/65 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">Sabires<span className="text-[#84CC16]">.</span></span>
          <span className="text-[10px] font-medium tracking-[0.2em] text-teal-800">SABER CONECTA.</span>
        </div>
        {icons.map(({ Icon, radius, delay, reverse }, index) => (
          <div key={index} className={`sabires-orbit absolute z-10 flex size-12 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[0_5px_20px_-8px_#0f766e40] ${index % 2 ? 'text-lime-700' : 'text-teal-700'}`} style={{ '--radius': `${radius}px`, animationDelay: `-${delay}s`, animationDirection: reverse ? 'reverse' : 'normal' } as CSSProperties}>
            <Icon size={23} strokeWidth={1.6} />
          </div>
        ))}
      </div>
      <div className="relative -mt-6 max-w-sm px-5 pb-12 text-center">
        <h2 className="sabires-heading text-2xl font-semibold leading-snug">Conhecimento cresce<br />quando a gente compartilha.</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">Uma comunidade de mentes curiosas.<br />Muitas conexões. Infinitas descobertas.</p>
      </div>
    </aside>
  )
}
