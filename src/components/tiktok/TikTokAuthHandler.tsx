'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTikTokAuth } from '@/hooks/useTikTokAuth'

interface TikTokAuthHandlerProps {
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function TikTokAuthHandler({ onToast }: TikTokAuthHandlerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refresh } = useTikTokAuth()

  useEffect(() => {
    const tiktok = searchParams.get('tiktok')
    if (tiktok === 'connected') {
      refresh()
      onToast?.('TikTok connected successfully!', 'success')
      router.replace('/editor')
    } else if (tiktok === 'error') {
      const msg = searchParams.get('message') ?? 'TikTok connection failed'
      onToast?.(msg, 'error')
      router.replace('/editor')
    }
  }, [searchParams, refresh, router, onToast])

  return null
}
