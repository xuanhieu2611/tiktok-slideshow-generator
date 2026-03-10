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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const valid = Array.from(e.target.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    if (valid.length > 0) addSlides(valid)
    e.target.value = ''
  }

  return (
    <div className="flex h-full flex-col bg-slate-900 p-3">
      <div className="mb-3 flex gap-1.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Images
        </button>
        <button
          onClick={addCtaSlide}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          CTA
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
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
