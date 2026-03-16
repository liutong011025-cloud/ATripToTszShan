'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

interface PostcardFormProps {
  onSubmitted: (postcard: any) => void
}

export default function PostcardForm({ onSubmitted }: PostcardFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    anonymous: false,
    shortDesc: '',
    proReflection: '',
    photoFile: null as File | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photoFile: file,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name || 'Anonymous')
      formDataToSend.append('anonymous', String(formData.anonymous))
      formDataToSend.append('shortDesc', formData.shortDesc)
      formDataToSend.append('proReflection', formData.proReflection)

      if (formData.photoFile) {
        formDataToSend.append('photo', formData.photoFile)
      }

      const response = await fetch('/api/postcards', {
        method: 'POST',
        body: formDataToSend,
      })

      // Handle non-JSON responses (e.g., "Request Entity Too Large")
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 413) {
          throw new Error('Image file is too large. Please use a smaller image (max 4.5MB).')
        }
        const text = await response.text()
        throw new Error(text || `Server error: ${response.status}`)
      }

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to submit postcard')
      }

      onSubmitted(responseData)

      // Reset form
      setFormData({
        name: '',
        anonymous: false,
        shortDesc: '',
        proReflection: '',
        photoFile: null,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-amber-50/95 to-white/90 backdrop-blur-sm border border-amber-200 rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
      {/* Decorative header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
        <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
        </svg>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
      </div>

      <h2 className="text-2xl font-bold text-center text-amber-900 mb-8 tracking-wide">Submit Postcard</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <FieldGroup>
          <FieldLabel className="text-amber-900 font-semibold">Name</FieldLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name (optional)"
            className="border-amber-200 bg-white/50 focus:ring-amber-400"
          />
        </FieldGroup>

        {/* Anonymous Toggle */}
        <FieldGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleInputChange}
              className="w-4 h-4 rounded accent-amber-600"
            />
            <span className="text-sm text-amber-900 font-medium">Post anonymously</span>
          </label>
        </FieldGroup>

        {/* Short Description */}
        <FieldGroup>
          <FieldLabel className="text-amber-900 font-semibold">Short Description of your trip</FieldLabel>
          <textarea
            name="shortDesc"
            value={formData.shortDesc}
            onChange={handleInputChange}
            placeholder="A brief summary of your trip to Tsz Shan Monastery..."
            className="w-full px-4 py-3 border border-amber-200 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-24 font-medium text-amber-900"
          />
        </FieldGroup>

        {/* Photo Upload */}
        <FieldGroup>
          <FieldLabel className="text-amber-900 font-semibold">Photo</FieldLabel>
          <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 bg-white/40 hover:bg-white/60 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="w-full"
            />
          </div>
          {formData.photoFile && (
            <p className="text-xs text-green-600 font-semibold mt-2">✓ Selected: {formData.photoFile.name}</p>
          )}
        </FieldGroup>

        {/* Reflection Field */}
        <FieldGroup>
          <FieldLabel className="text-amber-900 font-semibold">After this visit, what deeper understanding do you have about AI and Buddhism?</FieldLabel>
          <p className="text-xs text-amber-700 mt-1">You can choose to write in English or Chinese.</p>
          <textarea
            name="proReflection"
            value={formData.proReflection}
            onChange={handleInputChange}
            placeholder="Share your reflections on the intersection of AI and Buddhist philosophy..."
            className="w-full px-4 py-3 border border-amber-200 bg-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-32 font-medium text-amber-900"
          />
        </FieldGroup>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.shortDesc.trim() || !formData.proReflection.trim() || !formData.photoFile}
          className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Postcard'}
        </button>
      </form>
    </div>
  )
}
