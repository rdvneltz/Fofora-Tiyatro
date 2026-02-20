import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(album)
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
    return NextResponse.json(albums)
  } catch (error) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json({ error: 'Galeri verileri alınamadı' }, { status: 500 })
  }
}

// POST - Create album or item
export async function POST(request: NextRequest) {
  try {
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
    console.error('Gallery create error:', error)
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 })
  }
}

// PUT - Update album or item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    if (type === 'album') {
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
      const item = await prisma.galleryItem.update({
        where: { id },
        data: updateData
      })
      return NextResponse.json(item)
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    console.error('Gallery update error:', error)
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 })
  }
}

// DELETE - Delete album or item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id || !type) {
      return NextResponse.json({ error: 'ID ve tür gerekli' }, { status: 400 })
    }

    if (type === 'album') {
      // Delete all items in the album first (cascade should handle, but explicit)
      await prisma.galleryItem.deleteMany({ where: { albumId: id } })
      await prisma.galleryAlbum.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Albüm silindi' })
    }

    if (type === 'item') {
      // Try to delete from R2 if applicable
      const existingItem = await prisma.galleryItem.findUnique({ where: { id } })
      if (existingItem) {
        const { deleteFromR2, extractFileNameFromR2Url, isR2Url } = await import('@/lib/r2')
        if (isR2Url(existingItem.url)) {
          const r2Key = extractFileNameFromR2Url(existingItem.url)
          if (r2Key) {
            try { await deleteFromR2(r2Key) } catch (e) { /* continue */ }
          }
        }
        if (existingItem.thumbnail && isR2Url(existingItem.thumbnail)) {
          const r2Key = extractFileNameFromR2Url(existingItem.thumbnail)
          if (r2Key) {
            try { await deleteFromR2(r2Key) } catch (e) { /* continue */ }
          }
        }
      }

      await prisma.galleryItem.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Öğe silindi' })
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 })
  }
}
