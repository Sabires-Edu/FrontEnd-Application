import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'

// Adaptado do input com iluminação radial do modern-animated-sign-in (21st.dev).
export const AnimatedInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AnimatedInput({ className = '', ...props }, ref) {
    const [visible, setVisible] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const background = useMotionTemplate`radial-gradient(${visible ? 100 : 0}px circle at ${mouseX}px ${mouseY}px, #40E0D0, transparent 80%)`

    return (
      <motion.div
        style={{ background }}
        onMouseMove={({ currentTarget, clientX, clientY }) => {
          const { left, top } = currentTarget.getBoundingClientRect()
          mouseX.set(clientX - left)
          mouseY.set(clientY - top)
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-xl p-0.5"
      >
        <input
          ref={ref}
          className={`h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-sm text-[#1F2937] shadow-sm transition placeholder:text-slate-400 hover:border-transparent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#40E0D0] disabled:opacity-60 ${className}`}
          {...props}
        />
      </motion.div>
    )
  },
)
