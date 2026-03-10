'use client'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export default function Slider({ label, value, min, max, step = 1, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-blue-500"
      />
    </label>
  )
}
