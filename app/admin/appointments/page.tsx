'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Phone, Mail, Video, Check, X, Eye, Trash2 } from 'lucide-react'
import axios from 'axios'

interface Appointment {
  id: string
  name: string
  phone: string
  email?: string
  date: string
  time: string
  meetingPlatform: string
  status: string
  notes?: string
  createdAt: string
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('/api/appointments')
      setAppointments(data)
    } catch (error) {
      console.error('Failed to fetch appointments', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put('/api/appointments', { id, status })
      fetchAppointments()
    } catch (error) {
      alert('Durum güncellenemedi')
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return

    try {
      await axios.delete(`/api/appointments?id=${id}`)
      fetchAppointments()
    } catch (error) {
      alert('Randevu silinemedi')
    }
  }

  const filteredAppointments = appointments.filter(apt =>
    filter === 'all' || apt.status === filter
  )

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return '📱 WhatsApp'
      case 'telegram': return '✈️ Telegram'
      case 'zoom': return '🎥 Zoom'
      case 'site': return '💻 Site'
      default: return platform
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor'
      case 'approved': return 'Onaylandı'
      case 'cancelled': return 'İptal Edildi'
      case 'completed': return 'Tamamlandı'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Randevu Yönetimi</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'cancelled', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  filter === status
                    ? 'bg-gold-500 border-gold-500 text-white'
                    : 'bg-white/5 border-white/20 text-white hover:border-gold-500/50'
                }`}
              >
                {status === 'all' ? 'Tümü' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <p className="text-white/60 text-lg">Randevu bulunamadı</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-gold-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">{appointment.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Phone className="w-4 h-4 text-gold-500" />
                          {appointment.phone}
                        </div>
                        {appointment.email && (
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Mail className="w-4 h-4 text-gold-500" />
                            {appointment.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <div className="flex items-center gap-2 text-white mb-2">
                        <Calendar className="w-4 h-4 text-gold-500" />
                        <span className="font-medium">
                          {new Date(appointment.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Clock className="w-4 h-4 text-gold-500" />
                        {appointment.time}
                      </div>
                    </div>

                    {/* Platform & Status */}
                    <div>
                      <div className="flex items-center gap-2 text-white mb-2">
                        <Video className="w-4 h-4 text-gold-500" />
                        <span className="font-medium">{getPlatformIcon(appointment.meetingPlatform)}</span>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Notes */}
                    <div>
                      {appointment.notes && (
                        <div>
                          <p className="text-white/40 text-xs mb-1">Not:</p>
                          <p className="text-white/60 text-sm line-clamp-3">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(appointment.id, 'approved')}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                          title="Onayla"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          title="İptal Et"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {appointment.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(appointment.id, 'completed')}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                        title="Tamamlandı Olarak İşaretle"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
