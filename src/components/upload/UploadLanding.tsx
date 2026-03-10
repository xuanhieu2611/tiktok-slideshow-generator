'use client'

import { useRouter } from 'next/navigation'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import DropZone from './DropZone'

export default function UploadLanding() {
  const router = useRouter()
  const addSlides = useSlideshowStore((s) => s.addSlides)
  const slides = useSlideshowStore((s) => s.slides)
  const removeSlide = useSlideshowStore((s) => s.removeSlide)

  const handleFiles = (files: File[]) => {
    addSlides(files)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-2 text-center text-4xl font-bold text-white">
          TikTok Slideshow Maker
        </h1>
        <p className="mb-8 text-center text-gray-400">
          Create stunning 1080×1350 slideshow images for TikTok
        </p>
        <DropZone onFiles={handleFiles} />
        {slides.length > 0 && (
          <>
            <ul className="mt-4 space-y-2">
              {slides.map((slide) => (
                <li
                  key={slide.id}
                  className="flex items-center justify-between rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-200"
                >
                  <span className="truncate">{'originalFile' in slide ? slide.originalFile.name : slide.id}</span>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="ml-3 shrink-0 text-gray-400 hover:text-white"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/editor')}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Start Editing ({slides.length} {slides.length === 1 ? 'image' : 'images'})
            </button>
          </>
        )}
      </div>
    </div>
  )
}
