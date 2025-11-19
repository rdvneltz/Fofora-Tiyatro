import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const about = await prisma.aboutSection.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(about)
  } catch (error) {
    return NextResponse.json({ error: 'Veri alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Önce tüm about section'ları pasif yap
    await prisma.aboutSection.updateMany({
      data: { active: false }
    })

    // Yeni about'u aktif olarak oluştur
    const about = await prisma.aboutSection.create({
      data: { ...body, active: true }
    })

    return NextResponse.json(about)
  } catch (error) {
    return NextResponse.json({ error: 'Veri oluşturulamadı' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    // Eğer active true yapılıyorsa, diğerlerini pasif yap
    if (data.active === true) {
      await prisma.aboutSection.updateMany({
        where: { id: { not: id } },
        data: { active: false }
      })
    }

    const about = await prisma.aboutSection.update({ where: { id }, data })
    return NextResponse.json(about)
  } catch (error) {
    return NextResponse.json({ error: 'Veri güncellenemedi' }, { status: 500 })
  }
}
