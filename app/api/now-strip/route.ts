import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Record already gone (e.g. a duplicate click deleted it a moment earlier) - treat as success, not a server error
function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

// GET - Fetch all strip blocks with their items
export async function GET() {
  try {
    const blocks = await prisma.nowStripBlock.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json(blocks)
  } catch (error) {
    return NextResponse.json({ error: 'Şerit verileri alınamadı' }, { status: 500 })
  }
}

// POST - Create block or item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { type } = body // 'block' or 'item'

    if (type === 'block') {
      const { blockType = 'items', heading, order = 0, active = true, durationSeconds = 8, marqueeSpeed = 28 } = body
      const block = await prisma.nowStripBlock.create({
        data: { type: blockType, heading, order, active, durationSeconds, marqueeSpeed },
        include: { items: true }
      })
      return NextResponse.json(block, { status: 201 })
    }

    if (type === 'item') {
      const {
        blockId, label, text, order = 0, active = true,
        clickAction = 'none', linkUrl, sectionId,
        modalMediaType, modalMediaUrl, modalTitle, modalBody, ctaLabel
      } = body
      if (!blockId || !text) return NextResponse.json({ error: 'blockId ve text gerekli' }, { status: 400 })
      const item = await prisma.nowStripItem.create({
        data: { blockId, label, text, order, active, clickAction, linkUrl, sectionId, modalMediaType, modalMediaUrl, modalTitle, modalBody, ctaLabel }
      })
      return NextResponse.json(item, { status: 201 })
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 })
  }
}

// PUT - Update block or item
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { type, id, ...data } = body
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })

    if (type === 'block') {
      const updateData: any = { ...data }
      if (updateData.blockType !== undefined) {
        updateData.type = updateData.blockType
        delete updateData.blockType
      }
      const block = await prisma.nowStripBlock.update({
        where: { id },
        data: updateData,
        include: { items: { orderBy: { order: 'asc' } } }
      })
      return NextResponse.json(block)
    }

    if (type === 'item') {
      // If modal media changed to a new/removed R2 URL, clean up the old file
      if (data.modalMediaUrl !== undefined) {
        const existing = await prisma.nowStripItem.findUnique({ where: { id } })
        if (existing?.modalMediaUrl && existing.modalMediaUrl !== data.modalMediaUrl) {
          const { safeDeleteR2Url } = await import('@/lib/r2')
          await safeDeleteR2Url(existing.modalMediaUrl)
        }
      }
      const item = await prisma.nowStripItem.update({ where: { id }, data })
      return NextResponse.json(item)
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    if (isRecordNotFound(error)) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 })
  }
}

// DELETE - Delete block (and its items) or a single item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    if (!id || !type) return NextResponse.json({ error: 'ID ve tür gerekli' }, { status: 400 })

    const { safeDeleteR2Url } = await import('@/lib/r2')

    if (type === 'block') {
      const block = await prisma.nowStripBlock.findUnique({ where: { id }, include: { items: true } })
      if (block) {
        for (const item of block.items) {
          if (item.modalMediaUrl) await safeDeleteR2Url(item.modalMediaUrl)
        }
      }
      await prisma.nowStripItem.deleteMany({ where: { blockId: id } })
      await prisma.nowStripBlock.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Blok ve tüm içeriği silindi' })
    }

    if (type === 'item') {
      const existing = await prisma.nowStripItem.findUnique({ where: { id } })
      if (existing?.modalMediaUrl) await safeDeleteR2Url(existing.modalMediaUrl)
      await prisma.nowStripItem.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Öğe silindi' })
    }

    return NextResponse.json({ error: 'Geçersiz tür' }, { status: 400 })
  } catch (error) {
    if (isRecordNotFound(error)) return NextResponse.json({ success: true, message: 'Zaten silinmiş' })
    return NextResponse.json({
      error: 'Silinemedi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
