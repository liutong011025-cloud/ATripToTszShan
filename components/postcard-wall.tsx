'use client'
// v3 - Fix cache

import { useState } from 'react'
import PostcardCard from '@/components/postcard-card'
import PostcardModal from '@/components/postcard-modal'

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

interface PostcardWallProps {
  postcards: Postcard[]
  onPostcardVoted: () => void
  onPostcardDeleted?: (id: string) => void
}

export default function PostcardWall({ postcards, onPostcardVoted, onPostcardDeleted }: PostcardWallProps) {
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null)

  const handleDelete = async (id: string) => {
    if (onPostcardDeleted) {
      await onPostcardDeleted(id)
    }
    if (selectedPostcard?.id === id) {
      setSelectedPostcard(null)
    }
  }

  return (
    <>
      {/* Postcard Grid - 2 columns on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-10">
        {postcards.map((postcard) => (
          <PostcardCard 
            key={postcard.id}
            postcard={postcard} 
            onClick={() => setSelectedPostcard(postcard)}
            onDelete={() => handleDelete(postcard.id)}
          />
        ))}
      </div>

      {selectedPostcard && (
        <PostcardModal
          postcard={selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
          onVoted={() => {
            setSelectedPostcard(null)
            onPostcardVoted()
          }}
        />
      )}
    </>
  )
}
