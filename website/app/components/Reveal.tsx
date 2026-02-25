'use client'

import { useEffect, useRef, ReactNode, CSSProperties } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
  variant?: 'up' | 'left' | 'right' | 'scale'
}

export function Reveal({ children, delay = 0, className = '', style, variant = 'up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  const baseClass =
    variant === 'left'  ? 'reveal-left'  :
    variant === 'right' ? 'reveal-right' :
    variant === 'scale' ? 'reveal-scale' :
    'reveal'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${baseClass} ${className}`} style={style}>
      {children}
    </div>
  )
}
