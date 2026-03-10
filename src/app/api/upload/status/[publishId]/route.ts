import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, fetchPublishStatus } from '@/lib/tiktok-api'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publishId: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { publishId } = await params

  try {
    const accessToken = await getValidAccessToken(user.id)
    const status = await fetchPublishStatus(accessToken, publishId)
    return NextResponse.json({ status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
