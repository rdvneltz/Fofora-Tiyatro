import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const videos = await prisma.heroVideo.findMany({
      orderBy: { order: 'asc' }
    })
    const response = NextResponse.json(videos)
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // If fileName is changing, delete the old file from R2
    if (fileName !== undefined) {
      const existingVideo = await prisma.heroVideo.findUnique({ where: { id } })
      if (existingVideo && existingVideo.fileName !== fileName) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        await safeDeleteR2Url(existingVideo.fileName)

      }
    }

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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Check if video exists first
    const existingVideo = await prisma.heroVideo.findUnique({
      where: { id }
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete from R2
    const { safeDeleteR2Url } = await import('@/lib/r2')
    await safeDeleteR2Url(existingVideo.fileName)

    // Delete from database
    await prisma.heroVideo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete error details:', error)
    return NextResponse.json({
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
