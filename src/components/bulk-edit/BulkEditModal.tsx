'use client'

import { useEffect, useRef, useState } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'

interface Draft {
  id: string
  headline: string
  subtitle: string
}

interface BulkEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BulkEditModal({ isOpen, onClose }: BulkEditModalProps) {
  const slides = useSlideshowStore((s) => s.slides)
  const bulkUpdateSlideText = useSlideshowStore((s) => s.bulkUpdateSlideText)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const prevIsOpen = useRef(false)

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setDrafts(slides.map((s) => ({ id: s.id, headline: s.headline, subtitle: s.subtitle })))
    }
    prevIsOpen.current = isOpen
  }, [isOpen, slides])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const updateDraft = (id: string, field: 'headline' | 'subtitle', value: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const handleApply = () => {
    bulkUpdateSlideText(drafts)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
          <h2 className="text-base font-semibold text-white">Bulk Edit Text</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Scrollable rows */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="mb-2 grid grid-cols-[40px_16px_1fr_1fr] items-center gap-3 text-xs font-medium text-gray-400">
            <span />
            <span>#</span>
            <span>Headline</span>
            <span>Subtitle</span>
          </div>
          {drafts.map((draft, idx) => {
            const slide = slides.find((s) => s.id === draft.id)
            return (
              <div
                key={draft.id}
                className="mb-2 grid grid-cols-[40px_16px_1fr_1fr] items-center gap-3"
              >
                {/* Thumbnail */}
                <div className="h-[57px] w-[40px] overflow-hidden rounded bg-gray-800 shrink-0">
                  {slide?.type === 'image' ? (
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: slide?.type === 'cta' ? slide.backgroundColor : '#000' }}
                    >
                      CTA
                    </div>
                  )}
                </div>
                {/* Index */}
                <span className="text-xs text-gray-400">{idx + 1}</span>
                {/* Headline */}
                <input
                  type="text"
                  value={draft.headline}
                  onChange={(e) => updateDraft(draft.id, 'headline', e.target.value)}
                  placeholder="Headline"
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                {/* Subtitle */}
                <input
                  type="text"
                  value={draft.subtitle}
                  onChange={(e) => updateDraft(draft.id, 'subtitle', e.target.value)}
                  placeholder="Subtitle"
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )
          })}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-700 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
