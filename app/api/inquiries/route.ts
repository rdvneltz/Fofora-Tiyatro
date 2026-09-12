import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Tüm talepleri listele (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(inquiries)
  } catch (error) {

    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

// POST - Yeni talep oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, subject, message } = body

    if (!name || !phone || !subject) {
      return NextResponse.json(
        { error: 'Ad, telefon ve konu alanları zorunludur' },
        { status: 400 }
      )
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        subject,
        message: message || null,
        status: 'new'
      }
    })

    // Mesaj her durumda önce inbox'a kaydedilir; e-posta bildirimi başarısız olsa da kaybolmaz.
    try {
      const settings = await prisma.siteSettings.findFirst()
      if (settings?.inquiryEmailEnabled && settings.inquiryEmailRecipients.length) {
        const { sendInquiryEmail } = await import('@/lib/inquiry-email')
        const delivered = await sendInquiryEmail(inquiry, settings.inquiryEmailRecipients)
        if (delivered) await prisma.inquiry.update({ where: { id: inquiry.id }, data: { emailNotificationSent: true } })
      }
    } catch (mailError) {
      console.error('Inquiry email notification failed', mailError)
    }

    return NextResponse.json(inquiry, { status: 201 })
  } catch (error) {

    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}

// PUT - Talep güncelle (status, notes) - admin only
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, status, adminNotes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === 'replied') {
        updateData.repliedAt = new Date()
      }
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(inquiry)
  } catch (error) {

    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}

// DELETE - Talep sil - admin only
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.inquiry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {

    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }
}
