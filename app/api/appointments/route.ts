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
    const { name, phone, email, date, time, meetingPlatform, notes } = body

    const appointment = await prisma.appointment.create({
      data: {
        name,
        phone,
        email,
        date: new Date(date),
        time,
        meetingPlatform,
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
    const { id, status, notes } = body

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status, notes }
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
