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

    const team = await prisma.teamMember.findMany({
      where: admin ? {} : { active: true },
      orderBy: { order: 'asc' },
    })
    const response = NextResponse.json(team)
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
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
    const member = await prisma.teamMember.create({
      data: body,
    })
    return NextResponse.json(member)
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

    // Check if image changed - delete old one from R2
    if (data.image !== undefined) {
      const existing = await prisma.teamMember.findUnique({ where: { id } })
      if (existing?.image && existing.image !== data.image) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        await safeDeleteR2Url(existing.image)
      }
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data,
    })
    return NextResponse.json(member)
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

    const existing = await prisma.teamMember.findUnique({ where: { id } })
    if (existing?.image) {
      const { safeDeleteR2Url } = await import('@/lib/r2')
      await safeDeleteR2Url(existing.image)
    }

    await prisma.teamMember.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Veri silinemedi' }, { status: 500 })
  }
}
