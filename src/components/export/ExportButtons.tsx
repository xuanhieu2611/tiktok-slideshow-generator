'use client'

import { useState } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { exportAllAsZip } from '@/lib/export'

export default function ExportButtons() {
  const slides = useSlideshowStore((s) => s.slides)
  const [exporting, setExporting] = useState(false)

  const handleExportAll = async () => {
    if (slides.length === 0) return
    setExporting(true)
    try {
      await exportAllAsZip(slides)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExportAll}
      disabled={exporting || slides.length === 0}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : `Export All (${slides.length})`}
    </button>
  )
}
