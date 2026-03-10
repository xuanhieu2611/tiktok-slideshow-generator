# Feature: Upload Slides to TikTok as Draft

## Context

I have an existing TikTok Slideshow Maker app built with Vite + React + TypeScript + Tailwind. It lets users upload images, add text overlays, and export finished slides as PNGs. I now want to add the ability to upload the finished slides directly to TikTok as a draft (not publish — the user will publish manually from the TikTok app).

This requires adding a backend server and integrating with TikTok's Content Posting API.

---

## Prerequisites (I will handle these manually before running the app)

1. Register a developer app at https://developers.tiktok.com/
2. Add the "Content Posting API" product to my app
3. Get approval for the `video.upload` scope (this is the scope needed for draft/upload mode)
4. Set up a redirect URI for OAuth (e.g., `http://localhost:3001/auth/tiktok/callback` for local dev)
5. Note my `client_key` and `client_secret` from the TikTok developer portal
6. Verify my domain or URL prefix in TikTok's developer portal (required for PULL_FROM_URL photo uploads — TikTok needs to pull images from a URL I own)

---

## Architecture Changes

The app currently is fully client-side. This feature requires a backend because:

- TikTok OAuth token exchange must happen server-side (client_secret cannot be exposed to the browser)
- TikTok's photo upload API (`PULL_FROM_URL`) requires images to be served from a verified URL, so the backend needs to temporarily serve the slide images
- API calls to TikTok's endpoints must be made server-side with the access token

### New Stack

- **Backend**: Node.js + Express server
- **Runs alongside the Vite dev server** in development
- In production, the Express server serves both the API routes and the built React frontend

### Project Structure

```
project-root/
├── src/                    # Existing React frontend code
│   ├── components/
│   │   ├── ...existing components...
│   │   └── TikTokUpload.tsx    # NEW: Upload to TikTok UI component
│   ├── hooks/
│   │   └── useTikTokAuth.ts    # NEW: Hook for TikTok auth state
│   ├── App.tsx
│   └── main.tsx
├── server/                 # NEW: Backend
│   ├── index.ts            # Express server entry point
│   ├── routes/
│   │   ├── auth.ts         # TikTok OAuth routes
│   │   ├── upload.ts       # Image upload + TikTok posting routes
│   │   └── status.ts       # Upload status polling route
│   └── lib/
│       └── tiktok.ts       # TikTok API helper functions
├── uploads/                # NEW: Temp directory for slide images (gitignored)
├── .env                    # NEW: Environment variables
├── .env.example            # NEW: Template
├── package.json
├── vite.config.ts          # Updated: add proxy for /api routes
└── tsconfig.server.json    # NEW: Separate TS config for server
```

---

## Environment Variables (.env)

```
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:3001/auth/tiktok/callback
SERVER_PORT=3001
# The public-facing base URL where TikTok can pull images from
# For local dev with ngrok: https://your-subdomain.ngrok-free.app
# For production: https://yourdomain.com
PUBLIC_BASE_URL=https://your-subdomain.ngrok-free.app
```

---

## Feature 1: TikTok OAuth Login

### Flow

1. User clicks "Connect TikTok" button in the app
2. Frontend redirects to: `https://www.tiktok.com/v2/auth/authorize/?client_key={CLIENT_KEY}&scope=video.upload&response_type=code&redirect_uri={REDIRECT_URI}&state={RANDOM_STATE}`
3. User authorizes the app on TikTok
4. TikTok redirects back to `/auth/tiktok/callback?code={CODE}&state={STATE}`
5. Backend exchanges the code for an access token via POST to `https://open.tiktokapis.com/v2/oauth/token/` with:
   - `client_key`
   - `client_secret`
   - `code`
   - `grant_type=authorization_code`
   - `redirect_uri`
6. Backend stores the `access_token` and `refresh_token` in an in-memory session (no database needed — this is a single-user local tool)
7. Backend redirects the user back to the frontend with a success indicator
8. Frontend shows "Connected as @username" state

### Token Management

