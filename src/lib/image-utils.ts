export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function computeCoverDimensions(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number
): { sx: number; sy: number; sw: number; sh: number } {
  const imgRatio = imgW / imgH
  const canvasRatio = canvasW / canvasH

  if (imgRatio > canvasRatio) {
    const sw = imgH * canvasRatio
    const sx = (imgW - sw) / 2
    return { sx, sy: 0, sw, sh: imgH }
  } else {
    const sh = imgW / canvasRatio
    const sy = (imgH - sh) / 2
    return { sx: 0, sy, sw: imgW, sh }
  }
}
