import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Tüm talepleri listele
export async function GET(request: NextRequest) {
  try {
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
    console.error('Failed to fetch inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

// POST - Yeni talep oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, subject } = body

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
        status: 'new'
      }
    })

    return NextResponse.json(inquiry, { status: 201 })
  } catch (error) {
    console.error('Failed to create inquiry:', error)
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}

// PUT - Talep güncelle (status, notes)
export async function PUT(request: NextRequest) {
  try {
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
    console.error('Failed to update inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}

// DELETE - Talep sil
export async function DELETE(request: NextRequest) {
  try {
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
    console.error('Failed to delete inquiry:', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }
}
