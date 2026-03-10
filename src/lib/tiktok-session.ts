import { getAdminClient } from './supabase'

export interface TikTokSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // ms timestamp
  refreshExpiresAt: number
  openId: string
  username: string
}

export async function getSession(userId: string): Promise<TikTokSession | null> {
  const { data, error } = await getAdminClient()
    .from('tiktok_sessions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Number(data.expires_at),
    refreshExpiresAt: Number(data.refresh_expires_at),
    openId: data.open_id,
    username: data.username,
  }
}

export async function setSession(userId: string, s: TikTokSession): Promise<void> {
  await getAdminClient().from('tiktok_sessions').upsert({
    user_id: userId,
    access_token: s.accessToken,
    refresh_token: s.refreshToken,
    expires_at: s.expiresAt,
    refresh_expires_at: s.refreshExpiresAt,
    open_id: s.openId,
    username: s.username,
    updated_at: new Date().toISOString(),
  })
}

export async function clearSession(userId: string): Promise<void> {
  await getAdminClient().from('tiktok_sessions').delete().eq('user_id', userId)
}

export async function isAccessTokenExpired(userId: string): Promise<boolean> {
  const session = await getSession(userId)
  if (!session) return true
  return Date.now() >= session.expiresAt
}
