'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Video, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointment()
  }, [])

  const fetchAppointment = async () => {
    try {
      const { data } = await axios.get(`/api/appointments?id=${appointmentId}`)

      if (!data || data.length === 0) {
        setError('Randevu bulunamadı')
        setLoading(false)
        return
      }

      const apt = data[0]

      if (apt.status !== 'approved') {
        setError('Bu randevu henüz onaylanmamış')
        setLoading(false)
        return
      }

      if (apt.meetingPlatform !== 'site') {
        setError('Bu randevu site üzerinden görüşme için ayarlanmamış')
        setLoading(false)
        return
      }

      setAppointment(apt)
      setLoading(false)

      // Redirect to Jitsi Meet directly (no 5-minute limit)
      const roomName = `MurekkepHukuk_${appointmentId}`
      const displayName = encodeURIComponent(apt.name || 'Danışan')
      const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=true`

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = jitsiUrl
      }, 2000)
    } catch (error) {
      console.error('Randevu yüklenemedi:', error)
      setError('Randevu bilgileri alınamadı')
      setLoading(false)
    }
  }

  if (loading || appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
          <Video className="w-16 h-16 text-gold-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Görüşme Başlatılıyor</h2>
          <p className="text-white/70 mb-4">Jitsi Meet'e yönlendiriliyorsunuz...</p>
          {appointment && (
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="text-white/60 text-sm mb-1">Randevu Bilgileri</p>
              <p className="text-white font-semibold">{appointment.name}</p>
              <p className="text-white/70 text-sm">
                {new Date(appointment.date).toLocaleDateString('tr-TR')} - {appointment.time}
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <ExternalLink className="w-4 h-4" />
            <span>Güvenli ve şifreli görüşme</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Görüşme Başlatılamadı</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  // This should never be reached as we redirect
  return null
}
