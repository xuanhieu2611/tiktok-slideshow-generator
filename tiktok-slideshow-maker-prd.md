# PRD: TikTok Slideshow Maker

## Overview

Build a local, browser-based tool that lets a user upload images, add styled text overlays to each image, and export finished slides as downloadable PNGs — optimized for TikTok slideshows. No backend, no API calls, no external services. Everything runs client-side in the browser.

The target user is a small marketing team that currently does this workflow manually in Canva: find image → add text overlay → export → post to TikTok. This tool replaces the Canva step entirely.

---

## Tech Stack

- **React** (Vite + TypeScript)
- **Tailwind CSS** for UI styling
- **HTML Canvas API** for rendering text onto images and exporting final PNGs
- No backend. No database. No API keys. Fully client-side.

---

## Core Features

### 1. Image Upload

- User can upload multiple images at once (drag-and-drop or file picker)
- Accepted formats: PNG, JPG, JPEG, WEBP
- Each uploaded image becomes a "slide" in the slideshow
- User can reorder slides via drag-and-drop
- User can delete individual slides
- Show image thumbnails in a sidebar or filmstrip view

### 2. Text Overlay Editor

For each slide, the user can configure:

- **Headline text** — large, primary text (e.g., "1. Poor Nutrition")
- **Subtitle text** (optional) — smaller secondary text below the headline (e.g., "Fuel your runs properly")
- **Text position** — dropdown or toggle: Top, Center, Bottom (default: Center)
- **Text alignment** — Left, Center, Right (default: Center)
- **Font size** — slider or input, separate for headline (default: 64px) and subtitle (default: 32px)
- **Font color** — color picker (default: #FFFFFF white)
- **Font family** — dropdown with web-safe options: Inter, Montserrat, Oswald, Playfair Display, Bebas Neue, Arial, Georgia (load from Google Fonts)
- **Font weight** — Bold / Normal toggle (default: Bold for headline, Normal for subtitle)
- **Background overlay** — semi-transparent dark layer behind the entire image so text is readable
  - Toggle on/off (default: on)
  - Opacity slider: 0% to 80% (default: 40%)
- **Text shadow** — subtle shadow for extra readability (default: on, 2px black shadow)

### 3. Live Preview

- The main area of the screen shows a real-time WYSIWYG preview of the currently selected slide
- Preview should show the image with the text overlay and dark background overlay exactly as it will look when exported
- Preview should be displayed at 1080×1920 (9:16) aspect ratio, scaled to fit the screen
- When the user changes any setting, the preview updates instantly

### 4. CTA Slide Template

- A button labeled "Add CTA Slide" that appends a special final slide
- The CTA slide has:
  - A solid background color (default: black, user can change via color picker)
  - Large headline text (default: "Join the Waitlist")
  - Subtitle text (default: "Stride AI")
  - Optional: user can upload a logo image that gets placed on the CTA slide
- The CTA slide uses the same text controls as other slides (font, size, color, position)

### 5. Global Style Settings

- A "Global Settings" panel that lets the user set defaults that apply to ALL slides at once:
  - Font family
  - Font size (headline + subtitle)
  - Font color
  - Overlay opacity
  - Text position
- Individual slides can still override global settings
- A "Apply to All Slides" button that resets all slides to current global settings

### 6. Export / Download

- **Export single slide**: button on each slide to download that one slide as a PNG
- **Export all slides**: a button that downloads all slides as individual PNGs in a ZIP file (use JSZip library)
- Export resolution: **1080×1920 pixels** (TikTok optimal, 9:16 ratio)
- Images should be scaled/cropped to fill the 1080×1920 frame (cover behavior, centered) — do not stretch or distort
- Filename format: `slide-01.png`, `slide-02.png`, etc.
- The CTA slide should be the last file in the ZIP

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: "TikTok Slideshow Maker"    [Export All ↓] │
├────────────┬────────────────────┬───────────────────┤
│            │                    │                   │
│  Slide     │   Live Preview     │  Edit Panel       │
│  Filmstrip │   (9:16 ratio)     │  - Headline text  │
│            │                    │  - Subtitle text  │
│  [Slide 1] │   ┌────────────┐  │  - Font family    │
│  [Slide 2] │   │            │  │  - Font size      │
│  [Slide 3] │   │   Image    │  │  - Font color     │
│  [Slide 4] │   │   with     │  │  - Text position  │
│  [Slide 5] │   │   text     │  │  - Overlay toggle │
│  [CTA]     │   │   overlay  │  │  - Overlay opacity│
│            │   │            │  │  - Text shadow    │
│ [+Add CTA] │   └────────────┘  │                   │
│            │                    │  [Download Slide] │
├────────────┴────────────────────┴───────────────────┤
│  Global Settings Bar                                │
│  Font: [___] Size: [__] Color: [_] Pos: [_]        │
│  [Apply to All Slides]                              │
└─────────────────────────────────────────────────────┘
```

- **Left sidebar**: filmstrip of slide thumbnails, reorderable via drag-and-drop
- **Center**: large live preview of the selected slide at 9:16 ratio
- **Right sidebar**: editing controls for the selected slide
- **Bottom bar**: global settings
- Responsive: on smaller screens, stack the panels vertically

---

## Detailed Behavior

### Image Scaling Logic

When rendering a slide for export (1080×1920):

1. Take the uploaded image
2. Scale it so it **covers** the entire 1080×1920 canvas (like CSS `object-fit: cover`)
3. Center the image — crop overflow equally from both sides
4. Draw the dark overlay on top (if enabled)
5. Draw the text on top of the overlay

### Text Rendering on Canvas

- Use `ctx.fillText()` with proper font settings
- Word-wrap long text to fit within the canvas width (with ~60px horizontal padding on each side)
- Line height: 1.3x font size
- For "Top" position: text starts ~150px from top
- For "Center" position: text is vertically centered
- For "Bottom" position: text ends ~150px from bottom
- Subtitle renders below headline with ~20px gap
- Apply text shadow via `ctx.shadowColor`, `ctx.shadowBlur`, `ctx.shadowOffsetX/Y`

### Drag-and-Drop Reorder

- Slides in the filmstrip can be dragged to reorder
- Use a lightweight approach (HTML drag and drop API or a library like dnd-kit)
- Visual feedback when dragging (opacity change, drop indicator)

---

## Dependencies

- `react` + `react-dom`
- `typescript`
- `tailwindcss`
- `jszip` — for zipping multiple exported PNGs
- `file-saver` — for triggering downloads
- `@dnd-kit/core` + `@dnd-kit/sortable` — for drag-and-drop reordering (optional, can use native HTML DnD)
- Google Fonts loaded via `<link>` tag in index.html for font options

No other dependencies. No backend. No API keys.

---

## Edge Cases to Handle

- User uploads a landscape image → it gets cropped to fill 9:16 (center crop). Show a subtle note that the image will be cropped.
- User types very long text → word-wrap it, and if it still overflows the canvas, reduce font size automatically or truncate with "..." and warn the user.
- User uploads no images but tries to export → show a friendly error message.
- User doesn't add text to a slide → export the image as-is with just the overlay (if enabled).
- Very large image files → process them fine via Canvas API, but consider showing a loading state.

---

## Out of Scope (for now)

- Video export / animation
- AI-generated text content (user types text manually)
- AI image generation or stock photo search
- User accounts or saving projects
- Direct posting to TikTok
- Mobile app version

---

## Success Criteria

The tool is successful if a user can:

1. Upload 5 images
2. Add headline + subtitle text to each
3. Add a CTA slide at the end
4. Export all 6 slides as a ZIP of PNGs in under 3 minutes total
5. The exported images look clean and professional at 1080×1920
6. The entire flow requires zero design skill
