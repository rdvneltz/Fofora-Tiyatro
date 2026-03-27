import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    const response = NextResponse.json(settings)
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
    const settings = await prisma.siteSettings.create({ data: body })
    return NextResponse.json(settings)
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
    const settings = await prisma.siteSettings.update({ where: { id }, data })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Veri güncellenemedi' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    // Get first settings record or create if doesn't exist
    let settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (!settings) {
      // Create initial settings if doesn't exist
      settings = await prisma.siteSettings.create({
        data: body
      })
    } else {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: body
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {

    return NextResponse.json({
      error: 'Ayarlar güncellenemedi',
      details: error.message
    }, { status: 500 })
  }
}
