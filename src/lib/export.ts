import { Slide } from '@/types'
import { renderSlideToBlob } from './canvas-renderer'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export async function exportSingleSlide(slide: Slide, index: number): Promise<void> {
  try {
    const blob = await renderSlideToBlob(slide)
    saveAs(blob, `slide-${index + 1}.png`)
  } catch (err) {
    throw new Error(`Failed to export slide ${index + 1}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function exportAllAsZip(slides: Slide[]): Promise<void> {
  try {
    const zip = new JSZip()
    for (let i = 0; i < slides.length; i++) {
      try {
        const blob = await renderSlideToBlob(slides[i])
        zip.file(`slide-${i + 1}.png`, blob)
      } catch (err) {
        throw new Error(`Failed to export slide ${i + 1}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'tiktok-slideshow.zip')
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error(`Failed to export ZIP: ${String(err)}`)
  }
}
