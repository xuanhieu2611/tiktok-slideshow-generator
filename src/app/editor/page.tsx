'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import Filmstrip from '@/components/filmstrip/Filmstrip'
import PreviewCanvas from '@/components/preview/PreviewCanvas'
import EditPanel from '@/components/editpanel/EditPanel'
import GlobalSettingsBar from '@/components/global-settings/GlobalSettingsBar'
import ExportButtons from '@/components/export/ExportButtons'
import BulkEditModal from '@/components/bulk-edit/BulkEditModal'
import TikTokConnectButton from '@/components/tiktok/TikTokConnectButton'
import TikTokUploadModal from '@/components/tiktok/TikTokUploadModal'
import TikTokAuthHandler from '@/components/tiktok/TikTokAuthHandler'
import { useTikTokAuth } from '@/hooks/useTikTokAuth'
import { useUser } from '@/hooks/useUser'

type Toast = { message: string; type: 'success' | 'error' | 'info' }

export default function EditorPage() {
  const router = useRouter()
  const slideCount = useSlideshowStore((s) => s.slides.length)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { connected, error: tiktokError } = useTikTokAuth()
  const { user, logout } = useUser()

  useEffect(() => {
    if (slideCount === 0) {
      router.replace('/')
    }
  }, [slideCount, router])

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Show TikTok errors as toast
  useEffect(() => {
    if (tiktokError) {
      showToast(tiktokError, 'error')
    }
  }, [tiktokError, showToast])

  if (slideCount === 0) return null

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex h-screen flex-col bg-[#030712]">
      {/* Handles ?tiktok=connected and ?tiktok=error redirects */}
      <Suspense>
        <TikTokAuthHandler onToast={showToast} />
      </Suspense>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-slate-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1
            className="text-base font-black"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Slideshow Maker
          </h1>
          <button
            onClick={() => setIsBulkEditOpen(true)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Bulk Edit
          </button>
        </div>

        <span className="text-xs text-slate-600">{slideCount} slide{slideCount !== 1 ? 's' : ''}</span>

        <div className="flex items-center gap-2">
          <TikTokConnectButton />
          {connected && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="rounded-lg border border-white/10 bg-[#010101] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Upload to TikTok
            </button>
          )}
          <ExportButtons />

          {/* User avatar dropdown */}
          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white transition hover:bg-violet-500"
                aria-label="User menu"
              >
                {userInitial}
              </button>
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl">
                    <div className="border-b border-white/[0.06] px-3 py-2">
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout() }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <BulkEditModal isOpen={isBulkEditOpen} onClose={() => setIsBulkEditOpen(false)} />
      <TikTokUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Main content: three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filmstrip */}
        <div className="w-[120px] shrink-0 overflow-hidden border-r border-white/[0.06]">
          <Filmstrip />
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewCanvas />
        </div>

        {/* Edit Panel */}
        <div className="w-[320px] shrink-0 overflow-hidden border-l border-white/[0.06]">
          <EditPanel />
        </div>
      </div>

      {/* Global settings bar */}
      <GlobalSettingsBar />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm transition-all ${
            toast.type === 'success'
              ? 'border-green-500/20 bg-green-500/10 text-green-300'
              : toast.type === 'error'
              ? 'border-red-500/20 bg-red-500/10 text-red-300'
              : 'border-white/10 bg-slate-800/90 text-slate-200'
          }`}
        >
          {toast.type === 'success' && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
