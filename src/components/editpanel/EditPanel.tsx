'use client'

import { useSlideshowStore } from '@/store/useSlideshowStore'
import { TextStyle, FontFamily } from '@/types'
import { FONT_LIST } from '@/constants/defaults'
import ColorPicker from '@/components/ui/ColorPicker'
import Slider from '@/components/ui/Slider'
import Select from '@/components/ui/Select'
import { useRef } from 'react'
import { exportSingleSlide } from '@/lib/export'

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
  const logoInputRef = useRef<HTMLInputElement>(null)

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">
        Select a slide to edit
      </div>
    )
  }

  const updateStyle = (updates: Partial<TextStyle>) => {
    updateSlideStyle(slide.id, updates)
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4">
      <div className="space-y-5">
        {/* Text Inputs */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Text</h3>
          <input
            type="text"
            placeholder="Headline"
            value={slide.headline}
            onChange={(e) => updateSlideText(slide.id, { headline: e.target.value })}
            className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={slide.subtitle}
            onChange={(e) => updateSlideText(slide.id, { subtitle: e.target.value })}
            className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
        </section>

        {/* Font Controls */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Font</h3>
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
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Position</h3>
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
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Overlay</h3>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={slide.style.overlayEnabled}
              onChange={(e) => updateStyle({ overlayEnabled: e.target.checked })}
              className="accent-blue-500"
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

        {/* Shadow */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Shadow</h3>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={slide.style.textShadowEnabled}
              onChange={(e) => updateStyle({ textShadowEnabled: e.target.checked })}
              className="accent-blue-500"
            />
            Text Shadow
          </label>
        </section>

        {/* CTA-specific */}
        {slide.type === 'cta' && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">CTA Settings</h3>
            <ColorPicker
              label="Background"
              value={slide.backgroundColor}
              onChange={(v) => updateCtaSlide(slide.id, { backgroundColor: v })}
            />
            <div>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600"
              >
                {slide.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
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
        <section>
          <button
            onClick={() => exportSingleSlide(slide, slideIndex)}
            className="w-full rounded bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Export This Slide
          </button>
        </section>
      </div>
    </div>
  )
}
