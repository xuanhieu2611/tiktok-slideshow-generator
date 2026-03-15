'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Slide } from '@/types'
import { useSlideshowStore } from '@/store/useSlideshowStore'

interface SortableSlideProps {
  slide: Slide
  isSelected: boolean
  index: number
  onSelect: () => void
  onRemove: () => void
}

export default function SortableSlide({
  slide,
  isSelected,
  index,
  onSelect,
  onRemove,
}: SortableSlideProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id })
  const aspectRatio = useSlideshowStore((s) => s.aspectRatio)
  const thumbW = 88
  const thumbH = aspectRatio === '9:16' ? Math.round(thumbW * 16 / 9) : Math.round(thumbW * 5 / 4)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const headline = slide.headline ? slide.headline.slice(0, 14) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`group relative shrink-0 cursor-pointer rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.4)]'
          : 'border-transparent hover:border-slate-600'
      }`}
    >
      <div className="overflow-hidden rounded-md bg-slate-800" style={{ width: thumbW, height: thumbH }}>
        {slide.type === 'image' ? (
          <img
            src={slide.imageUrl}
            alt={`Slide ${index + 1}`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: slide.backgroundColor }}
          >
            CTA
          </div>
        )}
      </div>

      {/* Slide number badge */}
      <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
        {index + 1}
      </span>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-lg group-hover:flex"
        aria-label="Remove slide"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Headline preview */}
      {headline && (
        <p className="mt-0.5 truncate text-center text-[9px] text-slate-500" style={{ width: thumbW }}>
          {headline}
        </p>
      )}
    </div>
  )
}
