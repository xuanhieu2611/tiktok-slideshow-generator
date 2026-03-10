'use client'

import { useEffect, useState } from 'react'

interface TikTokAuthState {
  connected: boolean
  username: string
  loading: boolean
}

export function useTikTokAuth() {
  const [state, setState] = useState<TikTokAuthState>({
    connected: false,
    username: '',
    loading: true,
  })

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setState({ connected: data.connected, username: data.username || '', loading: false })
    } catch {
      setState({ connected: false, username: '', loading: false })
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const disconnect = async () => {
    await fetch('/api/auth/disconnect', { method: 'POST' })
    setState({ connected: false, username: '', loading: false })
  }

  const connect = () => {
    window.location.href = '/api/auth/tiktok'
  }

  return { ...state, connect, disconnect, refresh }
}
