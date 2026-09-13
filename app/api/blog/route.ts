import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === 'true'
    if (admin) {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.blogPost.findMany({
      where: admin ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
    })
    const response = NextResponse.json(posts)
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Veri alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    const post = await prisma.blogPost.create({ data: body })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Veri oluşturulamadı' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...data } = body

    // Check if image or videoUrl changed - delete old files from R2
    if (data.image !== undefined || data.videoUrl !== undefined) {
      const existing = await prisma.blogPost.findUnique({ where: { id } })
      if (existing) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        if (data.image !== undefined && existing.image && existing.image !== data.image) {
          await safeDeleteR2Url(existing.image)
        }
        if (data.videoUrl !== undefined && existing.videoUrl && existing.videoUrl !== data.videoUrl) {
          await safeDeleteR2Url(existing.videoUrl)
        }
      }
    }

    const post = await prisma.blogPost.update({ where: { id }, data })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Veri güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (existing) {
      const { safeDeleteR2Url } = await import('@/lib/r2')
      if (existing.image) await safeDeleteR2Url(existing.image)
      if (existing.videoUrl) await safeDeleteR2Url(existing.videoUrl)
    }

    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Veri silinemedi' }, { status: 500 })
  }
}
