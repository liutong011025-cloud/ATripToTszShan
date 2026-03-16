'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  extraScale?: number
  children?: React.ReactNode
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

function ease(t: number, easing: NonNullable<ClickSparkProps['easing']>) {
  const clamped = Math.max(0, Math.min(1, t))
  switch (easing) {
    case 'linear':
      return clamped
    case 'ease-in':
      return clamped * clamped
    case 'ease-in-out':
      return clamped < 0.5
        ? 2 * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 2) / 2
    case 'ease-out':
    default:
      return 1 - Math.pow(1 - clamped, 2)
  }
}

export default function ClickSpark({
  sparkColor = '#fff',
  sparkSize = 23,
  sparkRadius = 30,
  sparkCount = 11,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children,
}: ClickSparkProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const rafRef = useRef<number | null>(null)

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  const resizeCanvas = useCallback(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const rect = wrapper.getBoundingClientRect()
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }, [dpr])

  useEffect(() => {
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [resizeCanvas])

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const sparks = sparksRef.current
      const alive: Spark[] = []

      for (const s of sparks) {
        const t = (now - s.startTime) / duration
        if (t >= 1) continue
        const p = ease(t, easing)

        const r = sparkRadius * p * extraScale
        const x = s.x + Math.cos(s.angle) * r
        const y = s.y + Math.sin(s.angle) * r
        const size = sparkSize * (1 - p) * extraScale
        const alpha = 1 - p

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = sparkColor
        ctx.translate(x, y)
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, size / 2), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        alive.push(s)
      }

      sparksRef.current = alive

      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        rafRef.current = null
        ctx.clearRect(0, 0, rect.width, rect.height)
      }
    },
    [duration, easing, extraScale, sparkColor, sparkRadius, sparkSize]
  )

  const kick = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const now = performance.now()
      const next: Spark[] = []
      for (let i = 0; i < sparkCount; i++) {
        next.push({
          x,
          y,
          angle: (Math.PI * 2 * i) / sparkCount + Math.random() * 0.35,
          startTime: now,
        })
      }
      sparksRef.current = sparksRef.current.concat(next)
      kick()
    },
    [kick, sparkCount]
  )

  const canvasStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }),
    []
  )

  return (
    <div ref={wrapperRef} className="relative" onPointerDown={onPointerDown}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {children}
    </div>
  )
}

