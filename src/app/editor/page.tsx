'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import Filmstrip from '@/components/filmstrip/Filmstrip'
import PreviewCanvas from '@/components/preview/PreviewCanvas'
import EditPanel from '@/components/editpanel/EditPanel'
import GlobalSettingsBar from '@/components/global-settings/GlobalSettingsBar'
import ExportButtons from '@/components/export/ExportButtons'

export default function EditorPage() {
  const router = useRouter()
  const slideCount = useSlideshowStore((s) => s.slides.length)

  useEffect(() => {
    if (slideCount === 0) {
      router.replace('/')
    }
  }, [slideCount, router])

  if (slideCount === 0) return null

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2">
        <h1 className="text-lg font-bold text-white">TikTok Slideshow Maker</h1>
        <ExportButtons />
      </header>

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
