import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const adminView = searchParams.get('admin') === 'true'

    let slots
    if (dateParam) {
      // Get slots for specific date
      const where: any = { date: new Date(dateParam) }
      if (!adminView) {
        where.active = true
        where.isBooked = false
      }

      slots = await prisma.availableSlot.findMany({
        where,
        orderBy: { startTime: 'asc' }
      })
    } else {
      // Get all slots
      const where: any = {}
      if (!adminView) {
        where.active = true
        where.isBooked = false
        where.date = { gte: new Date() } // Only future dates
      }

      slots = await prisma.availableSlot.findMany({
        where,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
      })
    }

    return NextResponse.json(slots)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, startTime, endTime, active = true } = body

    const slot = await prisma.availableSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        active,
        isBooked: false
      }
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, active, isBooked, date, startTime, endTime } = body

    const updateData: any = {}
    if (active !== undefined) updateData.active = active
    if (isBooked !== undefined) updateData.isBooked = isBooked
    if (date) updateData.date = new Date(date)
    if (startTime) updateData.startTime = startTime
    if (endTime) updateData.endTime = endTime

    const slot = await prisma.availableSlot.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(slot)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.availableSlot.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
