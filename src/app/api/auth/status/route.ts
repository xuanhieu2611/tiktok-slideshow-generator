import { NextResponse } from 'next/server'
import { getSession } from '@/lib/tiktok-session'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await getSession(user.id)
  if (!session) {
    return NextResponse.json({ connected: false })
  }
  return NextResponse.json({
    connected: true,
    username: session.username,
    openId: session.openId,
  })
}
