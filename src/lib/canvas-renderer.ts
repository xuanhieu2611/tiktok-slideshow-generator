import { Slide, TextStyle } from '@/types'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants/defaults'
import { loadImage, computeCoverDimensions } from './image-utils'

const PADDING_X = 140
const LINE_HEIGHT_MULTIPLIER = 1.3
const TEXT_GAP = 20

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function getTextAlign(alignment: string): CanvasTextAlign {
  return alignment as CanvasTextAlign
}

function getTextX(alignment: string): number {
  switch (alignment) {
    case 'left':
      return PADDING_X
    case 'right':
      return CANVAS_WIDTH - PADDING_X
    default:
      return CANVAS_WIDTH / 2
  }
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  style: TextStyle,
  headline: string,
  subtitle: string
) {
  const maxWidth = CANVAS_WIDTH - PADDING_X * 2
  const textX = getTextX(style.textAlignment)
  ctx.textAlign = getTextAlign(style.textAlignment)

  if (style.textShadowEnabled) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  } else {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  ctx.fillStyle = style.fontColor

  ctx.font = `${style.headlineFontWeight} ${style.headlineFontSize}px "${style.fontFamily}"`
  const headlineLines = wrapText(ctx, headline, maxWidth)
  const headlineLineHeight = style.headlineFontSize * LINE_HEIGHT_MULTIPLIER

  ctx.font = `${style.subtitleFontWeight} ${style.subtitleFontSize}px "${style.fontFamily}"`
  const subtitleLines = wrapText(ctx, subtitle, maxWidth)
  const subtitleLineHeight = style.subtitleFontSize * LINE_HEIGHT_MULTIPLIER

  const headlineHeight = headlineLines.length * headlineLineHeight
  const subtitleHeight = subtitleLines.length * subtitleLineHeight
  const gap = subtitleLines.length > 0 && headlineLines.length > 0 ? TEXT_GAP : 0
  const totalHeight = headlineHeight + gap + subtitleHeight

  let startY: number
  switch (style.textPosition) {
    case 'top':
      startY = 150
      break
    case 'bottom':
      startY = CANVAS_HEIGHT - 150 - totalHeight
      break
    default:
      startY = (CANVAS_HEIGHT - totalHeight) / 2
  }

  ctx.font = `${style.headlineFontWeight} ${style.headlineFontSize}px "${style.fontFamily}"`
  headlineLines.forEach((line, i) => {
    ctx.fillText(line, textX, startY + (i + 1) * headlineLineHeight)
  })

  ctx.font = `${style.subtitleFontWeight} ${style.subtitleFontSize}px "${style.fontFamily}"`
  const subtitleStartY = startY + headlineHeight + gap
  subtitleLines.forEach((line, i) => {
    ctx.fillText(line, textX, subtitleStartY + (i + 1) * subtitleLineHeight)
  })

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

export async function drawSlide(
  canvas: HTMLCanvasElement,
  slide: Slide
): Promise<void> {
  const ctx = canvas.getContext('2d')!
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  await document.fonts.ready

  if (slide.type === 'image') {
    const img = await loadImage(slide.imageUrl)
    const crop = computeCoverDimensions(img.width, img.height, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  } else {
    ctx.fillStyle = slide.backgroundColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (slide.logoUrl) {
      try {
        const logo = await loadImage(slide.logoUrl)
        const maxLogoW = 300
        const maxLogoH = 300
        const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1)
        const logoW = logo.width * scale
        const logoH = logo.height * scale
        const logoX = (CANVAS_WIDTH - logoW) / 2
        const logoY = 200
        ctx.drawImage(logo, logoX, logoY, logoW, logoH)
      } catch {
        // Skip logo if it fails to load
      }
    }
  }

  if (slide.style.overlayEnabled) {
    ctx.fillStyle = `rgba(0, 0, 0, ${slide.style.overlayOpacity / 100})`
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  drawTextBlock(ctx, slide.style, slide.headline, slide.subtitle)
}

export async function renderSlideToBlob(slide: Slide): Promise<Blob> {
  const offscreen = document.createElement('canvas')
  await drawSlide(offscreen, slide)
  return new Promise((resolve) => {
    offscreen.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

export async function renderSlideToJpegBlob(slide: Slide, quality = 0.9): Promise<Blob> {
  const offscreen = document.createElement('canvas')
  await drawSlide(offscreen, slide)
  return new Promise((resolve) => {
    offscreen.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
  })
}
