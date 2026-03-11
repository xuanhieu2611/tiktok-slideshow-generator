import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { getAdminClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getComposio, TIKTOK_TOOLKIT_VERSION } from '@/lib/composio'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check TikTok is connected via Composio
  const composio = getComposio()
  const accounts = await composio.connectedAccounts.list({
    userIds: [user.id],
    toolkitSlugs: ['tiktok'],
    statuses: ['ACTIVE'],
  })

  if (!accounts.items || accounts.items.length === 0) {
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
      const proxyUrl = `https://hieule.co/api/tiktok-images?url=${encodeURIComponent(urlData.publicUrl)}`
      publicUrls.push(proxyUrl)
      uploadedFilenames.push(filename)
    }

    // Track for cleanup
    const deleteAfter = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await getAdminClient()
      .from('slide_uploads')
      .insert(
        uploadedFilenames.map((filename) => ({ filename, delete_after: deleteAfter, user_id: user.id }))
      )

    // Post to TikTok via Composio
    const result = await composio.tools.execute('TIKTOK_POST_PHOTO', {
      userId: user.id,
      arguments: {
        photo_images: publicUrls,
        photo_cover_index: 0,
        title: title || undefined,
        description: description || undefined,
        post_mode: 'MEDIA_UPLOAD',
      },
      version: TIKTOK_TOOLKIT_VERSION,
    })

    if (!result.successful) {
      throw new Error(result.error ?? 'TikTok post failed')
    }

    const d = result.data as Record<string, unknown>
    const inner = d?.data as Record<string, unknown> | undefined
    const publishId = String(inner?.publish_id ?? d?.publish_id ?? '')

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
