'use client'

import { useState, useEffect } from 'react'
import PostcardForm from '@/components/postcard-form'
import PostcardWall from '@/components/postcard-wall'

export default function Home() {
  const [postcards, setPostcards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPostcards()
  }, [])

  const fetchPostcards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/postcards')
      const data = await response.json()
      setPostcards(Array.isArray(data) ? data : [])
    } catch {
      setPostcards([])
    } finally {
      setLoading(false)
    }
  }

  const handlePostcardSubmitted = (newPostcard: any) => {
    if (newPostcard?.id) {
      setPostcards((prev) => [newPostcard, ...prev])
    }
    setShowForm(false)
  }

  const handlePostcardDeleted = async (id: string) => {
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'Tony1025',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete postcard')
      }

      setPostcards((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
      alert('删除失败，请检查密码或稍后再试。')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Fixed blurred background - anime style monastery */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/monastery-anime.png)',
          filter: 'blur(3px)',
          transform: 'scale(1.05)',
        }}
      />
      <div className="fixed inset-0 bg-white/20 -z-10" />

      {/* Header with glass morphism and floating animation */}
      <header className="relative overflow-hidden">
        {/* Very light frosted glass background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-sky-100/30 to-amber-100/30" />
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* Floating decorative circles */}
        <div className="absolute top-2 left-10 w-16 h-16 bg-emerald-300/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-4 right-16 w-12 h-12 bg-sky-300/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-2 left-1/3 w-10 h-10 bg-amber-300/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-3">
          {/* Top ornament with lotus icon */}
          <div className="flex items-center justify-center gap-2 mb-0">
            <img 
              src="/images/lotus-icon.png" 
              alt="Lotus" 
              className="h-14 w-14 drop-shadow-lg"
            />
          </div>

          {/* Main title */}
          <h1 className="text-center text-3xl font-bold tracking-wide bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-700 bg-clip-text text-transparent drop-shadow-sm -mt-1">
            A Trip To TSZ SHAN MONASTERY
          </h1>
          <p className="text-center text-emerald-800/70 text-sm font-light mt-1 tracking-wide">
            Share your journey and reflections
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400/70 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-teal-400/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-sky-400/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {showForm ? (
          <div>
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 px-4 py-2 text-amber-100 hover:text-white transition-colors font-semibold shadow-md shadow-amber-900/40"
            >
              ← Back to Wall
            </button>
            <PostcardForm onSubmitted={handlePostcardSubmitted} />
          </div>
        ) : (
          <>
            {/* Submit button + hint */}
            <div className="flex flex-col items-center gap-2 mb-10">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors font-semibold shadow-lg"
              >
                Submit Postcard
              </button>
              <p className="text-white/70 text-sm">
                Click on a postcard to read
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-300" />
              </div>
            ) : postcards.length === 0 ? (
              <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-amber-200">
                <p className="text-lg text-amber-900 mb-4">No postcards yet. Be the first to share!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                >
                  Create First Postcard
                </button>
              </div>
            ) : (
              <PostcardWall
                postcards={postcards}
                onPostcardVoted={fetchPostcards}
                onPostcardDeleted={handlePostcardDeleted}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
