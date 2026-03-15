'use client'

import { useRouter } from 'next/navigation'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { useUser } from '@/hooks/useUser'
import DropZone from './DropZone'

export default function UploadLanding() {
  const router = useRouter()
  const addSlides = useSlideshowStore((s) => s.addSlides)
  const slides = useSlideshowStore((s) => s.slides)
  const removeSlide = useSlideshowStore((s) => s.removeSlide)
  const aspectRatio = useSlideshowStore((s) => s.aspectRatio)
  const setAspectRatio = useSlideshowStore((s) => s.setAspectRatio)
  const { user, logout } = useUser()

  const handleFiles = (files: File[]) => {
    addSlides(files)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#030712] px-4 overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            animation: 'bgPulse 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full opacity-[0.05] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            animation: 'bgPulse 8s ease-in-out infinite 3s',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-end px-2 py-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{user.email}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
        <div className="w-full max-w-xl">
          {/* Logo + wordmark */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
              </svg>
              <h1
                className="text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Slideshow Maker
              </h1>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                Beta
              </span>
            </div>
          </div>

          {/* Hero headline */}
          <h2 className="mb-3 text-center text-5xl font-black leading-tight text-white">
            Create stunning<br />TikTok slideshows
          </h2>
          <p className="mb-6 text-center text-slate-400">
            Upload your images and transform them into scroll-stopping content.
          </p>

          {/* Feature pills */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {['TikTok Native', 'Export as ZIP'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Aspect ratio selector */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500">Canvas format</span>
            <div className="flex gap-3">
              {([
                { ratio: '4:5' as const, dims: '1080×1350', label: '4:5', desc: 'Square-ish' },
                { ratio: '9:16' as const, dims: '1080×1920', label: '9:16', desc: 'Full screen' },
              ]).map(({ ratio, dims, label, desc }) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-5 py-3 transition ${
                    aspectRatio === ratio
                      ? 'border-violet-500/60 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  <div className={`flex items-end justify-center gap-0.5`}>
                    <div
                      className={`rounded-sm border-2 ${aspectRatio === ratio ? 'border-violet-400' : 'border-slate-600'}`}
                      style={ratio === '9:16' ? { width: 14, height: 24 } : { width: 18, height: 22 }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-[10px] text-slate-500">{dims}</span>
                </button>
              ))}
            </div>
          </div>

          <DropZone onFiles={handleFiles} />

          {slides.length > 0 && (
            <>
              {/* File list */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {slides.length} / 35 images
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {slides.map((slide) => (
                    <li
                      key={slide.id}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                    >
                      {/* Thumbnail */}
                      {'imageUrl' in slide && (
                        <div className="h-[40px] w-[32px] shrink-0 overflow-hidden rounded-md bg-slate-800">
                          <img
                            src={slide.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <span className="flex-1 truncate text-sm text-slate-300">
                        {'originalFile' in slide ? slide.originalFile.name : slide.id}
                      </span>
                      <button
                        onClick={() => removeSlide(slide.id)}
                        className="shrink-0 rounded-lg p-1 text-slate-600 transition hover:bg-white/10 hover:text-white"
                        aria-label="Remove"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => router.push('/editor')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.3)',
                }}
              >
                Start Editing
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bgPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  )
}
