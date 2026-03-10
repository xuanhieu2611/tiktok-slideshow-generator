'use client'

import { useSlideshowStore } from '@/store/useSlideshowStore'
import { useCanvasRenderer } from './useCanvasRenderer'

export default function PreviewCanvas() {
  const slide = useSlideshowStore((s) =>
    s.slides.find((sl) => sl.id === s.selectedSlideId)
  )
  const canvasRef = useCanvasRenderer(slide)

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select a slide to preview
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-950 p-4">
      <canvas
        ref={canvasRef}
        className="max-h-full rounded shadow-2xl"
        style={{ aspectRatio: '4/5', maxWidth: '100%', height: 'auto', maxHeight: '100%' }}
      />
    </div>
  )
}
