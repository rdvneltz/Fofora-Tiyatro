import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateApprovalMessage,
  generateCancellationMessage,
  generateRescheduleMessage,
  generateReminderMessage,
  sendWhatsAppNotification
} from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { type } = body // 'approval', 'cancellation', 'reschedule', 'reminder'

    console.log(`Sending ${type} notification for appointment ${id}`)

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      )
    }

    // Generate message based on type
    let message = ''
    let updateData: any = {}

    switch (type) {
      case 'approval':
        message = generateApprovalMessage({
          name: appointment.name,
          phone: appointment.phone,
          date: appointment.date,
          time: appointment.time,
          meetingPlatform: appointment.meetingPlatform,
          meetingLink: appointment.meetingLink || undefined,
          status: appointment.status
        })
        updateData.notificationSent = true
        break

      case 'cancellation':
        message = generateCancellationMessage({
          name: appointment.name,
          phone: appointment.phone,
          date: appointment.date,
          time: appointment.time,
          meetingPlatform: appointment.meetingPlatform,
          status: appointment.status
        })
        updateData.notificationSent = true
        break

      case 'reschedule':
        if (!appointment.previousDate || !appointment.previousTime) {
          return NextResponse.json(
            { error: 'Önceki randevu bilgisi bulunamadı' },
            { status: 400 }
          )
        }
        message = generateRescheduleMessage(
          {
            name: appointment.name,
            phone: appointment.phone,
            date: appointment.date,
            time: appointment.time,
            meetingPlatform: appointment.meetingPlatform,
            status: appointment.status
          },
          appointment.previousDate,
          appointment.previousTime
        )
        updateData.notificationSent = true
        break

      case 'reminder':
        message = generateReminderMessage({
          name: appointment.name,
          phone: appointment.phone,
          date: appointment.date,
          time: appointment.time,
          meetingPlatform: appointment.meetingPlatform,
          meetingLink: appointment.meetingLink || undefined,
          status: appointment.status
        })
        updateData.reminderSent = true
        break

      default:
        return NextResponse.json(
          { error: 'Geçersiz bildirim tipi' },
          { status: 400 }
        )
    }

    // Send WhatsApp notification
    const result = await sendWhatsAppNotification(appointment.phone, message)

    // Update appointment notification status
    await prisma.appointment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: result.success,
      whatsappLink: result.link,
      message: 'WhatsApp linki oluşturuldu. Lütfen tıklayarak mesajı gönderin.',
      notification: {
        type,
        recipient: appointment.name,
        phone: appointment.phone
      }
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      {
        error: 'Bildirim gönderilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
