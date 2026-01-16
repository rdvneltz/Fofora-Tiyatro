import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const videos = await prisma.heroVideo.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(videos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fileName,
      order = 0,
      active = true,
      title,
      subtitle,
      description,
      useCustomContent = false,
      playDuration,
      playCount = 1,
      featured = false,
      featuredWeight = 3
    } = body

    const video = await prisma.heroVideo.create({
      data: {
        fileName,
        order,
        active,
        title,
        subtitle,
        description,
        useCustomContent,
        playDuration,
        playCount,
        featured,
        featuredWeight
      }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      fileName,
      order,
      active,
      title,
      subtitle,
      description,
      useCustomContent,
      playDuration,
      playCount,
      featured,
      featuredWeight
    } = body

    const updateData: any = {}
    if (fileName !== undefined) updateData.fileName = fileName
    if (order !== undefined) updateData.order = order
    if (active !== undefined) updateData.active = active
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (useCustomContent !== undefined) updateData.useCustomContent = useCustomContent
    if (playDuration !== undefined) updateData.playDuration = playDuration
    if (playCount !== undefined) updateData.playCount = playCount
    if (featured !== undefined) updateData.featured = featured
    if (featuredWeight !== undefined) updateData.featuredWeight = featuredWeight

    const video = await prisma.heroVideo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(video)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('DELETE request received for video ID:', id)

    if (!id) {
      console.error('No ID provided in delete request')
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Check if video exists first
    const existingVideo = await prisma.heroVideo.findUnique({
      where: { id }
    })

    if (!existingVideo) {
      console.error('Video not found with ID:', id)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    console.log('Deleting video:', existingVideo)

    // Delete from R2 if it's an R2 URL
    const { deleteFromR2, extractFileNameFromR2Url, isR2Url } = await import('@/lib/r2')

    if (isR2Url(existingVideo.fileName)) {
      const r2Key = extractFileNameFromR2Url(existingVideo.fileName)
      if (r2Key) {
        console.log('Deleting file from R2:', r2Key)
        try {
          await deleteFromR2(r2Key)
          console.log('✅ File deleted from R2')
        } catch (r2Error) {
          console.error('⚠️ Failed to delete from R2 (continuing anyway):', r2Error)
          // Continue with database deletion even if R2 deletion fails
        }
      }
    }

    // Delete from database
    await prisma.heroVideo.delete({
      where: { id }
    })

    console.log('Video deleted successfully from database')
    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete error details:', error)
    return NextResponse.json({
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
