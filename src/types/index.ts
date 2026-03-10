export type TextPosition = 'top' | 'center' | 'bottom'
export type TextAlignment = 'left' | 'center' | 'right'
export type FontFamily =
  | 'Inter'
  | 'Montserrat'
  | 'Oswald'
  | 'Playfair Display'
  | 'Bebas Neue'
  | 'Arial'
  | 'Georgia'

export interface TextStyle {
  fontFamily: FontFamily
  headlineFontSize: number
  subtitleFontSize: number
  fontColor: string
  headlineFontWeight: 'normal' | 'bold'
  subtitleFontWeight: 'normal' | 'bold'
  textPosition: TextPosition
  textAlignment: TextAlignment
  overlayEnabled: boolean
  overlayOpacity: number
  textShadowEnabled: boolean
}

export interface ImageSlide {
  type: 'image'
  id: string
  style: TextStyle
  headline: string
  subtitle: string
  imageUrl: string
  originalFile: File
}

export interface CtaSlide {
  type: 'cta'
  id: string
  style: TextStyle
  headline: string
  subtitle: string
  backgroundColor: string
  logoUrl: string | null
  logoFile: File | null
}

export type Slide = ImageSlide | CtaSlide
