import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// Called by Vercel Cron every 5 minutes
export async function GET() {
  const now = new Date().toISOString()
  const sb = getSupabase()

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
