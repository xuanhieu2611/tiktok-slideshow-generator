import { create } from 'zustand'
import { Slide, ImageSlide, CtaSlide, TextStyle } from '@/types'
import { DEFAULT_STYLE } from '@/constants/defaults'

interface SlideshowState {
  slides: Slide[]
  selectedSlideId: string | null
  globalStyle: TextStyle

  addSlides: (files: File[]) => void
  removeSlide: (id: string) => void
  reorderSlides: (ids: string[]) => void
  selectSlide: (id: string | null) => void
  updateSlideStyle: (id: string, style: Partial<TextStyle>) => void
  updateSlideText: (id: string, text: { headline?: string; subtitle?: string }) => void
  updateGlobalStyle: (style: Partial<TextStyle>) => void
  applyGlobalToAll: () => void
  addCtaSlide: () => void
  updateCtaSlide: (id: string, data: Partial<Pick<CtaSlide, 'backgroundColor' | 'logoUrl' | 'logoFile'>>) => void
  getSelectedSlide: () => Slide | undefined
}

let idCounter = 0
const genId = () => `slide-${Date.now()}-${idCounter++}`

export const useSlideshowStore = create<SlideshowState>((set, get) => ({
  slides: [],
  selectedSlideId: null,
  globalStyle: { ...DEFAULT_STYLE },

  addSlides: (files: File[]) => {
    const newSlides: ImageSlide[] = files.map((file) => ({
      type: 'image' as const,
      id: genId(),
      style: { ...get().globalStyle },
      headline: '',
      subtitle: '',
      imageUrl: URL.createObjectURL(file),
      originalFile: file,
    }))
    set((state) => {
      const firstNew = newSlides[0]
      return {
        slides: [...state.slides, ...newSlides],
        selectedSlideId: state.selectedSlideId ?? firstNew?.id ?? null,
      }
    })
  },

  removeSlide: (id: string) => {
    set((state) => {
      const slide = state.slides.find((s) => s.id === id)
      if (slide?.type === 'image') {
        URL.revokeObjectURL(slide.imageUrl)
      }
      if (slide?.type === 'cta' && slide.logoUrl) {
        URL.revokeObjectURL(slide.logoUrl)
      }
      const remaining = state.slides.filter((s) => s.id !== id)
      let newSelected = state.selectedSlideId
      if (newSelected === id) {
        const idx = state.slides.findIndex((s) => s.id === id)
        newSelected = remaining[Math.min(idx, remaining.length - 1)]?.id ?? null
      }
      return { slides: remaining, selectedSlideId: newSelected }
    })
  },

  reorderSlides: (ids: string[]) => {
    set((state) => {
      const slideMap = new Map(state.slides.map((s) => [s.id, s]))
      return { slides: ids.map((id) => slideMap.get(id)!).filter(Boolean) }
    })
  },

  selectSlide: (id) => set({ selectedSlideId: id }),

  updateSlideStyle: (id, style) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === id ? { ...s, style: { ...s.style, ...style } } : s
      ),
    }))
  },

  updateSlideText: (id, text) => {
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === id ? { ...s, ...text } : s
      ),
    }))
  },

  updateGlobalStyle: (style) => {
    set((state) => ({ globalStyle: { ...state.globalStyle, ...style } }))
  },

  applyGlobalToAll: () => {
    set((state) => ({
      slides: state.slides.map((s) => ({ ...s, style: { ...state.globalStyle } })),
    }))
  },

  addCtaSlide: () => {
    const slide: CtaSlide = {
      type: 'cta',
      id: genId(),
      style: { ...get().globalStyle },
      headline: 'Follow for more!',
      subtitle: '',
      backgroundColor: '#000000',
      logoUrl: null,
      logoFile: null,
    }
    set((state) => ({
      slides: [...state.slides, slide],
      selectedSlideId: slide.id,
    }))
  },

  updateCtaSlide: (id, data) => {
    set((state) => ({
      slides: state.slides.map((s) => {
        if (s.id !== id || s.type !== 'cta') return s
        if (data.logoUrl && s.logoUrl) {
          URL.revokeObjectURL(s.logoUrl)
        }
        return { ...s, ...data }
      }),
    }))
  },

  getSelectedSlide: () => {
    const state = get()
    return state.slides.find((s) => s.id === state.selectedSlideId)
  },
}))
