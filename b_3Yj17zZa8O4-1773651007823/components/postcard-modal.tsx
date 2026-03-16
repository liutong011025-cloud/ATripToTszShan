'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'

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

interface PostcardModalProps {
  postcard: Postcard
  onClose: () => void
  onVoted: () => void
}

export default function PostcardModal({ postcard, onClose, onVoted }: PostcardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (backRef.current) {
      gsap.set(backRef.current, { rotationY: 180 })
    }
  }, [])

  const handleFlip = () => {
    const next = !isFlipped
    setIsFlipped(next)
    if (cardContainerRef.current) {
      gsap.to(cardContainerRef.current, {
        rotationY: next ? 180 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  }

  const displayName = postcard.anonymous ? 'Anonymous' : postcard.name

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Card wrapper */}
      <div
        className="w-full max-w-3xl"
        style={{ perspective: '1500px' }}
        onClick={(e) => { e.stopPropagation(); handleFlip() }}
      >
        <div
          ref={cardContainerRef}
          className="relative w-full cursor-pointer"
          style={{ transformStyle: 'preserve-3d', aspectRatio: '16/9' }}
        >
          {/* Front — Photo */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={postcard.photo_url}
              alt="Postcard"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Back — Trip description + AI reflection */}
          <div
            ref={backRef}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#fdf8f0]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Lined paper texture */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.04)_95%)] bg-[length:100%_2rem] pointer-events-none" />
            {/* Red margin line */}
            <div className="absolute left-12 top-0 bottom-0 w-px bg-red-200/70 pointer-events-none" />

            {/* Scrollable content */}
            <div className="relative h-full overflow-y-auto px-16 py-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Trip Description */}
              <div className="mb-6">
                <p
                  className="text-xs uppercase tracking-widest text-amber-600/70 mb-2"
                  style={{ fontFamily: 'var(--font-handwriting), cursive' }}
                >
                  Trip Notes
                </p>
                <p
                  className="text-stone-700 text-xl leading-loose"
                  style={{ fontFamily: 'var(--font-handwriting), cursive' }}
                >
                  {postcard.short_desc}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-amber-200" />
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <div className="h-px flex-1 bg-amber-200" />
              </div>

              {/* AI & Buddhism Reflection */}
              <div className="mb-8">
                <p
                  className="text-xs uppercase tracking-widest text-amber-600/70 mb-2"
                  style={{ fontFamily: 'var(--font-handwriting), cursive' }}
                >
                  AI & Buddhism Reflection
                </p>
                <p
                  className="text-stone-700 text-xl leading-loose"
                  style={{ fontFamily: 'var(--font-handwriting), cursive' }}
                >
                  {postcard.pro_reflection}
                </p>
              </div>

              {/* Signature */}
              <p
                className="text-stone-500 text-lg text-right"
                style={{ fontFamily: 'var(--font-handwriting), cursive' }}
              >
                — {displayName}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-sm mt-4 select-none">
          {isFlipped ? 'Click to view photo' : 'Click to see reflection'}
        </p>
      </div>
    </div>
  )
}
