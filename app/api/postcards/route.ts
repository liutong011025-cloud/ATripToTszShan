import { createClient } from '@/lib/supabase/server'
import { put, del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    // Return empty array on error to prevent client-side issues
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    const name = (formData.get('name') as string) || 'Anonymous'
    const anonymous = formData.get('anonymous') === 'true'
    const shortDesc = formData.get('shortDesc') as string
    const proReflection = formData.get('proReflection') as string
    const photoFile = formData.get('photo') as File

    // Validate required fields
    if (!shortDesc?.trim()) {
      return NextResponse.json(
        { error: 'Short description is required' },
        { status: 400 }
      )
    }

    if (!proReflection?.trim()) {
      return NextResponse.json(
        { error: 'Reflection is required' },
        { status: 400 }
      )
    }

    let photoUrl = ''
    let thumbnailUrl = ''

    // Upload photo
    if (photoFile) {
      const photoBuffer = await photoFile.arrayBuffer()
      const blob = await put(`postcards/${Date.now()}-${photoFile.name}`, photoBuffer, {
        access: 'public',
        contentType: photoFile.type,
      })
      photoUrl = blob.url

      // Create thumbnail
      try {
        const thumbnailBuffer = await sharp(photoBuffer)
          .resize(400, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer()

        const thumbnailBlob = await put(
          `postcards/thumbnails/${Date.now()}-${photoFile.name}`,
          thumbnailBuffer,
          {
            access: 'public',
            contentType: 'image/jpeg',
          }
        )
        thumbnailUrl = thumbnailBlob.url
      } catch (e) {
        thumbnailUrl = photoUrl
      }
    }

    // Insert into database
    const { data: postcard, error: insertError } = await supabase
      .from('posts')
      .insert({
        name: anonymous ? 'Anonymous' : name,
        anonymous,
        title: '',
        short_desc: shortDesc,
        pro_reflection: proReflection,
        photo_url: photoUrl,
        thumbnail_url: thumbnailUrl,
        handwritten_image_url: '',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(postcard)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create postcard'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
