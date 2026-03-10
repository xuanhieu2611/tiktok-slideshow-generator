# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
```

Package manager: **pnpm** (not npm or yarn).

No test suite or linter is configured.

## Architecture

**TikTok Slideshow Maker** — a fully client-side Next.js app. No backend, no API routes, no database.

User flow: Upload images (`/`) → Edit in 3-column layout (`/editor`) → Export as PNG/ZIP.

### State

`src/store/useSlideshowStore.ts` — single Zustand store holding all slides, selected slide index, and global style defaults. All components read/write through this store.

### Rendering Pipeline

`src/lib/canvas-renderer.ts` is the core: it renders a `Slide` object to a 1080×1350 HTML5 Canvas (4:5 ratio). Used both for live preview (`PreviewCanvas.tsx` via `useCanvasRenderer.ts`) and export (`src/lib/export.ts`).

Export uses `Canvas.toBlob` → `file-saver` for single slides, or `JSZip` + `file-saver` for all slides as a ZIP.

### Upload Page (`src/components/upload/UploadLanding.tsx`)

- Drop zone for uploading images (`DropZone.tsx`)
- After upload, shows a list of filenames with an × button to remove individual images
- "Start Editing" button navigates to `/editor` once at least one image is added

### Editor Layout (`src/app/editor/page.tsx`)

Three columns:
- **Left** — `Filmstrip.tsx`: reorderable slide list (dnd-kit)
- **Center** — `PreviewCanvas.tsx`: live 4:5 WYSIWYG preview
- **Right** — `EditPanel.tsx`: per-slide text/style controls

Bottom bar: `GlobalSettingsBar.tsx` applies style defaults to all slides.

### Key Types (`src/types/index.ts`)

`Slide` is a union of `ImageSlide` and `CtaSlide`. Each slide carries its own `TextStyle` (font, color, position, overlay, shadow). `src/constants/defaults.ts` defines canvas dimensions (1080×1350) and default style values.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

## Maintenance Instructions

After implementing any significant change (new feature, major bug fix, workflow change), update this file to reflect the new state of the app. Keep architecture descriptions, dimensions, and feature lists accurate. This prevents future sessions from repeating fixed bugs or misunderstanding the current design.

## Changelog

### 2026-03-09
- **Aspect ratio changed to 4:5**: `CANVAS_HEIGHT` changed from 1920 → 1350 (`src/constants/defaults.ts`). All canvas rendering and exports now produce 1080×1350 images. Copy updated in `UploadLanding.tsx` and `layout.tsx`.
- **Upload page file list**: `UploadLanding.tsx` now shows uploaded filenames with an × remove button per image (calls `removeSlide` from the Zustand store). Previously only showed a count.
