export interface TikTokSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // ms timestamp
  refreshExpiresAt: number
  openId: string
  username: string
}

let session: TikTokSession | null = null

export function getSession(): TikTokSession | null {
  return session
}

export function setSession(data: TikTokSession): void {
  session = data
}

export function clearSession(): void {
  session = null
}

export function isAccessTokenExpired(): boolean {
  if (!session) return true
  return Date.now() >= session.expiresAt
}
