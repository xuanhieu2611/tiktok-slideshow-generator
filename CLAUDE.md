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
- `auth/tiktok/callback` — exchanges code for token, stores session in Supabase DB
- `auth/status` — returns `{ connected, username }`
- `auth/disconnect` — clears session from Supabase DB
- `upload/slides` — receives PNG blobs, converts to JPEG via `sharp`, uploads to Supabase Storage, calls TikTok Content Posting API (`PULL_FROM_URL`)
- `upload/status/[publishId]` — polls TikTok publish status
- `cleanup-slides` — deletes expired slide uploads from Supabase Storage (called by Vercel Cron every 5 min)

**Libs**:
- `src/lib/supabase.ts` — `getAdminClient()` (service role singleton for DB ops), `createBrowserSupabaseClient()` (anon key browser singleton via `@supabase/ssr`)
- `src/lib/supabase-server.ts` — `createServerSupabaseClient()` (per-request SSR client using anon key + `next/headers` cookies; server-only)
- `src/lib/tiktok-session.ts` — async Supabase DB-backed session, all functions now accept `userId: string`
- `src/lib/tiktok-api.ts` — API helpers; `getValidAccessToken(userId)` now user-scoped

**Frontend**: `src/hooks/useTikTokAuth.ts`, `src/hooks/useUser.ts` (Supabase auth state + logout), `src/components/tiktok/TikTokConnectButton.tsx`, `src/components/tiktok/TikTokUploadModal.tsx`, `src/components/tiktok/TikTokAuthHandler.tsx`

**Temp images**: uploaded to Supabase Storage bucket `tiktok-slides` (public). Tracked in `slide_uploads` DB table with `delete_after` timestamp. Cron route `/api/cleanup-slides` removes expired files.

**Auth flow**: Supabase Auth (magic link). Login page at `/login`. Auth callback at `/auth/callback` (exchanges OTP code for session). All protected routes are guarded by `src/proxy.ts` (Next.js 16 proxy, formerly middleware) using `supabase.auth.getUser()`.

**Env vars** (`.env.local`): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI` (→ `/api/auth/tiktok/callback`), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.

**Supabase setup** (manual in dashboard):
- Storage bucket `tiktok-slides` — public
- Table `tiktok_sessions` (user_id UUID PK (FK → auth.users), access_token, refresh_token, expires_at BIGINT, refresh_expires_at BIGINT, open_id, username, updated_at) with RLS enabled (service role bypasses)
- Table `slide_uploads` (filename TEXT PK, delete_after TIMESTAMPTZ, user_id UUID)
- Supabase Auth enabled (magic link / OTP)

### Key Types (`src/types/index.ts`)

`Slide` is a union of `ImageSlide` and `CtaSlide`. Each slide carries its own `TextStyle` (font, color, position, overlay, shadow). `src/constants/defaults.ts` defines canvas dimensions (1080×1350) and default style values.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

## Maintenance Instructions

After implementing any significant change (new feature, major bug fix, workflow change), update this file to reflect the new state of the app. Keep architecture descriptions, dimensions, and feature lists accurate. This prevents future sessions from repeating fixed bugs or misunderstanding the current design.

## Changelog

### 2026-03-14 (session 7)
- **TikTok expired token detection**: `auth/status` route now uses `TIKTOK_GET_USER_BASIC_INFO` as a token validator — returns `{ connected: false }` if the call fails or returns `!successful` (instead of silently returning `connected: true`). `useTikTokAuth` hook wraps `refresh` in `useCallback` and polls every 5 minutes via `setInterval` so expiry is detected proactively. `TikTokUploadModal` gains a `session_expired` upload state: detects 401 / "not connected" errors from `/api/upload/slides`, cleans up any already-uploaded files, and shows a yellow warning screen with a "Reconnect TikTok" button (calls `onClose` + `onReconnect`). `editor/page.tsx` passes `connect` as `onReconnect` to the modal.

### 2026-03-10 (session 4)
- **Multi-user auth migration**: Added Supabase Auth (magic link). New `src/proxy.ts` (Next.js 16 proxy replacing deprecated middleware) protects `/editor` and `/api/*` routes. New `src/app/login/page.tsx` (magic link form), `src/app/auth/callback/route.ts` (OTP code exchange), `src/hooks/useUser.ts`. Split `supabase.ts` into `supabase.ts` (browser-safe: `getAdminClient`, `createBrowserSupabaseClient`) and `supabase-server.ts` (server-only: `createServerSupabaseClient` using `next/headers`). All `tiktok-session.ts` functions now accept `userId: string`; `tiktok_sessions` table PK changed from `id='singleton'` to `user_id UUID`. All API routes get user via `createServerSupabaseClient().auth.getUser()` and pass `user.id` to session functions. TikTok OAuth stores `tiktok_oauth_state` + `tiktok_oauth_user_id` in httpOnly cookies. Cleanup cron protected by `CRON_SECRET` bearer token. Editor header shows user email + sign out button. New dep: `@supabase/ssr`.

### 2026-03-09 (session 3)
- **Supabase integration**: Replaced in-memory session storage with Supabase PostgreSQL (`tiktok_sessions` table) and replaced local `uploads/` filesystem + ngrok with Supabase Storage (`tiktok-slides` bucket). All session functions are now async. Added `src/lib/supabase.ts` (lazy singleton), `src/app/api/cleanup-slides/route.ts` (cron cleanup), and `vercel.json` (cron schedule). Deleted `src/app/api/uploads/[filename]/route.ts`. Removed `PUBLIC_BASE_URL` env var dependency. New deps: `@supabase/supabase-js`.

### 2026-03-09 (session 2)
- **TikTok Upload feature**: Added full TikTok OAuth + photo post upload pipeline. See TikTok Integration section above. New deps: `sharp`, `uuid`. Requires `.env.local`.

### 2026-03-09
- **Aspect ratio changed to 4:5**: `CANVAS_HEIGHT` changed from 1920 → 1350 (`src/constants/defaults.ts`). All canvas rendering and exports now produce 1080×1350 images. Copy updated in `UploadLanding.tsx` and `layout.tsx`.
- **Upload page file list**: `UploadLanding.tsx` now shows uploaded filenames with an × remove button per image (calls `removeSlide` from the Zustand store). Previously only showed a count.
- **Bulk Edit Text modal**: `src/components/bulk-edit/BulkEditModal.tsx` added. "Bulk Edit Text" button in editor header opens it. Store gains `bulkUpdateSlideText` action for atomic multi-slide text updates.
