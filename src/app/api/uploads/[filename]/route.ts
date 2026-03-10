import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const filePath = path.join(UPLOADS_DIR, filename)
  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buffer = await readFile(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  })
}
