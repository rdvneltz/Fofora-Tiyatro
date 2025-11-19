import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      where: { active: true },
      orderBy: { updatedAt: 'desc' } // En son güncellenen aktif hero'yu getir
    })
    return NextResponse.json(hero)
  } catch (error) {
    return NextResponse.json({ error: 'Veri alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Önce tüm hero'ları pasif yap
    await prisma.heroSection.updateMany({
      data: { active: false }
    })

    // Yeni hero'yu aktif olarak oluştur
    const hero = await prisma.heroSection.create({
      data: { ...body, active: true },
    })

    return NextResponse.json(hero)
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
      await prisma.heroSection.updateMany({
        where: { id: { not: id } },
        data: { active: false }
      })
    }

    const hero = await prisma.heroSection.update({
      where: { id },
      data,
    })

    return NextResponse.json(hero)
  } catch (error) {
    return NextResponse.json({ error: 'Veri güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }
    await prisma.heroSection.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Veri silinemedi' }, { status: 500 })
  }
}
