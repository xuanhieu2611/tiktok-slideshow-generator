import { TextStyle, FontFamily } from '@/types'

export const DEFAULT_STYLE: TextStyle = {
  fontFamily: 'Inter',
  headlineFontSize: 64,
  subtitleFontSize: 32,
  fontColor: '#FFFFFF',
  headlineFontWeight: 'bold',
  subtitleFontWeight: 'normal',
  textPosition: 'center',
  textAlignment: 'center',
  overlayEnabled: true,
  overlayOpacity: 40,
  textShadowEnabled: true,
}

export const CANVAS_WIDTH = 1080
export const CANVAS_HEIGHT = 1350

export const FONT_LIST: FontFamily[] = [
  'Inter',
  'Montserrat',
  'Oswald',
  'Playfair Display',
  'Bebas Neue',
  'Arial',
  'Georgia',
]

export const FONT_WEIGHT_OPTIONS = [
  { label: 'Normal', value: 'normal' as const },
  { label: 'Bold', value: 'bold' as const },
]
