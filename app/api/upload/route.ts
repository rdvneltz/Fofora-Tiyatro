import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size limit (100MB for videos, 10MB for images)
    const isVideo = fileType === 'video' || file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB or 10MB
    const maxSizeMB = isVideo ? 100 : 10

    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Maximum size is ${maxSizeMB}MB for ${isVideo ? 'videos' : 'images'}.`,
        details: `Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine target directory based on file type
    const targetDir = isVideo ? 'videos' : 'uploads'

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`
    const r2Key = `${targetDir}/${filename}` // e.g., "videos/123456-video.mp4"

    // Upload to Cloudflare R2
    const publicUrl = await uploadToR2(buffer, r2Key, file.type)

    // Return the public URL
    return NextResponse.json({ url: publicUrl, filename, success: true })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
