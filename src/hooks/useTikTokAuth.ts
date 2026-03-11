'use client'

import { useEffect, useState, useRef } from 'react'

interface TikTokAuthState {
  connected: boolean
  username: string
  loading: boolean
  error: string | null
}

function openComposioPopup(url: string): Promise<void> {
  const width = 600
  const height = 840
  const left = Math.round((window.innerWidth - width) / 2)
  const top = Math.round((window.innerHeight - height) / 2)

  return new Promise((resolve, reject) => {
    const popup = window.open(url, 'composio-tiktok-auth', `width=${width},height=${height},left=${left},top=${top}`)
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'))
      return
    }

    popup.focus()

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer)
        reject(new Error('Popup closed before completing auth'))
        return
      }

      let popupUrl: URL | null = null
      try {
        popupUrl = new URL(popup.location.href)
      } catch {
        // Cross-origin while on Composio page — ignore
      }

      if (!popupUrl) return

      const status = popupUrl.searchParams.get('status')
      const error = popupUrl.searchParams.get('error')

      if (error) {
        clearInterval(timer)
        popup.close()
        reject(new Error(error))
        return
      }

      if (status === 'success') {
        clearInterval(timer)
        popup.close()
        resolve()
      }
    }, 500)
  })
}

export function useTikTokAuth() {
  const [state, setState] = useState<TikTokAuthState>({
    connected: false,
    username: '',
    loading: true,
    error: null,
  })
  const connectingRef = useRef(false)

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
      if (!res.ok) throw new Error(`Disconnect failed: ${res.status}`)
      setState({ connected: false, username: '', loading: false, error: null })
    } catch (err) {
      setState({ ...prev, error: err instanceof Error ? err.message : 'Disconnect failed' })
    }
  }

  const connect = async () => {
    if (connectingRef.current) return
    connectingRef.current = true
    setState((s) => ({ ...s, error: null }))

    try {
      const res = await fetch('/api/auth/tiktok')
      if (!res.ok) throw new Error('Failed to start TikTok auth')
      const { redirectUrl } = await res.json()

      await openComposioPopup(redirectUrl)
      await refresh()
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Connection failed',
      }))
    } finally {
      connectingRef.current = false
    }
  }

  return { ...state, connect, disconnect, refresh }
}
