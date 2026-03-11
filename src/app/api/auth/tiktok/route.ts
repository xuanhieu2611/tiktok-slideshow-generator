import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getComposio, TIKTOK_AUTH_CONFIG_ID } from '@/lib/composio'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = request.nextUrl.origin
  const callbackUrl = `${origin}/auth/composio/callback`

  const composio = getComposio()
  const connectionRequest = await composio.connectedAccounts.link(
    user.id,
    TIKTOK_AUTH_CONFIG_ID,
    { callbackUrl }
  )

  return NextResponse.json({ redirectUrl: connectionRequest.redirectUrl })
}
