import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

// Preserva a entrada vertical e a máscara deslizante do componente fornecido.
export function BoxReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion()
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 75 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        {children}
      </motion.div>
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 inset-y-1 z-20 rounded bg-[#40E0D0]"
          initial={{ left: 0 }}
          whileInView={{ left: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
        />
      )}
    </div>
  )
}
