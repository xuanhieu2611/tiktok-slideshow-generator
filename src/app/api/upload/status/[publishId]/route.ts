import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/tiktok-session'
import { getValidAccessToken, fetchPublishStatus } from '@/lib/tiktok-api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publishId: string }> }
) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not connected to TikTok' }, { status: 401 })
  }

  const { publishId } = await params

  try {
    const accessToken = await getValidAccessToken()
    const status = await fetchPublishStatus(accessToken, publishId)
    return NextResponse.json({ status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
