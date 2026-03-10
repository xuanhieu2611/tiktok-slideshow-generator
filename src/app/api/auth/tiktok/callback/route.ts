import { NextRequest, NextResponse } from 'next/server'
import { setSession } from '@/lib/tiktok-session'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL(`/?tiktok=error&reason=${error || 'no_code'}`, req.url))
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY!
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!
  const redirectUri = process.env.TIKTOK_REDIRECT_URI!

  // Exchange code for token
  const tokenParams = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams,
  })

  const tokenData = await tokenRes.json()

  if (tokenData.error) {
    return NextResponse.redirect(
      new URL(`/editor?tiktok=error&reason=${encodeURIComponent(tokenData.error_description || tokenData.error)}`, req.url)
    )
  }

  // Fetch user info
  let username = ''
  try {
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=display_name,username',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )
    const userData = await userRes.json()
    username = userData.data?.user?.display_name || userData.data?.user?.username || ''
  } catch {
    // username is optional
  }

  await setSession({
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
    refreshExpiresAt: Date.now() + (tokenData.refresh_expires_in || 31536000) * 1000,
    openId: tokenData.open_id,
    username,
  })

  return NextResponse.redirect(new URL('/editor?tiktok=connected', req.url))
}
