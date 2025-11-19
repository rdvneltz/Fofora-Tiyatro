import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.heroVideo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
