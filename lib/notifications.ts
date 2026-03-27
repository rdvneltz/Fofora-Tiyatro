// WhatsApp notification helper functions

interface AppointmentDetails {
  name: string
  phone: string
  date: Date
  time: string
  meetingPlatform: string
  meetingLink?: string
  status: string
}

/**
 * Format Turkish phone number for WhatsApp API
 * Converts formats like: 0555 555 55 55, +90 555 555 55 55 -> 905555555555
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Remove leading 0 if exists
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  // Add country code if not present
  if (!cleaned.startsWith('90')) {
    cleaned = '90' + cleaned
  }

  return cleaned
}

/**
 * Generate WhatsApp Web link with pre-filled message
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

/**
 * Generate approval notification message
 */
export function generateApprovalMessage(appointment: AppointmentDetails): string {
  const dateStr = new Date(appointment.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let platformText = ''
  switch (appointment.meetingPlatform) {
    case 'zoom':
      platformText = `📹 Zoom üzerinden\n🔗 Link: ${appointment.meetingLink || 'Yakında gönderilecek'}`
      break
    case 'telegram':
      platformText = `📱 Telegram üzerinden\n👤 Kullanıcı: ${appointment.meetingLink || 'Yakında gönderilecek'}`
      break
    case 'site':
      platformText = `💻 Web sitesi üzerinden\n🔗 Link: ${appointment.meetingLink || 'Yakında gönderilecek'}`
      break
    case 'whatsapp':
      platformText = `📞 WhatsApp sesli/görüntülü arama`
      break
  }

  return `✅ *Randevunuz Onaylandı*

Sayın ${appointment.name},

Randevunuz onaylanmıştır.

📅 *Tarih:* ${dateStr}
🕐 *Saat:* ${appointment.time}
${platformText}

Randevunuzdan 30 dakika önce size hatırlatma mesajı göndereceğiz.

_Fofora Tiyatro_`
}

/**
 * Generate cancellation notification message
 */
export function generateCancellationMessage(appointment: AppointmentDetails): string {
  const dateStr = new Date(appointment.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `❌ *Randevu İptali*

Sayın ${appointment.name},

${dateStr} tarihli, saat ${appointment.time} randevunuz iptal edilmiştir.

Yeni bir randevu oluşturmak için web sitemizi ziyaret edebilirsiniz:
🌐 ${process.env.NEXTAUTH_URL || ''}

_Fofora Tiyatro_`
}

/**
 * Generate date/time change notification message
 */
export function generateRescheduleMessage(
  appointment: AppointmentDetails,
  oldDate: Date,
  oldTime: string
): string {
  const oldDateStr = new Date(oldDate).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const newDateStr = new Date(appointment.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `🔄 *Randevu Değişikliği*

Sayın ${appointment.name},

Randevunuzda değişiklik yapılmıştır:

❌ *Eski Randevu:*
📅 ${oldDateStr}
🕐 ${oldTime}

✅ *Yeni Randevu:*
📅 ${newDateStr}
🕐 ${appointment.time}

_Fofora Tiyatro_`
}

/**
 * Generate 30-minute reminder message
 */
export function generateReminderMessage(appointment: AppointmentDetails): string {
  let platformText = ''
  switch (appointment.meetingPlatform) {
    case 'zoom':
      platformText = `\n\n📹 *Zoom Bağlantısı:*\n${appointment.meetingLink}`
      break
    case 'telegram':
      platformText = `\n\n📱 *Telegram:*\n${appointment.meetingLink}`
      break
    case 'site':
      platformText = `\n\n💻 *Görüşme Linki:*\n${appointment.meetingLink}`
      break
    case 'whatsapp':
      platformText = `\n\n📞 Size WhatsApp üzerinden arama yapacağız.`
      break
  }

  return `⏰ *Randevu Hatırlatması*

Sayın ${appointment.name},

30 dakika sonra randevunuz var!

🕐 *Saat:* ${appointment.time}${platformText}

Görüşmek üzere!

_Fofora Tiyatro_`
}

/**
 * Send WhatsApp notification (opens WhatsApp Web with pre-filled message)
 * In production, this should be replaced with WhatsApp Business API
 */
export async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; link: string; error?: string }> {
  try {
    const link = generateWhatsAppLink(phone, message)

    // In a real production environment, you would:
    // 1. Use WhatsApp Business API (requires approval and paid account)
    // 2. Use a service like Twilio WhatsApp API
    // 3. Use a third-party service like MessageBird, etc.

    // For now, we return the link which admin can click to send manually
    return {
      success: true,
      link
    }
  } catch (error) {
    return {
      success: false,
      link: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
