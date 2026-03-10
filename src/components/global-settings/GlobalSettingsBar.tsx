'use client'

import { useState } from 'react'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import { FontFamily } from '@/types'
import { FONT_LIST } from '@/constants/defaults'

export default function GlobalSettingsBar() {
  const globalStyle = useSlideshowStore((s) => s.globalStyle)
  const updateGlobalStyle = useSlideshowStore((s) => s.updateGlobalStyle)
  const applyGlobalToAll = useSlideshowStore((s) => s.applyGlobalToAll)
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    applyGlobalToAll()
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 border-t border-white/[0.06] bg-slate-900 px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Global
      </span>

      <div className="h-4 w-px bg-white/10" />

      <select
        value={globalStyle.fontFamily}
        onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value as FontFamily })}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/60"
      >
        {FONT_LIST.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        Size
        <input
          type="number"
          value={globalStyle.headlineFontSize}
          onChange={(e) => updateGlobalStyle({ headlineFontSize: Number(e.target.value) })}
          className="w-14 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/60"
        />
      </label>

      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        Color
        <input
          type="color"
          value={globalStyle.fontColor}
          onChange={(e) => updateGlobalStyle({ fontColor: e.target.value })}
          className="h-6 w-6 cursor-pointer rounded border border-white/10 bg-transparent"
        />
      </label>

      <select
        value={globalStyle.textPosition}
        onChange={(e) => updateGlobalStyle({ textPosition: e.target.value as 'top' | 'center' | 'bottom' })}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/60"
      >
        <option value="top">Top</option>
        <option value="center">Center</option>
        <option value="bottom">Bottom</option>
      </select>

      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={globalStyle.overlayEnabled}
          onChange={(e) => updateGlobalStyle({ overlayEnabled: e.target.checked })}
          className="accent-violet-500"
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
          className="w-20 accent-violet-500"
        />
      )}

      <button
        onClick={handleApply}
        className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all ${
          applied
            ? 'bg-green-700 hover:bg-green-600'
            : 'bg-violet-600 hover:bg-violet-500'
        }`}
      >
        {applied ? '✓ Applied!' : 'Apply to All Slides'}
      </button>
    </div>
  )
}
