'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Phone, Mail, User, Video, FileText, Users } from 'lucide-react'
import axios from 'axios'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface AvailableSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
}

interface TeamMember {
  id: string
  name: string
  title: string
  active: boolean
}

interface FormSettings {
  consultationTypes: string[]
  showLawyerSelection: boolean
  descriptionLabel: string
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [formSettings, setFormSettings] = useState<FormSettings>({
    consultationTypes: ['Ticaret Hukuku', 'Ceza Hukuku', 'Aile Hukuku', 'İş Hukuku', 'Gayrimenkul Hukuku', 'Miras Hukuku', 'Diğer'],
    showLawyerSelection: true,
    descriptionLabel: 'Görüşmek istediğiniz konu hakkında detaylı bilgi veriniz'
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    meetingPlatform: 'whatsapp',
    consultationType: '',
    preferredLawyer: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchSlots()
      fetchTeamMembers()
      fetchFormSettings()
    }
  }, [isOpen])

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get('/api/slots')
      setSlots(data)
    } catch (error) {
      console.error('Failed to fetch slots', error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data } = await axios.get('/api/team')
      setTeamMembers(data.filter((m: TeamMember) => m.active))
    } catch (error) {
      console.error('Failed to fetch team members', error)
    }
  }

  const fetchFormSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      if (data.appointmentFormSettings) {
        setFormSettings(data.appointmentFormSettings)
      }
    } catch (error) {
      console.error('Failed to fetch form settings', error)
    }
  }

  const getAvailableDates = () => {
    const dates = new Set<string>()
    slots.forEach(slot => {
      const date = new Date(slot.date).toISOString().split('T')[0]
      dates.add(date)
    })
    return Array.from(dates).sort()
  }

  const getTimesForDate = (date: string) => {
    return slots.filter(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0]
      return slotDate === date
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/appointments', formData)
      alert('Randevu talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.')
      onClose()
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        meetingPlatform: 'whatsapp',
        consultationType: '',
        preferredLawyer: '',
        description: '',
        notes: ''
      })
      setStep(1)
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const availableDates = getAvailableDates()
  const availableTimes = selectedDate ? getTimesForDate(selectedDate) : []

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glass border border-gold-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-navy-900/95 backdrop-blur-lg border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Online Randevu & Danışma</h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Step 1: Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-500" />
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold-500" />
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="0555 555 55 55"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold-500" />
                    E-posta (Opsiyonel)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              {/* Step 2: Date & Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-500" />
                    Tarih Seçin *
                  </label>
                  <select
                    required
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setFormData({ ...formData, date: e.target.value, time: '' })
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 [&>option]:bg-navy-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-navy-800 text-white">Tarih seçin</option>
                    {availableDates.map(date => (
                      <option key={date} value={date} className="bg-navy-800 text-white">
                        {new Date(date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-500" />
                      Saat Seçin *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {availableTimes.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, time: slot.startTime })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            formData.time === slot.startTime
                              ? 'bg-gold-500 border-gold-500 text-white'
                              : 'bg-white/5 border-white/20 text-white hover:border-gold-500/50'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Meeting Platform */}
              <div>
                <label className="block text-white mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-gold-500" />
                  Görüşme Tercihi *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'telegram', label: 'Telegram' },
                    { value: 'zoom', label: 'Zoom' },
                    { value: 'site', label: 'Site Üzerinden' },
                  ].map(platform => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, meetingPlatform: platform.value })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.meetingPlatform === platform.value
                          ? 'bg-gold-500 border-gold-500 text-white'
                          : 'bg-white/5 border-white/20 text-white hover:border-gold-500/50'
                      }`}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  Görüşme Konusu *
                </label>
                <select
                  required
                  value={formData.consultationType}
                  onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 [&>option]:bg-navy-800 [&>option]:text-white"
                >
                  <option value="" className="bg-navy-800 text-white">Konu seçin</option>
                  {formSettings.consultationTypes.map(type => (
                    <option key={type} value={type} className="bg-navy-800 text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Lawyer */}
              {formSettings.showLawyerSelection && teamMembers.length > 0 && (
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-500" />
                    Tercih Ettiğiniz Avukat (Opsiyonel)
                  </label>
                  <select
                    value={formData.preferredLawyer}
                    onChange={(e) => setFormData({ ...formData, preferredLawyer: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 [&>option]:bg-navy-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-navy-800 text-white">Farketmez</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.name} className="bg-navy-800 text-white">
                        {member.name} - {member.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  {formSettings.descriptionLabel} *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  placeholder="Görüşmek istediğiniz konu hakkında detaylı bilgi veriniz..."
                />
                <p className="text-white/50 text-xs mt-2">
                  Lütfen durumunuz hakkında mümkün olduğunca detaylı bilgi verin.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white mb-2">Ek Notlar (Opsiyonel)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  placeholder="Varsa eklemek istediğiniz notlar..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.phone || !formData.date || !formData.time || !formData.consultationType || !formData.description}
                className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-4 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {loading ? 'Gönderiliyor...' : 'Randevu Talebi Oluştur'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
