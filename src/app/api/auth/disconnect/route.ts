import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/tiktok-session'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await clearSession(user.id)
  return NextResponse.json({ ok: true })
}