- `access_token` expires in 24 hours
- `refresh_token` expires in 1 year
- Before making any TikTok API call, check if the access token is expired. If so, refresh it via POST to `https://open.tiktokapis.com/v2/oauth/token/` with `grant_type=refresh_token`
- Store token expiry timestamp alongside the tokens

### Backend Routes

```
GET  /auth/tiktok          → Redirects to TikTok authorization URL
GET  /auth/tiktok/callback → Handles OAuth callback, exchanges code for token
GET  /api/auth/status      → Returns { connected: true/false, username: "..." }
POST /api/auth/disconnect  → Clears stored tokens
```

---

## Feature 2: Upload Slides to TikTok as Draft

### Critical Constraint: Image Hosting

TikTok's photo posting API uses `PULL_FROM_URL` — meaning TikTok's servers fetch the images from URLs you provide. These URLs must be on a domain/URL prefix you have verified in the TikTok developer portal.

**For local development**: Use ngrok to expose the local Express server to the internet. Register the ngrok URL as a verified URL prefix in the TikTok developer portal.

**The backend must temporarily serve the slide images at public URLs** so TikTok can pull them.

### Critical Constraint: Image Format

TikTok photo posts accept **JPG, JPEG, and WEBP only. NOT PNG.** The existing app exports slides as PNGs, so the backend must convert them to JPEG before serving them to TikTok. Use the `sharp` npm package for this conversion.

### Upload Flow

1. User finishes editing all slides in the app
2. User clicks "Upload to TikTok" button
3. Frontend renders all slides to Canvas, exports them as PNG blobs (existing functionality)
4. Frontend sends the PNG blobs to the backend via `POST /api/upload/slides` as multipart form data. Also sends along:
   - `title` (optional, string) — post title
   - `description` (optional, string) — post description/caption with hashtags
5. Backend receives the PNGs, converts each to JPEG using `sharp`, and saves them to the `uploads/` directory with unique filenames
6. Backend constructs publicly-accessible URLs for each image: `{PUBLIC_BASE_URL}/uploads/{filename}.jpg`
7. Backend calls TikTok's Content Posting API:

```
POST https://open.tiktokapis.com/v2/post/publish/content/init/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "post_info": {
    "title": "user provided title",
    "description": "user provided description #hashtags"
  },
  "source_info": {
    "source": "PULL_FROM_URL",
    "photo_cover_index": 0,
    "photo_images": [
      "https://your-domain.com/uploads/slide-01.jpg",
      "https://your-domain.com/uploads/slide-02.jpg",
      "https://your-domain.com/uploads/slide-03.jpg",
      "https://your-domain.com/uploads/slide-04.jpg",
      "https://your-domain.com/uploads/slide-05.jpg",
      "https://your-domain.com/uploads/slide-06.jpg"
    ]
  },
  "post_mode": "MEDIA_UPLOAD",
  "media_type": "PHOTO"
}
```

8. Backend receives `publish_id` from TikTok's response
9. Backend returns the `publish_id` to the frontend
10. Frontend shows a success message: "Slides uploaded to TikTok! Open TikTok and check your inbox notifications to finish posting."
11. Backend cleans up the temporary image files from `uploads/` after a delay (e.g., 5 minutes — TikTok needs time to pull them)

### Upload Status Polling (Optional but nice to have)

After uploading, poll TikTok to check if they successfully pulled the images:

```
POST https://open.tiktokapis.com/v2/post/publish/status/fetch/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "publish_id": "{PUBLISH_ID}"
}
```

Response status values: `PROCESSING_UPLOAD`, `PROCESSING_DOWNLOAD`, `SEND_TO_USER_INBOX`, `PUBLISH_COMPLETE`, `FAILED`

### Backend Routes

```
POST /api/upload/slides           → Receives slide images, uploads to TikTok
GET  /api/upload/status/:publishId → Polls TikTok for upload status
GET  /uploads/:filename           → Static file serving for temp images (TikTok pulls from here)
```

---

## Feature 3: Frontend UI Components

