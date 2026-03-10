import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { getSession } from '@/lib/tiktok-session'
import { getValidAccessToken, initPhotoPost } from '@/lib/tiktok-api'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }
}

function scheduleCleanup(filePaths: string[], delayMs = 5 * 60 * 1000) {
  setTimeout(async () => {
    for (const fp of filePaths) {
      try {
        await unlink(fp)
      } catch {
        // ignore if already deleted
      }
    }
  }, delayMs)
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not connected to TikTok' }, { status: 401 })
  }

  await ensureUploadsDir()

  const formData = await req.formData()
  const title = (formData.get('title') as string) || ''
  const description = (formData.get('description') as string) || ''

  const slideEntries = [...formData.entries()].filter(([key]) => key.startsWith('slide'))
  if (slideEntries.length === 0) {
    return NextResponse.json({ error: 'No slides provided' }, { status: 400 })
  }
  if (slideEntries.length > 35) {
    return NextResponse.json({ error: 'Maximum 35 slides allowed' }, { status: 400 })
  }

  const savedFiles: string[] = []
  const publicUrls: string[] = []
  const publicBase = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

  try {
    for (const [, value] of slideEntries) {
      const file = value as File
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const filename = `${uuidv4()}.jpg`
      const filePath = path.join(UPLOADS_DIR, filename)

      // Convert PNG → JPEG
      await sharp(buffer).jpeg({ quality: 90 }).toFile(filePath)

      savedFiles.push(filePath)
      publicUrls.push(`${publicBase}/api/uploads/${filename}`)
    }

    const accessToken = await getValidAccessToken()
    const publishId = await initPhotoPost(accessToken, publicUrls, title, description)

    // Clean up after 5 minutes (TikTok needs time to pull)
    scheduleCleanup(savedFiles)

    return NextResponse.json({ publishId })
  } catch (err) {
    // Clean up on error
    scheduleCleanup(savedFiles, 0)

    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
