'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTikTokAuth } from '@/hooks/useTikTokAuth'

export default function TikTokAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refresh } = useTikTokAuth()

  useEffect(() => {
    if (searchParams.get('tiktok') === 'connected') {
      refresh()
      router.replace('/editor')
    }
  }, [searchParams, refresh, router])

  return null
}
