'use client'

import { useCallback, useRef, useState } from 'react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
      )
      if (files.length > 0) onFiles(files)
    },
    [onFiles]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <div
      role="button"
      aria-label="Upload images"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
        isDragging
          ? 'border-violet-500/60 bg-violet-500/10 scale-[1.01]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <svg
        className={`mb-3 h-12 w-12 transition-colors ${isDragging ? 'text-violet-400' : 'text-slate-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className={`text-base font-medium transition-colors ${isDragging ? 'text-violet-300' : 'text-slate-300'}`}>
        {isDragging ? 'Release to upload' : 'Drop images here or click to browse'}
      </p>
      <p className="mt-1 text-sm text-slate-500">PNG, JPG, WebP — up to 35 slides</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
