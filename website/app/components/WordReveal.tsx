'use client'

import { useEffect, useRef, useState } from 'react'

interface WordRevealProps {
  text: string
  delay?: number     // start delay after entering viewport (ms)
  stagger?: number   // ms between each word
  className?: string
  style?: React.CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function WordReveal({ text, delay = 0, stagger = 70, className = '', style, as: Tag = 'span' }: WordRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} style={{ display: 'block', ...style }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(22px)',
            transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms`,
            marginRight: '0.28em',
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  )
}
