import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Record already gone (e.g. a duplicate click deleted it a moment earlier) - treat as success, not a server error
function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

// GET - Fetch all Instagram posts
export async function GET() {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 })
  }
}

// POST - Create new Instagram post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { postUrl, mediaUrl, mediaType, caption, order, active } = body

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
    }

    const post = await prisma.instagramPost.create({
      data: {
        postUrl: postUrl || null,
        mediaUrl,
        mediaType: mediaType || null,
        caption: caption || null,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Instagram post' }, { status: 500 })
  }
}

// PUT - Update Instagram post
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, postUrl, mediaUrl, mediaType, caption, order, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Check if media changed - delete old one from R2
    if (mediaUrl !== undefined) {
      const existing = await prisma.instagramPost.findUnique({ where: { id } })
      if (existing?.mediaUrl && existing.mediaUrl !== mediaUrl) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        await safeDeleteR2Url(existing.mediaUrl)
      }
    }

    const updateData: any = {}
    if (postUrl !== undefined) updateData.postUrl = postUrl
    if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl
    if (mediaType !== undefined) updateData.mediaType = mediaType
    if (caption !== undefined) updateData.caption = caption
    if (order !== undefined) updateData.order = order
    if (active !== undefined) updateData.active = active

    const post = await prisma.instagramPost.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(post)
  } catch (error) {
    if (isRecordNotFound(error)) {
      return NextResponse.json({ error: 'Post already removed' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update Instagram post' }, { status: 500 })
  }
}

// DELETE - Delete Instagram post
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const existing = await prisma.instagramPost.findUnique({ where: { id } })
    if (!existing) {
      // Already gone (e.g. a duplicate click) - deleting it is already done
      return NextResponse.json({ success: true })
    }
    if (existing.mediaUrl) {
      const { safeDeleteR2Url } = await import('@/lib/r2')
      await safeDeleteR2Url(existing.mediaUrl)
    }

    await prisma.instagramPost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isRecordNotFound(error)) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Failed to delete Instagram post' }, { status: 500 })
  }
}
