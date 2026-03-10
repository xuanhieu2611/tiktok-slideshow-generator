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
      className="rounded bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : `Export All (${slides.length})`}
    </button>
  )
}
