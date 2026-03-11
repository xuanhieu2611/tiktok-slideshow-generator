import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getComposio } from '@/lib/composio'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const composio = getComposio()
  const accounts = await composio.connectedAccounts.list({
    userIds: [user.id],
    toolkitSlugs: ['tiktok'],
  })

  for (const account of accounts.items ?? []) {
    await composio.connectedAccounts.delete(account.id)
  }

  return NextResponse.json({ ok: true })
}
