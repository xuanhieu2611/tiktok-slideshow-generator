'use client'

import { useEffect, useState } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { renderSlideToBlob } from '@/lib/canvas-renderer'

type UploadState = 'idle' | 'rendering' | 'uploading' | 'polling' | 'success' | 'error'

interface TikTokUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const STATUS_MESSAGES: Record<string, string> = {
  PROCESSING_UPLOAD: 'TikTok is processing your upload...',
  PROCESSING_DOWNLOAD: 'TikTok is downloading your images...',
  SEND_TO_USER_INBOX: 'Sent to your TikTok inbox!',
  PUBLISH_COMPLETE: 'Published successfully!',
  FAILED: 'TikTok processing failed. Please try again.',
}

export default function TikTokUploadModal({ isOpen, onClose }: TikTokUploadModalProps) {
  const slides = useSlideshowStore((s) => s.slides)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [publishId, setPublishId] = useState('')
  const [pollStatus, setPollStatus] = useState('')

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUploadState('idle')
      setErrorMessage('')
      setPublishId('')
      setPollStatus('')
    }
  }, [isOpen])

  const handleUpload = async () => {
    setUploadState('rendering')
    setErrorMessage('')

    try {
      // Render all slides to blobs
      const blobs: Blob[] = []
      for (const slide of slides) {
        const blob = await renderSlideToBlob(slide)
        blobs.push(blob)
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

      // Poll for status
      pollUploadStatus(data.publishId)
    } catch (err) {
      setUploadState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const pollUploadStatus = async (id: string) => {
    const maxAttempts = 20
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUploadState('success')
        return
      }
      attempts++

      try {
        const res = await fetch(`/api/upload/status/${id}`)
        const data = await res.json()

        if (data.status) {
          setPollStatus(data.status)
          if (data.status === 'PUBLISH_COMPLETE' || data.status === 'SEND_TO_USER_INBOX') {
            setUploadState('success')
            return
          }
          if (data.status === 'FAILED') {
            setUploadState('error')
            setErrorMessage('TikTok processing failed. Check your TikTok inbox.')
            return
          }
        }
      } catch {
        // ignore poll errors
      }

      setTimeout(poll, 3000)
    }

    poll()
  }

  if (!isOpen) return null

  const isInProgress = uploadState === 'rendering' || uploadState === 'uploading' || uploadState === 'polling'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={() => !isInProgress && onClose()}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-5 py-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
            </svg>
            Upload to TikTok
          </h2>
          {!isInProgress && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {uploadState === 'idle' && (
            <>
              {/* Slide thumbnails */}
              <div className="mb-4">
                <p className="mb-2 text-xs text-gray-400">{slides.length} slide{slides.length !== 1 ? 's' : ''} to upload</p>
                <div className="flex flex-wrap gap-1.5">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="h-[57px] w-[40px] shrink-0 overflow-hidden rounded bg-gray-800">
                      {slide.type === 'image' ? (
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
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

              {/* Title */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Title <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Caption / Hashtags <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="#hashtags and caption"
                  rows={3}
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2 rounded bg-gray-800 px-3 py-2.5 text-xs text-gray-400">
                <p>Your slides will be uploaded as a draft. Open TikTok and check your inbox notifications to finish posting.</p>
                <p>Images will be converted from PNG to JPEG for TikTok compatibility.</p>
                <p>Note: Until your TikTok developer app is approved, posts will be private (SELF_ONLY). You can change visibility after opening in TikTok.</p>
                <p>Rate limit: ~6 photo posts/min, ~15/day per account.</p>
              </div>
            </>
          )}

          {(uploadState === 'rendering' || uploadState === 'uploading') && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white" />
              <p className="text-sm text-gray-300">
                {uploadState === 'rendering' ? 'Rendering slides...' : 'Uploading to TikTok...'}
              </p>
            </div>
          )}

          {uploadState === 'polling' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-400" />
              <p className="text-sm text-gray-300">
                {pollStatus
                  ? (STATUS_MESSAGES[pollStatus] || `Status: ${pollStatus}`)
                  : 'Waiting for TikTok to process your images...'}
              </p>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Slides uploaded!</p>
                <p className="mt-1 text-sm text-gray-400">
                  Open TikTok and check your inbox to finish posting.
                </p>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Upload failed</p>
                <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-700 px-5 py-3">
          {uploadState === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="rounded px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={slides.length === 0}
                className="rounded bg-[#010101] px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Upload ({slides.length})
              </button>
            </>
          )}
          {(uploadState === 'success' || uploadState === 'error') && (
            <button
              onClick={onClose}
              className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
            >
              Close
            </button>
          )}
          {uploadState === 'error' && (
            <button
              onClick={() => setUploadState('idle')}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
