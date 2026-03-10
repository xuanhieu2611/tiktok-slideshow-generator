'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Slide } from '@/types'

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`group relative shrink-0 cursor-pointer rounded-lg border-2 transition-colors ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-500'
      }`}
    >
      <div className="h-[120px] w-[68px] overflow-hidden rounded-md bg-gray-800">
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
      <span className="absolute bottom-0 left-0 rounded-br-md rounded-tl-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
        {index + 1}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white group-hover:flex"
      >
        ×
      </button>
    </div>
  )
}
