import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('File buffer created, size:', buffer.length)

    // Determine target directory based on file type
    const isVideo = fileType === 'video' || file.type.startsWith('video/')
    const targetDir = isVideo ? 'videos' : 'uploads'

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/\s/g, '-')}`
    const filepath = path.join(process.cwd(), 'public', targetDir, filename)

    console.log('Writing file to:', filepath)

    // Write file to appropriate directory
    await writeFile(filepath, buffer)
    console.log('File written successfully')

    // Return the URL
    const url = `/${targetDir}/${filename}`
    return NextResponse.json({ url, filename, success: true })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
