import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

// Called by Vercel Cron every 5 minutes
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  const sb = getAdminClient()

  const { data: expired } = await sb
    .from('slide_uploads')
    .select('filename')
    .lt('delete_after', now)

  if (expired?.length) {
    const filenames = expired.map((r: { filename: string }) => r.filename)
    await sb.storage.from('tiktok-slides').remove(filenames)
    await sb.from('slide_uploads').delete().lt('delete_after', now)
  }

  return NextResponse.json({ deleted: expired?.length ?? 0 })
}
