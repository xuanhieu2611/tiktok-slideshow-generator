'use client'

import { useEffect, useRef } from 'react'
import { Slide } from '@/types'
import { drawSlide } from '@/lib/canvas-renderer'

export function useCanvasRenderer(slide: Slide | undefined) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !slide) return

    let cancelled = false
    drawSlide(canvas, slide).then(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [slide])

  return canvasRef
}
