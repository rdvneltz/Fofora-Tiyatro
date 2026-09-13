import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    const session = await getServerSession(authOptions)
    const publicSettings = settings && !session
      ? (({ inquiryEmailRecipients, ...safe }) => safe)(settings)
      : settings
    const response = NextResponse.json(publicSettings)
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

    if (data.logo !== undefined || data.favicon !== undefined || data.impactImage !== undefined) {
      const existing = await prisma.siteSettings.findUnique({ where: { id } })
      if (existing) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        if (data.logo !== undefined && existing.logo && existing.logo !== data.logo) {
          await safeDeleteR2Url(existing.logo)
        }
        if (data.favicon !== undefined && existing.favicon && existing.favicon !== data.favicon) {
          await safeDeleteR2Url(existing.favicon)
        }
        if (data.impactImage !== undefined && existing.impactImage && existing.impactImage !== data.impactImage) {
          await safeDeleteR2Url(existing.impactImage)
        }
      }
    }

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
      // Check if logo/favicon/impactImage changed - delete old files from R2
      if (body.logo !== undefined || body.favicon !== undefined || body.impactImage !== undefined) {
        const { safeDeleteR2Url } = await import('@/lib/r2')
        if (body.logo !== undefined && settings.logo && settings.logo !== body.logo) {
          await safeDeleteR2Url(settings.logo)
        }
        if (body.favicon !== undefined && settings.favicon && settings.favicon !== body.favicon) {
          await safeDeleteR2Url(settings.favicon)
        }
        if (body.impactImage !== undefined && settings.impactImage && settings.impactImage !== body.impactImage) {
          await safeDeleteR2Url(settings.impactImage)
        }
      }

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
