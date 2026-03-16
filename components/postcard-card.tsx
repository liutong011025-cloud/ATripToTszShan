'use client'

import { useState, useEffect, useRef, MouseEvent } from 'react'
import gsap from 'gsap'

interface Postcard {
  id: string
  name: string
  anonymous: boolean
  title: string
  short_desc: string
  photo_url: string
  thumbnail_url: string
  handwritten_image_url: string
  pro_reflection: string
  avg_score: number
  score_count: number
  created_at: string
}

interface PostcardCardProps {
  postcard: Postcard
  onClick: () => void
  onDelete?: () => void
}

export default function PostcardCard({ postcard, onClick, onDelete }: PostcardCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const clickTimeoutRef = useRef<number | null>(null)
  const [pointerPos, setPointerPos] = useState({ x: 50, y: 50 })

  const handleDoubleClick = () => {
    if (!onDelete) return
    const confirmDelete = window.confirm('是否删除这张明信片？')
    if (!confirmDelete) return
    onDelete()
  }

  const handleCardClick = () => {
    // 模拟单击 / 双击：短时间内第二次点击则视为双击，不打开详情
    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      handleDoubleClick()
      return
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      clickTimeoutRef.current = null
      onClick()
    }, 250)
  }

  useEffect(() => {
    if (!cardRef.current || hasAnimated) return

    // Initial state - blur and fade
    gsap.set(cardRef.current, {
      opacity: 0,
      y: 50,
      filter: 'blur(10px)',
    })

    // Animate in with stagger effect
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.6,
      ease: 'power3.out',
      delay: Math.random() * 0.3,
    })

    setHasAnimated(true)
  }, [hasAnimated])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPointerPos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
  }

  const displayName = postcard.anonymous ? 'Anonymous' : postcard.name

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-lg cursor-pointer shadow-md bg-black/40"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Photo */}
      <img
        src={postcard.thumbnail_url || postcard.photo_url}
        alt="Postcard"
        className="w-full h-full object-cover"
      />

      {/* Holographic shine that follows the cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg mix-blend-screen opacity-80 transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle at ${pointerPos.x}% ${pointerPos.y}%, rgba(255,255,255,0.9), transparent 55%)`,
          }}
        />
      )}
      
      {/* Hover Overlay with Author Name */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-4 opacity-0"
      >
        <p className="text-white text-sm font-medium">{displayName}</p>
      </div>
    </div>
  )
}
