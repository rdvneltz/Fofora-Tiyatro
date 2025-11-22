import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'image' or 'video'

    console.log('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      fileType: fileType
    })

    if (!file) {
      console.error('No file provided in upload request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size limit (100MB for videos, 10MB for images)
    const isVideo = fileType === 'video' || file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB or 10MB
    const maxSizeMB = isVideo ? 100 : 10

    if (file.size > maxSize) {
      console.error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxSizeMB}MB`)
      return NextResponse.json({
        error: `File too large. Maximum size is ${maxSizeMB}MB for ${isVideo ? 'videos' : 'images'}.`,
        details: `Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('File buffer created, size:', buffer.length)

    // Determine target directory based on file type
    const targetDir = isVideo ? 'videos' : 'uploads'

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`
    const r2Key = `${targetDir}/${filename}` // e.g., "videos/123456-video.mp4"

    console.log('Uploading to R2:', r2Key)

    // Upload to Cloudflare R2
    const publicUrl = await uploadToR2(buffer, r2Key, file.type)
    console.log('File uploaded successfully to R2:', publicUrl)

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
