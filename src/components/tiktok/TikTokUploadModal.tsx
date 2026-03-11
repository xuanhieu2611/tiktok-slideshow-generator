'use client'

import { useEffect, useState } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { renderSlideToBlob } from '@/lib/canvas-renderer'

type UploadState = 'idle' | 'rendering' | 'uploading' | 'polling' | 'success' | 'error' | 'unknown'

interface TikTokUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const POLL_STEPS = ['Uploaded', 'Processing', 'Ready'] as const

const STATUS_TO_STEP: Record<string, number> = {
  PROCESSING_DOWNLOAD: 1,
  PROCESSING_UPLOAD: 1,
  SEND_TO_USER_INBOX: 2,
  PUBLISH_COMPLETE: 2,
}

export default function TikTokUploadModal({ isOpen, onClose }: TikTokUploadModalProps) {
  const slides = useSlideshowStore((s) => s.slides)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [publishId, setPublishId] = useState('')
  const [pollStep, setPollStep] = useState(0)
  const [renderProgress, setRenderProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && uploadState !== 'uploading' && uploadState !== 'rendering') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, uploadState])

  useEffect(() => {
    if (isOpen) {
      setUploadState('idle')
      setErrorMessage('')
      setPublishId('')
      setPollStep(0)
      setRenderProgress({ current: 0, total: 0 })
    }
  }, [isOpen])

  const handleUpload = async () => {
    setUploadState('rendering')
    setErrorMessage('')
    setRenderProgress({ current: 0, total: slides.length })

    try {
      const blobs: Blob[] = []
      for (let i = 0; i < slides.length; i++) {
        const blob = await renderSlideToBlob(slides[i])
        blobs.push(blob)
        setRenderProgress({ current: i + 1, total: slides.length })
      }

      setUploadState('uploading')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      blobs.forEach((blob, i) => {
        formData.append(`slide${i}`, blob, `slide-${i + 1}.png`)
      })

      const res = await fetch('/api/upload/slides', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPublishId(data.publishId)
      setUploadState('polling')
      pollUploadStatus(data.publishId)
    } catch (err) {
      setUploadState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const pollUploadStatus = async (id: string) => {
    const maxAttempts = 20
    let attempts = 0
    let consecutiveErrors = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUploadState('unknown')
        return
      }
      attempts++

      try {
        const res = await fetch(`/api/upload/status/${id}`)
        const data = await res.json()
        consecutiveErrors = 0

        if (data.status) {
          const step = STATUS_TO_STEP[data.status] ?? 0
          setPollStep(step)

          if (data.status === 'PUBLISH_COMPLETE' || data.status === 'SEND_TO_USER_INBOX') {
            setPollStep(2)
            setUploadState('success')
            return
          }
          if (data.status === 'FAILED') {
            setUploadState('error')
            setErrorMessage('TikTok processing failed. Check your TikTok inbox.')
            return
          }
        }
      } catch (err) {
        consecutiveErrors++
        console.error('Poll error:', err)
        if (consecutiveErrors >= 3) {
          setUploadState('error')
          setErrorMessage('Lost connection while checking upload status.')
          return
        }
      }

      setTimeout(poll, 3000)
    }

    poll()
  }

  if (!isOpen) return null

  const isInProgress = uploadState === 'rendering' || uploadState === 'uploading' || uploadState === 'polling'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => !isInProgress && onClose()}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-white/[0.08] bg-slate-900/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
            </svg>
            Save Draft to TikTok
          </h2>
          {!isInProgress && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {uploadState === 'idle' && (
            <>
              <div className="mb-4">
                <p className="mb-2 text-xs text-slate-500">
                  {slides.length} slide{slides.length !== 1 ? 's' : ''} to upload
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="h-[57px] w-[40px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      {slide.type === 'image' ? (
                        <img src={slide.imageUrl} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: slide.backgroundColor }}
                        >
                          CTA
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Title <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 focus:ring-violet-500/60"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Caption / Hashtags <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="#hashtags and caption"
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 focus:ring-violet-500/60"
                />
              </div>

              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-xs text-slate-500">
                <p>Images are converted from PNG to JPEG for TikTok compatibility.</p>
                <p>Rate limit: ~6 photo posts/min, ~15/day per account.</p>
              </div>
            </>
          )}

          {uploadState === 'rendering' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-white" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Rendering slides…</p>
                <p className="mt-1 text-xs text-slate-500">
                  {renderProgress.current} / {renderProgress.total}
                </p>
              </div>
              {renderProgress.total > 0 && (
                <div className="w-48 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${(renderProgress.current / renderProgress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-violet-400" />
              <p className="text-sm font-medium text-white">Uploading to TikTok…</p>
            </div>
          )}

          {uploadState === 'polling' && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-violet-400" />
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {POLL_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          i < pollStep
                            ? 'bg-violet-600 text-white'
                            : i === pollStep
                            ? 'border-2 border-violet-500 text-violet-400'
                            : 'border-2 border-slate-700 text-slate-600'
                        }`}
                      >
                        {i < pollStep ? (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className={`text-[9px] ${i <= pollStep ? 'text-slate-300' : 'text-slate-600'}`}>
                        {step}
                      </span>
                    </div>
                    {i < POLL_STEPS.length - 1 && (
                      <div className={`mb-4 h-px w-8 ${i < pollStep ? 'bg-violet-600' : 'bg-slate-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
              >
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Draft saved!</p>
                <p className="mt-1 text-sm text-slate-400">
                  Your slides were saved as a draft in your TikTok inbox. Open{' '}
                  <a href="https://www.tiktok.com/inbox" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                    TikTok
                  </a>{' '}
                  to review and publish.
                </p>
              </div>
            </div>
          )}

          {uploadState === 'unknown' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Status unknown</p>
                <p className="mt-1 text-sm text-slate-400">
                  Check your{' '}
                  <a href="https://www.tiktok.com/inbox" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                    TikTok inbox
                  </a>{' '}
                  to see if the post arrived.
                </p>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Upload failed</p>
                <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
          {uploadState === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={slides.length === 0}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
              >
                Save as Draft ({slides.length})
              </button>
            </>
          )}
          {(uploadState === 'success' || uploadState === 'error' || uploadState === 'unknown') && (
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Close
            </button>
          )}
          {uploadState === 'error' && (
            <button
              onClick={() => setUploadState('idle')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