### TikTok Connect Button

- Location: header area of the app, next to "Export All" button
- States:
  - **Not connected**: Shows "Connect TikTok" button with TikTok icon
  - **Connected**: Shows "Connected as @username" with a small "Disconnect" link
- Clicking "Connect TikTok" navigates to `/auth/tiktok` (which redirects to TikTok)
- On page load, frontend calls `GET /api/auth/status` to check connection state

### Upload to TikTok Button

- Location: next to the existing "Export All" button in the header
- Only visible/enabled when TikTok is connected AND there are slides to upload
- Clicking it opens a modal/dialog with:
  - A preview of all slides as thumbnails (reuse existing filmstrip thumbnails)
  - A "Title" text input (optional)
  - A "Description" text input / textarea for caption and hashtags (optional)
  - A note: "Your slides will be uploaded as a draft. Open TikTok and check your inbox to finish posting."
  - A note: "Important: images will be converted from PNG to JPEG for TikTok compatibility."
  - "Upload" and "Cancel" buttons
- After clicking "Upload":
  - Show a loading spinner with "Uploading to TikTok..."
  - On success: show a green checkmark with "Slides uploaded! Check your TikTok inbox to finish posting."
  - On error: show an error message with the reason
  - Optionally poll upload status and update the UI

---

## Dependencies to Add

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0",
    "dotenv": "^16.4.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/multer": "^1.4.0",
    "@types/uuid": "^9.0.0",
    "tsx": "^4.0.0",
    "concurrently": "^8.0.0"
  }
}
```

### Updated package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
    "build": "vite build",
    "start": "tsx server/index.ts",
    "dev:frontend": "vite",
    "dev:server": "tsx watch server/index.ts"
  }
}
```

---

## Vite Config Update

Add a proxy so frontend API calls go to the Express server in development:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/auth': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001'
    }
  }
})
```

---

## Important Notes / Gotchas

1. **Unaudited apps**: Until the TikTok app passes audit, all uploaded content will be restricted to private/SELF_ONLY viewing. The user can manually change visibility after publishing. This is fine for our use case — mention this in the UI.

2. **Rate limits**: TikTok limits to ~6 photo posts per minute and ~15 per day per account. Show a note about this in the upload modal.

3. **Image requirements**: Max 20MB per image. Images must be JPG, JPEG, or WEBP. Max 35 images per post. Our slides are 1080x1920 which is well within limits.

4. **ngrok for local dev**: Since TikTok needs to pull images from a public URL, local development requires ngrok or a similar tunneling tool. Add a note in the README about this setup:
   - Run `ngrok http 3001`
   - Copy the ngrok URL to `.env` as `PUBLIC_BASE_URL`
   - Add the ngrok URL as a verified URL prefix in TikTok's developer portal

5. **Cleanup**: Temporary uploaded images should be deleted after TikTok has pulled them. Use a 5-minute delay with `setTimeout` to clean up. Also clean up on server start (delete everything in `uploads/`).

6. **Error handling**: TikTok API can return various error codes. Handle at minimum:
   - `access_token_invalid` → trigger re-auth
   - `rate_limit_exceeded` → show "please wait" message
   - `picture_size_check_failed` → show image format error
   - `spam_risk_too_many_posts` → show daily limit reached message

7. **Security**: This is a local development tool, not a multi-user SaaS. Token storage in memory is fine. If deploying, tokens should be encrypted and stored properly.

---

## Summary of What to Build

1. **Express backend** (`server/`) with OAuth routes, upload routes, and static file serving
2. **TikTok OAuth flow** — connect/disconnect TikTok account
3. **Image upload pipeline** — receive PNGs from frontend → convert to JPEG with sharp → serve temporarily → call TikTok API with image URLs → clean up
4. **Frontend components** — TikTok connect button, upload modal with title/description inputs, loading/success/error states
5. **Vite proxy config** — route /api, /auth, /uploads to Express in dev mode
6. **README update** — document the TikTok developer setup, ngrok requirement, and .env configuration
