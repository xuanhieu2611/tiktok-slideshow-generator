import { getSession, setSession } from './tiktok-session'

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

export async function getValidAccessToken(userId: string): Promise<string> {
  const session = await getSession(userId)
  if (!session) throw new Error('Not authenticated with TikTok')

  if (Date.now() >= session.expiresAt) {
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
    })

    const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error_description || data.error)

    await setSession(userId, {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || session.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshExpiresAt: Date.now() + (data.refresh_expires_in || 31536000) * 1000,
    })

    return data.access_token
  }

  return session.accessToken
}

export async function initPhotoPost(
  accessToken: string,
  photoUrls: string[],
  title: string,
  description: string
): Promise<string> {
  const body = {
    post_info: {
      title,
      description,
      privacy_level: 'SELF_ONLY',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      photo_cover_index: 0,
      photo_images: photoUrls,
    },
    post_mode: 'MEDIA_UPLOAD',
    media_type: 'PHOTO',
  }

  const res = await fetch(`${TIKTOK_API_BASE}/post/publish/content/init/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (data.error?.code !== 'ok') {
    throw new Error(data.error?.message || 'TikTok API error')
  }

  return data.data.publish_id
}

export async function fetchPublishStatus(
  accessToken: string,
  publishId: string
): Promise<string> {
  const res = await fetch(`${TIKTOK_API_BASE}/post/publish/status/fetch/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publish_id: publishId }),
  })

  const data = await res.json()
  if (data.error?.code !== 'ok') {
    throw new Error(data.error?.message || 'Failed to fetch publish status')
  }

  return data.data.status
}
