import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
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
  return NextResponse.redirect(authUrl)
}
