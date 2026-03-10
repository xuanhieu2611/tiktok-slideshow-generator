'use client'

import { useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useSlideshowStore } from '@/store/useSlideshowStore'
import SortableSlide from './SortableSlide'

export default function Filmstrip() {
  const slides = useSlideshowStore((s) => s.slides)
  const selectedSlideId = useSlideshowStore((s) => s.selectedSlideId)
  const selectSlide = useSlideshowStore((s) => s.selectSlide)
  const removeSlide = useSlideshowStore((s) => s.removeSlide)
  const reorderSlides = useSlideshowStore((s) => s.reorderSlides)
  const addSlides = useSlideshowStore((s) => s.addSlides)
  const addCtaSlide = useSlideshowStore((s) => s.addCtaSlide)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const ids = slides.map((s) => s.id)
      const oldIndex = ids.indexOf(active.id as string)
      const newIndex = ids.indexOf(over.id as string)
      reorderSlides(arrayMove(ids, oldIndex, newIndex))
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-900 p-3">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded bg-gray-700 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
        >
          + Images
        </button>
        <button
          onClick={addCtaSlide}
          className="flex-1 rounded bg-gray-700 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
        >
          + CTA
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              addSlides(Array.from(e.target.files).filter((f) => f.type.startsWith('image/')))
              e.target.value = ''
            }
          }}
        />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {slides.map((slide, i) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                index={i}
                isSelected={slide.id === selectedSlideId}
                onSelect={() => selectSlide(slide.id)}
                onRemove={() => removeSlide(slide.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
