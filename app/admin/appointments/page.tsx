'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Phone, Mail, Video, Check, X, Eye, Trash2, ArrowLeft, MessageCircle, Bell, Edit } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Appointment {
  id: string
  name: string
  phone: string
  email?: string
  date: string
  time: string
  meetingPlatform: string
  meetingLink?: string
  status: string
  notes?: string
  notificationSent: boolean
  reminderSent: boolean
  previousDate?: string
  previousTime?: string
  createdAt: string
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [meetingLinkInput, setMeetingLinkInput] = useState('')

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

  const sendNotification = async (id: string, type: string) => {
    try {
      const { data } = await axios.post(`/api/appointments/${id}/notify`, { type })

      if (data.success && data.whatsappLink) {
        // Open WhatsApp link in new tab
        window.open(data.whatsappLink, '_blank')
        alert('WhatsApp açıldı! Mesajı gönderebilirsiniz.')
        fetchAppointments()
      } else {
        alert('Bildirim linki oluşturulamadı')
      }
    } catch (error: any) {
      console.error('Notification error:', error)
      alert('Bildirim gönderilemedi: ' + (error.response?.data?.error || error.message))
    }
  }

  const updateStatus = async (id: string, status: string, sendNotif = true) => {
    try {
      const appointment = appointments.find(a => a.id === id)
      if (!appointment) return

      // Save previous values for reschedule notification
      const updateData: any = { id, status }
      if (status === 'approved' && appointment.status === 'pending') {
        updateData.previousDate = appointment.date
        updateData.previousTime = appointment.time
      }

      await axios.put('/api/appointments', updateData)
      fetchAppointments()

      // Send notification based on status
      if (sendNotif) {
        if (status === 'approved' && appointment.status === 'pending') {
          // Approval notification
          await sendNotification(id, 'approval')
        } else if (status === 'cancelled') {
          // Cancellation notification
          await sendNotification(id, 'cancellation')
        }
      }
    } catch (error) {
      alert('Durum güncellenemedi')
    }
  }

  const updateMeetingLink = async (id: string) => {
    try {
      await axios.put('/api/appointments', { id, meetingLink: meetingLinkInput })
      setEditingLink(null)
      setMeetingLinkInput('')
      fetchAppointments()
      alert('Meeting linki güncellendi')
    } catch (error) {
      alert('Link güncellenemedi')
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
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl font-bold text-white">Randevu Yönetimi</h1>
          </div>
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

                    {/* Consultation Type */}
                    <div>
                      <p className="text-white/40 text-xs mb-1">Görüşme Konusu:</p>
                      <p className="text-white font-medium text-sm">{appointment.consultationType}</p>
                    </div>

                    {/* Preferred Lawyer */}
                    {appointment.preferredLawyer && (
                      <div>
                        <p className="text-white/40 text-xs mb-1">Tercih Edilen Avukat:</p>
                        <p className="text-white/70 text-sm">{appointment.preferredLawyer}</p>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <p className="text-white/40 text-xs mb-1">Detaylı Açıklama:</p>
                      <p className="text-white/70 text-sm leading-relaxed">{appointment.description}</p>
                    </div>

                    {/* Meeting Link */}
                    {['zoom', 'telegram', 'site'].includes(appointment.meetingPlatform) && (
                      <div>
                        <p className="text-white/40 text-xs mb-1">
                          {appointment.meetingPlatform === 'zoom' && 'Zoom Link:'}
                          {appointment.meetingPlatform === 'telegram' && 'Telegram:'}
                          {appointment.meetingPlatform === 'site' && 'Görüşme Link:'}
                        </p>
                        {editingLink === appointment.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={meetingLinkInput}
                              onChange={(e) => setMeetingLinkInput(e.target.value)}
                              placeholder={
                                appointment.meetingPlatform === 'zoom' ? 'https://zoom.us/j/...' :
                                appointment.meetingPlatform === 'telegram' ? '@username' :
                                'https://...'
                              }
                              className="flex-1 px-2 py-1 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-gold-500"
                            />
                            <button
                              onClick={() => updateMeetingLink(appointment.id)}
                              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={() => {
                                setEditingLink(null)
                                setMeetingLinkInput('')
                              }}
                              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            {appointment.meetingLink ? (
                              <a
                                href={appointment.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-400 text-sm hover:text-gold-300 underline flex-1 truncate"
                              >
                                {appointment.meetingLink}
                              </a>
                            ) : (
                              <p className="text-white/40 text-sm flex-1">Link henüz eklenmedi</p>
                            )}
                            <button
                              onClick={() => {
                                setEditingLink(appointment.id)
                                setMeetingLinkInput(appointment.meetingLink || '')
                              }}
                              className="p-1 text-white/60 hover:text-gold-400 transition-colors"
                              title="Linki Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notification Status */}
                    <div className="flex gap-2 text-xs">
                      {appointment.notificationSent && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          ✓ Bildirim Gönderildi
                        </span>
                      )}
                      {appointment.reminderSent && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                          ⏰ Hatırlatma Gönderildi
                        </span>
                      )}
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
                          title="Onayla ve WhatsApp Gönder"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          title="İptal Et ve Bildir"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {appointment.status === 'approved' && (
                      <>
                        <button
                          onClick={() => updateStatus(appointment.id, 'completed', false)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                          title="Tamamlandı Olarak İşaretle"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        {!appointment.reminderSent && (
                          <button
                            onClick={() => sendNotification(appointment.id, 'reminder')}
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                            title="Hatırlatma Gönder"
                          >
                            <Bell className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => sendNotification(appointment.id, 'approval')}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                          title="Onay Mesajını Tekrar Gönder"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </>
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
