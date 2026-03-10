'use client'

import { useTikTokAuth } from '@/hooks/useTikTokAuth'

export default function TikTokConnectButton() {
  const { connected, username, loading, connect, disconnect } = useTikTokAuth()

  if (loading) return null

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-300">
          Connected{username ? ` as ${username}` : ''}
        </span>
        <button
          onClick={disconnect}
          className="text-gray-500 underline hover:text-gray-300"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-1.5 rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
    >
      {/* TikTok icon */}
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
      </svg>
      Connect TikTok
    </button>
  )
}
