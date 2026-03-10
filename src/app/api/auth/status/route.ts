import { NextResponse } from 'next/server'
import { getSession } from '@/lib/tiktok-session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ connected: false })
  }
  return NextResponse.json({
    connected: true,
    username: session.username,
    openId: session.openId,
  })
}
