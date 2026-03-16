'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

interface AdminPost {
  id: string
  name: string
  anonymous: boolean
  title: string
  short_desc: string
  photo_url: string
  pro_reflection: string
  avg_score: number
  score_count: number
  hidden: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState<'posts' | 'stats'>('posts')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (token) {
      setIsAuthenticated(true)
      fetchPosts()
    }
  }

  const fetchPosts = async () => {
    if (!token) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/posts?limit=100', {
        headers: {
          'x-admin-token': token,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid admin token')
          setIsAuthenticated(false)
          setToken('')
          return
        }
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const togglePostVisibility = async (postId: string, hidden: boolean) => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          id: postId,
          hidden: !hidden,
        }),
      })

      if (!response.ok) throw new Error('Failed to update post')

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, hidden: !hidden } : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deletePost = async (postId: string) => {
    if (!token || !confirm('Are you sure? This cannot be undone.')) return

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ id: postId }),
      })

      if (!response.ok) throw new Error('Failed to delete post')

      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-orange-900 mb-6">Admin Dashboard</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <FieldGroup>
              <FieldLabel>Admin Token</FieldLabel>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter admin token"
                className="border-orange-200"
              />
            </FieldGroup>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Login
            </Button>
          </form>

          <p className="text-xs text-orange-600 mt-4">
            Admin token: ADMIN_TOKEN environment variable
          </p>
        </Card>
      </div>
    )
  }

  const stats = {
    totalPosts: posts.length,
    hiddenPosts: posts.filter((p) => p.hidden).length,
    visiblePosts: posts.filter((p) => !p.hidden).length,
    avgRating: posts.length > 0
      ? (posts.reduce((sum, p) => sum + p.avg_score, 0) / posts.length).toFixed(2)
      : '0.00',
    totalVotes: posts.reduce((sum, p) => sum + p.score_count, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="border-b border-orange-100/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-orange-900">Admin Dashboard</h1>
            <Button
              onClick={() => {
                setIsAuthenticated(false)
                setToken('')
                setPosts([])
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: stats.totalPosts },
            { label: 'Visible', value: stats.visiblePosts },
            { label: 'Hidden', value: stats.hiddenPosts },
            { label: 'Avg Rating', value: stats.avgRating },
            { label: 'Total Votes', value: stats.totalVotes },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/80 border-orange-100 p-4 text-center">
              <p className="text-xs text-orange-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-orange-900">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'posts'
                ? 'bg-orange-600 text-white'
                : 'bg-white/80 text-orange-900 border border-orange-100'
            }`}
          >
            Posts ({stats.totalPosts})
          </button>
          <button
            onClick={() => setSelectedTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === 'stats'
                ? 'bg-orange-600 text-white'
                : 'bg-white/80 text-orange-900 border border-orange-100'
            }`}
          >
            Statistics
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {selectedTab === 'posts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <Card className="bg-white/80 border-orange-100 p-8 text-center">
                <p className="text-orange-900">No posts found</p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-white/80 border-orange-100 p-6 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-orange-900 truncate">
                          {post.title || 'Untitled'}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            post.hidden
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {post.hidden ? 'Hidden' : 'Visible'}
                        </span>
                      </div>

                      <p className="text-sm text-orange-700 mb-2">
                        By: {post.anonymous ? 'Anonymous' : post.name}
                      </p>

                      <p className="text-sm text-orange-600 line-clamp-2 mb-3">
                        {post.short_desc}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-orange-600">
                        <span>★ {post.avg_score.toFixed(1)} ({post.score_count} votes)</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          post.hidden
                            ? 'border-green-300 text-green-700 hover:bg-green-50'
                            : 'border-red-300 text-red-700 hover:bg-red-50'
                        }
                        onClick={() => togglePostVisibility(post.id, post.hidden)}
                      >
                        {post.hidden ? 'Show' : 'Hide'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => deletePost(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {selectedTab === 'stats' && (
          <div className="grid gap-6">
            <Card className="bg-white/80 border-orange-100 p-6">
              <h2 className="text-xl font-bold text-orange-900 mb-4">Overview</h2>
              <div className="space-y-3 text-orange-900">
                <p>
                  <span className="font-semibold">Total Posts:</span> {stats.totalPosts}
                </p>
                <p>
                  <span className="font-semibold">Visible Posts:</span> {stats.visiblePosts}
                </p>
                <p>
                  <span className="font-semibold">Hidden Posts:</span> {stats.hiddenPosts}
                </p>
                <p>
                  <span className="font-semibold">Total Votes:</span> {stats.totalVotes}
                </p>
                <p>
                  <span className="font-semibold">Average Rating:</span> {stats.avgRating}/5
                </p>
              </div>
            </Card>

            <Card className="bg-white/80 border-orange-100 p-6">
              <h2 className="text-xl font-bold text-orange-900 mb-4">Top Rated Posts</h2>
              <div className="space-y-3">
                {posts
                  .filter((p) => !p.hidden)
                  .sort((a, b) => b.avg_score - a.avg_score)
                  .slice(0, 5)
                  .map((post, i) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between pb-3 border-b border-orange-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-orange-900">{i + 1}. {post.title || 'Untitled'}</p>
                        <p className="text-sm text-orange-600">{post.score_count} votes</p>
                      </div>
                      <span className="text-lg font-bold text-yellow-500">
                        ★ {post.avg_score.toFixed(1)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
