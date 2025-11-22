import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all Instagram posts
export async function GET() {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Instagram posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 })
  }
}

// POST - Create new Instagram post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postUrl, order, active } = body

    if (!postUrl) {
      return NextResponse.json({ error: 'Post URL is required' }, { status: 400 })
    }

    const post = await prisma.instagramPost.create({
      data: {
        postUrl,
        order: order || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Instagram post creation error:', error)
    return NextResponse.json({ error: 'Failed to create Instagram post' }, { status: 500 })
  }
}

// PUT - Update Instagram post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, postUrl, order, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (postUrl !== undefined) updateData.postUrl = postUrl
    if (order !== undefined) updateData.order = order
    if (active !== undefined) updateData.active = active

    const post = await prisma.instagramPost.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Instagram post update error:', error)
    return NextResponse.json({ error: 'Failed to update Instagram post' }, { status: 500 })
  }
}

// DELETE - Delete Instagram post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    await prisma.instagramPost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instagram post deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete Instagram post' }, { status: 500 })
  }
}
