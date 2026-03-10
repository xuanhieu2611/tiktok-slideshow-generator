'use client'

import { useSlideshowStore } from '@/store/useSlideshowStore'
import { useCanvasRenderer } from './useCanvasRenderer'

export default function PreviewCanvas() {
  const slide = useSlideshowStore((s) =>
    s.slides.find((sl) => sl.id === s.selectedSlideId)
  )
  const { canvasRef, isRendering } = useCanvasRenderer(slide)

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-slate-600">
        Select a slide to preview
      </div>
    )
  }

  return (
    <div className="relative flex h-full items-center justify-center bg-[#030712] p-4">
      <canvas
        ref={canvasRef}
        data-rendering={isRendering}
        className="max-h-full rounded shadow-2xl transition-opacity duration-150 data-[rendering=true]:opacity-60"
        style={{ aspectRatio: '4/5', maxWidth: '100%', height: 'auto', maxHeight: '100%' }}
      />
      {isRendering && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-violet-400" />
            <span className="text-[10px] text-slate-400">Rendering</span>
          </div>
        </div>
      )}
    </div>
  )
}
