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
    const postId = searchParams.get('post_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase.from('votes').select('*', { count: 'exact' })

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: votes, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      votes,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch votes' },
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
    const { id, invalidated } = await request.json()

    if (!id || typeof invalidated !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('votes')
      .update({ invalidated })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Recalculate average score for the post
    const { data: allVotes } = await supabase
      .from('votes')
      .select('score')
      .eq('post_id', data.post_id)
      .eq('invalidated', false)

    if (allVotes && allVotes.length > 0) {
      const avgScore = allVotes.reduce((sum, v) => sum + v.score, 0) / allVotes.length
      const scoreCount = allVotes.length

      await supabase
        .from('posts')
        .update({
          avg_score: parseFloat(avgScore.toFixed(2)),
          score_count: scoreCount,
        })
        .eq('id', data.post_id)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vote' },
      { status: 500 }
    )
  }
}
