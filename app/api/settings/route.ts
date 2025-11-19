import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Veri alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const settings = await prisma.siteSettings.create({ data: body })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Veri oluşturulamadı' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const settings = await prisma.siteSettings.update({ where: { id }, data })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Veri güncellenemedi' }, { status: 500 })
  }
}
