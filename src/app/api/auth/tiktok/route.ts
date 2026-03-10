import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const redirectUri = process.env.TIKTOK_REDIRECT_URI

  if (!clientKey || !redirectUri) {
    return NextResponse.json({ error: 'TikTok credentials not configured' }, { status: 500 })
  }

  const state = uuidv4()
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,video.upload',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
  })
  response.cookies.set('tiktok_oauth_user_id', user.id, {
    httpOnly: true,
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
