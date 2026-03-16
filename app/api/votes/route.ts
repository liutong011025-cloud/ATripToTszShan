import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { postcard_id, score } = await request.json()

    if (!postcard_id || !score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Invalid postcard_id or score' },
        { status: 400 }
      )
    }

    // Get client IP for duplicate prevention
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Generate a UUID voter token based on IP and user-agent hash (format: 8-4-4-4-12)
    const combined = `${ip}-${userAgent}`
    const hash = crypto.createHash('md5').update(combined).digest('hex')
    const voterToken = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32)
    ].join('-')

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postcard_id)
      .eq('voter_token', voterToken)
      .maybeSingle()

    if (existingVote && !existingVote.invalidated) {
      return NextResponse.json(
        { error: 'You have already voted on this postcard' },
        { status: 400 }
      )
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        post_id: postcard_id,
        voter_token: voterToken,
        ip,
        user_agent: userAgent,
        score,
      })
      .select()
      .single()

    if (voteError) {
      throw voteError
    }

    return NextResponse.json(vote)
  } catch (error) {
    console.error('Error creating vote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vote' },
      { status: 500 }
    )
  }
}
