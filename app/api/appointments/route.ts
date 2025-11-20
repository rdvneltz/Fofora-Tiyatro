import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(appointments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, date, time, meetingPlatform, consultationType, preferredLawyer, description, notes } = body

    const appointment = await prisma.appointment.create({
      data: {
        name,
        phone,
        email,
        date: new Date(date),
        time,
        meetingPlatform,
        consultationType,
        preferredLawyer: preferredLawyer || null,
        description,
        notes,
        status: 'pending'
      }
    })

    // Mark slot as booked if exists
    await prisma.availableSlot.updateMany({
      where: {
        date: new Date(date),
        startTime: time,
        isBooked: false
      },
      data: { isBooked: true }
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, meetingLink, date, time, previousDate, previousTime } = body

    // Get current appointment to check platform
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink
    if (date !== undefined) updateData.date = new Date(date)
    if (time !== undefined) updateData.time = time
    if (previousDate !== undefined) updateData.previousDate = previousDate ? new Date(previousDate) : null
    if (previousTime !== undefined) updateData.previousTime = previousTime

    // Auto-generate meeting link for "site" platform when approved
    if (status === 'approved' && currentAppointment.meetingPlatform === 'site' && !meetingLink) {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://murekkephukuk.vercel.app'
      updateData.meetingLink = `${baseUrl}/call/${id}`
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
