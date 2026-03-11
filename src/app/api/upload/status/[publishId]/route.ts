import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getComposio, TIKTOK_TOOLKIT_VERSION } from '@/lib/composio'

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
    const composio = getComposio()
    const result = await composio.tools.execute('TIKTOK_FETCH_PUBLISH_STATUS', {
      userId: user.id,
      arguments: { publish_id: publishId },
      version: TIKTOK_TOOLKIT_VERSION,
    })

    if (!result.successful) {
      throw new Error(result.error ?? 'Failed to fetch status')
    }

    const d = result.data as Record<string, unknown>
    const inner = d?.data as Record<string, unknown> | undefined
    const status = inner?.status ?? d?.status ?? null
    return NextResponse.json({ status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
