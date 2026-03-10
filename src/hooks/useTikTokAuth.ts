'use client'

import { useEffect, useState } from 'react'

interface TikTokAuthState {
  connected: boolean
  username: string
  loading: boolean
  error: string | null
}

export function useTikTokAuth() {
  const [state, setState] = useState<TikTokAuthState>({
    connected: false,
    username: '',
    loading: true,
    error: null,
  })

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setState({ connected: data.connected, username: data.username || '', loading: false, error: null })
    } catch {
      setState({ connected: false, username: '', loading: false, error: null })
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const disconnect = async () => {
    const prev = state
    try {
      const res = await fetch('/api/auth/disconnect', { method: 'POST' })
      if (!res.ok) {
        throw new Error(`Disconnect failed: ${res.status}`)
      }
      setState({ connected: false, username: '', loading: false, error: null })
    } catch (err) {
      setState({ ...prev, error: err instanceof Error ? err.message : 'Disconnect failed' })
    }
  }

  const connect = () => {
    window.location.href = '/api/auth/tiktok'
  }

  return { ...state, connect, disconnect, refresh }
}
