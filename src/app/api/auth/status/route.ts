import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getComposio, TIKTOK_TOOLKIT_VERSION } from '@/lib/composio'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const composio = getComposio()
  const accounts = await composio.connectedAccounts.list({
    userIds: [user.id],
    toolkitSlugs: ['tiktok'],
    statuses: ['ACTIVE'],
  })

  if (!accounts.items || accounts.items.length === 0) {
    return NextResponse.json({ connected: false })
  }

  // Validate token by fetching TikTok username
  let username = ''
  try {
    const result = await composio.tools.execute('TIKTOK_GET_USER_BASIC_INFO', {
      userId: user.id,
      arguments: {},
      version: TIKTOK_TOOLKIT_VERSION,
    })
    if (!result.successful) {
      return NextResponse.json({ connected: false })
    }
    if (result.data) {
      const d = result.data as Record<string, unknown>
      const inner = (d?.data as Record<string, unknown>)?.user as Record<string, unknown> | undefined
      username = String(inner?.display_name ?? inner?.username ?? '')
    }
  } catch {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({ connected: true, username })
}
