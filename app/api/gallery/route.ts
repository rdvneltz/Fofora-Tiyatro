import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Fetch all albums with their items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')

    if (albumId) {
      // Fetch single album with items
      const album = await prisma.galleryAlbum.findUnique({
        where: { id: albumId },
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      })
      const response = NextResponse.json(album)
      response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
      return response
    }

    // Fetch all albums with items
    const albums = await prisma.galleryAlbum.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })
    const response = NextResponse.json(albums)
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Galeri verileri alınamadı' }, { status: 500 })
  }
}

// POST - Create album or item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { type } = body // 'album' or 'item'

    if (type === 'album') {
      const { title, description, coverImage, order = 0, active = true } = body
      const album = await prisma.galleryAlbum.create({
        data: { title, description, coverImage, order, active },
        include: { items: true }
      })
      return NextResponse.json(album, { status: 201 })
    }

    if (type === 'item') {
      const {
        albumId,
        itemType = 'image',
        url,
        thumbnail,
        title,
        description,
        order = 0,
        active = true
      } = body

      const item = await prisma.galleryItem.create({
        data: {
          albumId,
          type: itemType,
          url,
          thumbnail,
          title,
          description,
          order,
          active
        }
      })
      return NextResponse.json(item, { status: 201 })
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 })
  }
}

// PUT - Update album or item
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { type, id, ...data } = body

    if (type === 'album') {
      // Check if cover image changed - delete old one from R2
      if (data.coverImage !== undefined) {
        const existingAlbum = await prisma.galleryAlbum.findUnique({ where: { id } })
        if (existingAlbum?.coverImage && existingAlbum.coverImage !== data.coverImage) {
          const { safeDeleteR2Url } = await import('@/lib/r2')
          await safeDeleteR2Url(existingAlbum.coverImage)
        }
      }

      const album = await prisma.galleryAlbum.update({
        where: { id },
        data,
        include: { items: true }
      })
      return NextResponse.json(album)
    }

    if (type === 'item') {
      // Rename itemType to type for database
      const updateData: any = { ...data }
      if (updateData.itemType !== undefined) {
        updateData.type = updateData.itemType
        delete updateData.itemType
      }

      // Check if url or thumbnail changed - delete old files from R2
      const existingItem = await prisma.galleryItem.findUnique({ where: { id } })
      if (existingItem) {
        const { safeDeleteR2Url } = await import('@/lib/r2')

        // If url changed, delete old file
        if (updateData.url !== undefined && existingItem.url !== updateData.url) {
          await safeDeleteR2Url(existingItem.url)
        }

        // If thumbnail changed, delete old thumbnail
        if (updateData.thumbnail !== undefined && existingItem.thumbnail && existingItem.thumbnail !== updateData.thumbnail) {
          await safeDeleteR2Url(existingItem.thumbnail)
        }
      }

      const item = await prisma.galleryItem.update({
        where: { id },
        data: updateData
      })
      return NextResponse.json(item)
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 })
  }
}

// DELETE - Delete album or item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id || !type) {
      return NextResponse.json({ error: 'ID ve tür gerekli' }, { status: 400 })
    }

    if (type === 'album') {
      const { safeDeleteR2Url } = await import('@/lib/r2')

      // Fetch album with all items to get their URLs
      const album = await prisma.galleryAlbum.findUnique({
        where: { id },
        include: { items: true }
      })

      if (album) {
        // Delete all item files from R2
        for (const item of album.items) {
          await safeDeleteR2Url(item.url)
          if (item.thumbnail) {
            await safeDeleteR2Url(item.thumbnail)
          }
        }

        // Delete album cover image from R2
        if (album.coverImage) {
          await safeDeleteR2Url(album.coverImage)
        }
      }

      // Delete items from DB, then album
      await prisma.galleryItem.deleteMany({ where: { albumId: id } })
      await prisma.galleryAlbum.delete({ where: { id } })

      return NextResponse.json({ success: true, message: 'Albüm ve tüm içeriği silindi' })
    }

    if (type === 'item') {
      const existingItem = await prisma.galleryItem.findUnique({ where: { id } })

      if (existingItem) {
        const { safeDeleteR2Url } = await import('@/lib/r2')

        // Delete main file from R2
        await safeDeleteR2Url(existingItem.url)

        // Delete thumbnail from R2 if exists
        if (existingItem.thumbnail) {
          await safeDeleteR2Url(existingItem.thumbnail)
        }
      }

      await prisma.galleryItem.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Öğe silindi' })
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({
      error: 'Silinemedi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
