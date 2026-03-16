'use client'

import { useState, useEffect, useRef, MouseEvent } from 'react'
import gsap from 'gsap'
import ProfileCard from './ProfileCard'

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

  const handleDoubleClick = () => {
    if (!onDelete) return
    const confirmDelete = window.confirm('是否删除这张明信片？')
    if (!confirmDelete) return
    onDelete()
  }

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

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

    // 初始进场动画：淡入 + 上移
    gsap.set(cardRef.current, {
      opacity: 0,
      y: 50,
      filter: 'blur(10px)',
    })

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
        scale: 0.97,
        duration: 0.25,
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
        duration: 0.25,
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

  const displayName = postcard.anonymous ? 'Anonymous' : postcard.name
  const imageUrl = postcard.thumbnail_url || postcard.photo_url

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className="relative cursor-pointer"
      style={{ aspectRatio: '16/9' }}
    >
      {/* 使用 ProfileCard 实现 holographic + tilt 效果 */}
      <ProfileCard
        avatarUrl={imageUrl}
        showUserInfo={false}
        enableTilt={true}
        enableMobileTilt={false}
        behindGlowEnabled={true}
        behindGlowColor="rgba(125, 190, 255, 0.67)"
        innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
        name={displayName}
        title=""
        handle=""
        status=""
        contactText=""
      />

      {/* 作者名渐变遮罩 */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-4 opacity-0 rounded-[30px]"
      >
        <p className="text-white text-sm font-medium">{displayName}</p>
      </div>
    </div>
  )
}

