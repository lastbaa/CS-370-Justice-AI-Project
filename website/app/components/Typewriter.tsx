'use client'

import { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  startDelay?: number   // ms before typing begins
  speed?: number        // ms per character
  className?: string
  style?: React.CSSProperties
}

export function Typewriter({ text, startDelay = 800, speed = 38, className = '', style }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [done, setDone] = useState(false)

  // Type characters one by one
  useEffect(() => {
    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const start = setTimeout(() => {
      const tick = () => {
        if (i < text.length) {
          i++
          setDisplayed(text.slice(0, i))
          timer = setTimeout(tick, speed)
        } else {
          setDone(true)
        }
      }
      tick()
    }, startDelay)

    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [text, startDelay, speed])

  // Blink cursor — faster while typing, slower after done, then stop
  useEffect(() => {
    if (done) {
      // Blink 3 more times then hide permanently
      let count = 0
      const blink = setInterval(() => {
        setCursorVisible(v => !v)
        count++
        if (count >= 6) {
          clearInterval(blink)
          setCursorVisible(false)
        }
      }, 500)
      return () => clearInterval(blink)
    }

    const blink = setInterval(() => {
      setCursorVisible(v => !v)
    }, 530)
    return () => clearInterval(blink)
  }, [done])

  return (
    <span className={className} style={style}>
      {displayed}
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: 'rgba(255,255,255,0.7)',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          borderRadius: '1px',
          opacity: cursorVisible ? 1 : 0,
          transition: 'opacity 0.1s',
        }}
      />
    </span>
  )
}
