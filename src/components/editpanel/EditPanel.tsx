'use client'

import { useState, useRef } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { TextStyle, FontFamily } from '@/types'
import { FONT_LIST } from '@/constants/defaults'
import ColorPicker from '@/components/ui/ColorPicker'
import Slider from '@/components/ui/Slider'
import Select from '@/components/ui/Select'
import { exportSingleSlide } from '@/lib/export'
import { getCanvasDimensions } from '@/constants/defaults'

export default function EditPanel() {
  const slide = useSlideshowStore((s) =>
    s.slides.find((sl) => sl.id === s.selectedSlideId)
  )
  const slideIndex = useSlideshowStore((s) =>
    s.slides.findIndex((sl) => sl.id === s.selectedSlideId)
  )
  const updateSlideStyle = useSlideshowStore((s) => s.updateSlideStyle)
  const updateSlideText = useSlideshowStore((s) => s.updateSlideText)
  const updateCtaSlide = useSlideshowStore((s) => s.updateCtaSlide)
  const aspectRatio = useSlideshowStore((s) => s.aspectRatio)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-slate-600">
        Select a slide to edit
      </div>
    )
  }

  const updateStyle = (updates: Partial<TextStyle>) => {
    updateSlideStyle(slide.id, updates)
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const { width, height } = getCanvasDimensions(aspectRatio)
      await exportSingleSlide(slide, slideIndex, width, height)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const sectionClass = 'space-y-2 border-b border-white/[0.05] pb-4 mb-4'
  const headingClass = 'text-[10px] font-semibold uppercase tracking-wider text-slate-500'
  const inputClass = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/60'

  return (
    <div className="h-full overflow-y-auto bg-slate-900 p-4">
      <div className="space-y-0">
        {/* Text Inputs */}
        <section className={sectionClass}>
          <h3 className={headingClass}>Text</h3>
          <input
            type="text"
            placeholder="Headline"
            value={slide.headline}
            onChange={(e) => updateSlideText(slide.id, { headline: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={slide.subtitle}
            onChange={(e) => updateSlideText(slide.id, { subtitle: e.target.value })}
            className={inputClass}
          />
        </section>

        {/* Font Controls */}
        <section className={sectionClass}>
          <h3 className={headingClass}>Font</h3>
          <Select
            label="Family"
            value={slide.style.fontFamily}
            options={FONT_LIST.map((f) => ({ label: f, value: f }))}
            onChange={(v) => updateStyle({ fontFamily: v as FontFamily })}
          />
          <Slider
            label="Headline Size"
            value={slide.style.headlineFontSize}
            min={24}
            max={120}
            onChange={(v) => updateStyle({ headlineFontSize: v })}
          />
          <Slider
            label="Subtitle Size"
            value={slide.style.subtitleFontSize}
            min={16}
            max={72}
            onChange={(v) => updateStyle({ subtitleFontSize: v })}
          />
          <Select
            label="Headline Weight"
            value={slide.style.headlineFontWeight}
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Bold', value: 'bold' },
            ]}
            onChange={(v) => updateStyle({ headlineFontWeight: v as 'normal' | 'bold' })}
          />
          <Select
            label="Subtitle Weight"
            value={slide.style.subtitleFontWeight}
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Bold', value: 'bold' },
            ]}
            onChange={(v) => updateStyle({ subtitleFontWeight: v as 'normal' | 'bold' })}
          />
          <ColorPicker
            label="Text Color"
            value={slide.style.fontColor}
            onChange={(v) => updateStyle({ fontColor: v })}
          />
        </section>

        {/* Position */}
        <section className={sectionClass}>
          <h3 className={headingClass}>Position</h3>
          <Select
            label="Vertical Position"
            value={slide.style.textPosition}
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Center', value: 'center' },
              { label: 'Bottom', value: 'bottom' },
            ]}
            onChange={(v) => updateStyle({ textPosition: v as 'top' | 'center' | 'bottom' })}
          />
          <Select
            label="Text Alignment"
            value={slide.style.textAlignment}
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ]}
            onChange={(v) => updateStyle({ textAlignment: v as 'left' | 'center' | 'right' })}
          />
        </section>

        {/* Overlay */}
        <section className={sectionClass}>
          <h3 className={headingClass}>Overlay</h3>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={slide.style.overlayEnabled}
              onChange={(e) => updateStyle({ overlayEnabled: e.target.checked })}
              className="accent-violet-500"
            />
            Dark Overlay
          </label>
          {slide.style.overlayEnabled && (
            <Slider
              label="Opacity"
              value={slide.style.overlayOpacity}
              min={0}
              max={100}
              onChange={(v) => updateStyle({ overlayOpacity: v })}
            />
          )}
        </section>

        {/* Text Effects */}
        <section className={sectionClass}>
          <h3 className={headingClass}>Text Effects</h3>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={slide.style.textShadowEnabled}
              onChange={(e) => updateStyle({ textShadowEnabled: e.target.checked })}
              className="accent-violet-500"
            />
            Text Shadow
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={slide.style.textStrokeEnabled}
              onChange={(e) => updateStyle({ textStrokeEnabled: e.target.checked })}
              className="accent-violet-500"
            />
            Text Border
          </label>
        </section>

        {/* CTA-specific */}
        {slide.type === 'cta' && (
          <section className={sectionClass}>
            <h3 className={headingClass}>CTA Settings</h3>
            <ColorPicker
              label="Background"
              value={slide.backgroundColor}
              onChange={(v) => updateCtaSlide(slide.id, { backgroundColor: v })}
            />
            <div className="space-y-2">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
              >
                {slide.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              {slide.logoUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={slide.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 rounded object-contain bg-slate-800"
                  />
                  <button
                    onClick={() => updateCtaSlide(slide.id, { logoUrl: null, logoFile: null })}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    updateCtaSlide(slide.id, {
                      logoUrl: URL.createObjectURL(file),
                      logoFile: file,
                    })
                  }
                }}
              />
            </div>
          </section>
        )}

        {/* Export single */}
        <section className="pt-1">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exporting…
              </>
            ) : (
              'Export This Slide'
            )}
          </button>
          {exportError && (
            <p className="mt-1.5 text-xs text-red-400">{exportError}</p>
          )}
        </section>
      </div>
    </div>
  )
}
