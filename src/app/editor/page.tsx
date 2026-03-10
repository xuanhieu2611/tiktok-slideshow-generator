'use client'

import { Suspense, useEffect, useState } from 'react'
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

export default function EditorPage() {
  const router = useRouter()
  const slideCount = useSlideshowStore((s) => s.slides.length)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { connected } = useTikTokAuth()

  useEffect(() => {
    if (slideCount === 0) {
      router.replace('/')
    }
  }, [slideCount, router])

  if (slideCount === 0) return null

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      {/* Handles ?tiktok=connected redirect */}
      <Suspense>
        <TikTokAuthHandler />
      </Suspense>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">TikTok Slideshow Maker</h1>
          <button
            onClick={() => setIsBulkEditOpen(true)}
            className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
          >
            Bulk Edit Text
          </button>
        </div>
        <div className="flex items-center gap-3">
          <TikTokConnectButton />
          {connected && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="rounded border border-gray-600 bg-[#010101] px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Upload to TikTok
            </button>
          )}
          <ExportButtons />
        </div>
      </header>

      <BulkEditModal isOpen={isBulkEditOpen} onClose={() => setIsBulkEditOpen(false)} />
      <TikTokUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Main content: three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filmstrip */}
        <div className="w-[100px] shrink-0 overflow-hidden border-r border-gray-700">
          <Filmstrip />
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewCanvas />
        </div>

        {/* Edit Panel */}
        <div className="w-[300px] shrink-0 overflow-hidden border-l border-gray-700">
          <EditPanel />
        </div>
      </div>

      {/* Global settings bar */}
      <GlobalSettingsBar />
    </div>
  )
}
