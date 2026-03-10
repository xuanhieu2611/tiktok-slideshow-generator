import { Slide } from '@/types'
import { renderSlideToBlob } from './canvas-renderer'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export async function exportSingleSlide(slide: Slide, index: number): Promise<void> {
  const blob = await renderSlideToBlob(slide)
  saveAs(blob, `slide-${index + 1}.png`)
}

export async function exportAllAsZip(slides: Slide[]): Promise<void> {
  const zip = new JSZip()
  for (let i = 0; i < slides.length; i++) {
    const blob = await renderSlideToBlob(slides[i])
    zip.file(`slide-${i + 1}.png`, blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'tiktok-slideshow.zip')
}
