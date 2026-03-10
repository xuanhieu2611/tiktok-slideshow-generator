import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { getSession } from '@/lib/tiktok-session'
import { getValidAccessToken, initPhotoPost } from '@/lib/tiktok-api'
import { getAdminClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await getSession(user.id)
  if (!session) {
    return NextResponse.json({ error: 'Not connected to TikTok' }, { status: 401 })
  }

  const formData = await req.formData()
  const title = (formData.get('title') as string) || ''
  const description = (formData.get('description') as string) || ''

  const slideEntries = [...formData.entries()].filter(([key]) => key.startsWith('slide'))
  if (slideEntries.length === 0) {
    return NextResponse.json({ error: 'No slides provided' }, { status: 400 })
  }
  if (slideEntries.length > 35) {
    return NextResponse.json({ error: 'Maximum 35 slides allowed' }, { status: 400 })
  }

  const publicUrls: string[] = []
  const uploadedFilenames: string[] = []

  try {
    const sb = getAdminClient()

    for (const [, value] of slideEntries) {
      const file = value as File
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const filename = `${uuidv4()}.jpg`
      const jpegBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer()

      const { error: uploadError } = await sb.storage
        .from('tiktok-slides')
        .upload(filename, jpegBuffer, { contentType: 'image/jpeg' })

      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

      const { data: urlData } = sb.storage.from('tiktok-slides').getPublicUrl(filename)
      publicUrls.push(urlData.publicUrl)
      uploadedFilenames.push(filename)
    }

    // Track for cleanup
    const deleteAfter = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await getAdminClient()
      .from('slide_uploads')
      .insert(
        uploadedFilenames.map((filename) => ({ filename, delete_after: deleteAfter, user_id: user.id }))
      )

    const accessToken = await getValidAccessToken(user.id)
    const publishId = await initPhotoPost(accessToken, publicUrls, title, description)

    return NextResponse.json({ publishId })
  } catch (err) {
    // Best-effort cleanup on error
    if (uploadedFilenames.length > 0) {
      await getAdminClient().storage.from('tiktok-slides').remove(uploadedFilenames)
    }

    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
