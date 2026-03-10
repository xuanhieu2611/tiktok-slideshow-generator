'use client'

import { useSlideshowStore } from '@/store/useSlideshowStore'
import { FontFamily } from '@/types'
import { FONT_LIST } from '@/constants/defaults'

export default function GlobalSettingsBar() {
  const globalStyle = useSlideshowStore((s) => s.globalStyle)
  const updateGlobalStyle = useSlideshowStore((s) => s.updateGlobalStyle)
  const applyGlobalToAll = useSlideshowStore((s) => s.applyGlobalToAll)

  return (
    <div className="flex items-center gap-4 border-t border-gray-700 bg-gray-900 px-4 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Global
      </span>

      <select
        value={globalStyle.fontFamily}
        onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value as FontFamily })}
        className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
      >
        {FONT_LIST.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <label className="flex items-center gap-1 text-xs text-gray-300">
        Size
        <input
          type="number"
          value={globalStyle.headlineFontSize}
          onChange={(e) => updateGlobalStyle({ headlineFontSize: Number(e.target.value) })}
          className="w-14 rounded border border-gray-600 bg-gray-800 px-1 py-1 text-xs text-white"
        />
      </label>

      <label className="flex items-center gap-1 text-xs text-gray-300">
        Color
        <input
          type="color"
          value={globalStyle.fontColor}
          onChange={(e) => updateGlobalStyle({ fontColor: e.target.value })}
          className="h-6 w-6 cursor-pointer rounded border border-gray-600 bg-transparent"
        />
      </label>

      <select
        value={globalStyle.textPosition}
        onChange={(e) => updateGlobalStyle({ textPosition: e.target.value as 'top' | 'center' | 'bottom' })}
        className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
      >
        <option value="top">Top</option>
        <option value="center">Center</option>
        <option value="bottom">Bottom</option>
      </select>

      <label className="flex items-center gap-1 text-xs text-gray-300">
        <input
          type="checkbox"
          checked={globalStyle.overlayEnabled}
          onChange={(e) => updateGlobalStyle({ overlayEnabled: e.target.checked })}
          className="accent-blue-500"
        />
        Overlay
      </label>

      {globalStyle.overlayEnabled && (
        <input
          type="range"
          min={0}
          max={100}
          value={globalStyle.overlayOpacity}
          onChange={(e) => updateGlobalStyle({ overlayOpacity: Number(e.target.value) })}
          className="w-20 accent-blue-500"
        />
      )}

      <button
        onClick={applyGlobalToAll}
        className="ml-auto rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
      >
        Apply to All Slides
      </button>
    </div>
  )
}
