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

  const inputClass =
    'w-full rounded-xl bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 focus:ring-violet-500/60'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-white/[0.08] bg-slate-900/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <div>
            <h2 className="text-base font-semibold text-white">Bulk Edit Text</h2>
            <p className="text-xs text-slate-500">Editing {slides.length} slide{slides.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable rows */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="mb-2 grid grid-cols-[40px_auto_1fr_1fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            <span />
            <span>#</span>
            <span>Headline</span>
            <span>Subtitle</span>
          </div>
          {drafts.map((draft, idx) => {
            const slide = slides.find((s) => s.id === draft.id)
            const typeLabel = slide?.type === 'cta' ? 'CTA' : 'IMG'
            return (
              <div
                key={draft.id}
                className="mb-2 grid grid-cols-[40px_auto_1fr_1fr] items-center gap-3"
              >
                {/* Thumbnail */}
                <div className="h-[57px] w-[40px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  {slide?.type === 'image' ? (
                    <img src={slide.imageUrl} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: slide?.type === 'cta' ? slide.backgroundColor : '#000' }}
                    >
                      CTA
                    </div>
                  )}
                </div>
                {/* Index + type badge */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-slate-400">{idx + 1}</span>
                  <span className="rounded bg-slate-800 px-1 py-0.5 text-[8px] font-semibold text-slate-500">
                    {typeLabel}
                  </span>
                </div>
                {/* Headline */}
                <input
                  type="text"
                  value={draft.headline}
                  onChange={(e) => updateDraft(draft.id, 'headline', e.target.value)}
                  placeholder="Headline"
                  className={inputClass}
                />
                {/* Subtitle */}
                <input
                  type="text"
                  value={draft.subtitle}
                  onChange={(e) => updateDraft(draft.id, 'subtitle', e.target.value)}
                  placeholder="Subtitle"
                  className={inputClass}
                />
              </div>
            )
          })}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
