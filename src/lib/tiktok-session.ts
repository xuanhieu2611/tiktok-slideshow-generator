import { getSupabase } from './supabase'

export interface TikTokSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // ms timestamp
  refreshExpiresAt: number
  openId: string
  username: string
}

export async function getSession(): Promise<TikTokSession | null> {
  const { data, error } = await getSupabase()
    .from('tiktok_sessions')
    .select('*')
    .eq('id', 'singleton')
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

export async function setSession(s: TikTokSession): Promise<void> {
  await getSupabase().from('tiktok_sessions').upsert({
    id: 'singleton',
    access_token: s.accessToken,
    refresh_token: s.refreshToken,
    expires_at: s.expiresAt,
    refresh_expires_at: s.refreshExpiresAt,
    open_id: s.openId,
    username: s.username,
    updated_at: new Date().toISOString(),
  })
}

export async function clearSession(): Promise<void> {
  await getSupabase().from('tiktok_sessions').delete().eq('id', 'singleton')
}

export async function isAccessTokenExpired(): Promise<boolean> {
  const session = await getSession()
  if (!session) return true
  return Date.now() >= session.expiresAt
}
