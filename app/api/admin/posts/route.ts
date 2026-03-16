import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-key'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token')
  return token === ADMIN_TOKEN
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) throw postsError

    // Get vote statistics for each post
    const { data: voteStats } = await supabase
      .from('votes')
      .select('post_id, score')

    const stats = voteStats?.reduce(
      (acc, vote) => {
        if (!acc[vote.post_id]) {
          acc[vote.post_id] = { total: 0, count: 0 }
        }
        acc[vote.post_id].total += vote.score
        acc[vote.post_id].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>
    ) || {}

    return NextResponse.json({
      posts,
      stats,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { id, hidden } = await request.json()

    if (!id || typeof hidden !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ hidden })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Missing postcard id' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete post' },
      { status: 500 }
    )
  }
}
