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
    const { fileName, order = 0, active = true } = body

    const video = await prisma.heroVideo.create({
      data: { fileName, order, active }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, fileName, order, active } = body

    const updateData: any = {}
    if (fileName) updateData.fileName = fileName
    if (order !== undefined) updateData.order = order
    if (active !== undefined) updateData.active = active

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

    await prisma.heroVideo.delete({
      where: { id }
    })

    console.log('Video deleted successfully')
    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Delete error details:', error)
    return NextResponse.json({
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
