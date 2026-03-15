'use client'

import { useEffect, useRef, useState } from 'react'
import { Slide } from '@/types'
import { drawSlide } from '@/lib/canvas-renderer'

export function useCanvasRenderer(slide: Slide | undefined, width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !slide) return

    let cancelled = false
    setIsRendering(true)
    drawSlide(canvas, slide, width, height).then(() => {
      if (cancelled) return
      setIsRendering(false)
    })

    return () => {
      cancelled = true
      setIsRendering(false)
    }
  }, [slide, width, height])

  return { canvasRef, isRendering }
}
