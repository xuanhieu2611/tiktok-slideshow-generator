'use client'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="min-w-[80px] text-gray-300">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border border-gray-600 bg-transparent"
      />
      <span className="text-xs text-gray-400">{value}</span>
    </label>
  )
}
