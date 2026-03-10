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

**TikTok Slideshow Maker** — Next.js app with client-side editor and server-side API routes for TikTok integration.

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

Header: "Bulk Edit Text" button opens `BulkEditModal.tsx`. "Connect TikTok" / "Upload to TikTok" buttons appear when TikTok auth is configured.

Bottom bar: `GlobalSettingsBar.tsx` applies style defaults to all slides.

### TikTok Integration

**Backend API routes** (`src/app/api/`):
- `auth/tiktok` — redirects to TikTok OAuth
- `auth/tiktok/callback` — exchanges code for token, stores in memory
- `auth/status` — returns `{ connected, username }`
- `auth/disconnect` — clears session
- `upload/slides` — receives PNG blobs, converts to JPEG via `sharp`, calls TikTok Content Posting API (`PULL_FROM_URL`)
- `upload/status/[publishId]` — polls TikTok publish status
- `uploads/[filename]` — serves temp JPEG files for TikTok to pull

**Libs**: `src/lib/tiktok-session.ts` (in-memory singleton), `src/lib/tiktok-api.ts` (API helpers)

**Frontend**: `src/hooks/useTikTokAuth.ts`, `src/components/tiktok/TikTokConnectButton.tsx`, `src/components/tiktok/TikTokUploadModal.tsx`, `src/components/tiktok/TikTokAuthHandler.tsx`

**Temp images**: stored in `uploads/` at project root (gitignored), cleaned up 5 min after upload.

**Env vars** (`.env.local`): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI` (→ `/api/auth/tiktok/callback`), `PUBLIC_BASE_URL` (ngrok URL for local dev so TikTok can pull images).

### Key Types (`src/types/index.ts`)

`Slide` is a union of `ImageSlide` and `CtaSlide`. Each slide carries its own `TextStyle` (font, color, position, overlay, shadow). `src/constants/defaults.ts` defines canvas dimensions (1080×1350) and default style values.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

## Maintenance Instructions

After implementing any significant change (new feature, major bug fix, workflow change), update this file to reflect the new state of the app. Keep architecture descriptions, dimensions, and feature lists accurate. This prevents future sessions from repeating fixed bugs or misunderstanding the current design.

## Changelog

### 2026-03-09 (session 2)
- **TikTok Upload feature**: Added full TikTok OAuth + photo post upload pipeline. See TikTok Integration section above. New deps: `sharp`, `uuid`. Requires `.env.local` and ngrok for local dev.

### 2026-03-09
- **Aspect ratio changed to 4:5**: `CANVAS_HEIGHT` changed from 1920 → 1350 (`src/constants/defaults.ts`). All canvas rendering and exports now produce 1080×1350 images. Copy updated in `UploadLanding.tsx` and `layout.tsx`.
- **Upload page file list**: `UploadLanding.tsx` now shows uploaded filenames with an × remove button per image (calls `removeSlide` from the Zustand store). Previously only showed a count.
- **Bulk Edit Text modal**: `src/components/bulk-edit/BulkEditModal.tsx` added. "Bulk Edit Text" button in editor header opens it. Store gains `bulkUpdateSlideText` action for atomic multi-slide text updates.
