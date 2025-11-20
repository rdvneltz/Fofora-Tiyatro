'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, ArrowLeft, Repeat, CalendarDays } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  active: boolean
}

interface RecurringPattern {
  daysOfWeek: number[] // 0 = Sunday, 1 = Monday, etc.
  startTime: string
  endTime: string
  startDate: string
  endDate: string
}

export default function AdminSlots() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  // Recurring pattern state
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '18:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [slotDuration, setSlotDuration] = useState(60) // minutes

  const daysOfWeekNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const workDays = [1, 2, 3, 4, 5] // Monday to Friday

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get('/api/slots')
      setSlots(data)
    } catch (error) {
      console.error('Slotlar yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDayOfWeek = (day: number) => {
    setRecurringPattern(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }))
  }

  const selectWorkDays = () => {
    setRecurringPattern(prev => ({ ...prev, daysOfWeek: workDays }))
  }

  const generateTimeSlots = (start: string, end: string, intervalMinutes: number = 60) => {
    const slots: string[] = []
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
      const mins = currentMinutes % 60
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
      currentMinutes += intervalMinutes
    }

    return slots
  }

  const createRecurringSlots = async () => {
    try {
      const { daysOfWeek, startTime, endTime, startDate, endDate } = recurringPattern

      if (daysOfWeek.length === 0) {
        alert('Lütfen en az bir gün seçin')
        return
      }

      // Generate date range
      const start = new Date(startDate)
      const end = new Date(endDate)
      const slotsToCreate: any[] = []

      // Generate time slots with selected duration
      const timeSlots = generateTimeSlots(startTime, endTime, slotDuration)

      // Iterate through each day in the range
      let currentDate = new Date(start)
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay()

        if (daysOfWeek.includes(dayOfWeek)) {
          // Create slots for each hour interval
          for (let i = 0; i < timeSlots.length; i++) {
            const slotStart = timeSlots[i]
            const slotEnd = timeSlots[i + 1] || endTime

            slotsToCreate.push({
              date: currentDate.toISOString().split('T')[0],
              startTime: slotStart,
              endTime: slotEnd,
              active: true
            })
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Create all slots in batch
      await Promise.all(
        slotsToCreate.map(slot => axios.post('/api/slots', slot))
      )

      alert(`${slotsToCreate.length} slot başarıyla oluşturuldu!`)
      setShowRecurringModal(false)
      fetchSlots()
    } catch (error) {
      console.error('Tekrarlayan slotlar oluşturulamadı', error)
      alert('Bir hata oluştu')
    }
  }

  const createSingleSlot = async () => {
    try {
      await axios.post('/api/slots', {
        date: selectedDate,
        startTime,
        endTime,
        active: true
      })
      setShowModal(false)
      setSelectedDate('')
      fetchSlots()
    } catch (error) {
      console.error('Slot oluşturulamadı', error)
      alert('Bir hata oluştu')
    }
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('Bu slotu silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`/api/slots?id=${id}`)
      fetchSlots()
    } catch (error) {
      console.error('Slot silinemedi', error)
    }
  }

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: Slot[] } = {}
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = []
      }
      grouped[slot.date].push(slot)
    })
    return grouped
  }

  const groupedSlots = groupSlotsByDate()
  const sortedDates = Object.keys(groupedSlots).sort()

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
            <h1 className="text-4xl font-bold text-white">Uygun Saatler Yönetimi</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-gold-500/50 text-white rounded-lg font-semibold hover:bg-gold-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tekli Slot Ekle
            </button>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
            >
              <Repeat className="w-5 h-5" />
              Toplu Slot Oluştur
            </button>
          </div>
        </div>

        {/* Slots List by Date */}
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <CalendarDays className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">Henüz slot eklenmemiş</p>
              <p className="text-white/40 text-sm mt-2">Toplu slot oluştur ile hızlıca haftalık çalışma saatlerinizi ekleyebilirsiniz</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold-500" />
                    {(() => {
                      // Parse date string safely (YYYY-MM-DD format)
                      const [year, month, day] = date.split('-').map(Number)
                      const dateObj = new Date(year, month - 1, day)
                      return dateObj.toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    })()}
                  </h3>
                  <span className="text-white/60 text-sm">{groupedSlots[date].length} slot</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {groupedSlots[date].map(slot => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative group p-3 rounded-lg border-2 transition-all ${
                        slot.isBooked
                          ? 'bg-red-500/20 border-red-500/50'
                          : slot.active
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-gray-500/20 border-gray-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-white/70" />
                          <span className="text-white font-medium text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {!slot.isBooked && (
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {slot.isBooked ? 'Dolu' : slot.active ? 'Müsait' : 'Pasif'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Single Slot Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-8 max-w-md w-full border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Tekli Slot Ekle</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Tarih</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Başlangıç</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Bitiş</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={createSingleSlot}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-600"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recurring Slots Modal */}
        <AnimatePresence>
          {showRecurringModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRecurringModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-8 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Toplu Slot Oluştur</h2>

                <div className="space-y-6">
                  {/* Days of Week Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white font-medium">Günler</label>
                      <button
                        onClick={selectWorkDays}
                        className="text-gold-400 text-sm hover:text-gold-300"
                      >
                        Hafta İçi Seç
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeekNames.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => toggleDayOfWeek(index)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            recurringPattern.daysOfWeek.includes(index)
                              ? 'bg-gold-500 border-gold-500 text-white'
                              : 'bg-white/5 border-white/20 text-white/70 hover:border-gold-500/50'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div>
                    <label className="block text-white mb-2">Slot Süresi</label>
                    <select
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value={15}>15 Dakika</option>
                      <option value={30}>30 Dakika</option>
                      <option value={45}>45 Dakika</option>
                      <option value={60}>1 Saat</option>
                      <option value={90}>1.5 Saat</option>
                      <option value={120}>2 Saat</option>
                    </select>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Başlangıç Saati</label>
                      <input
                        type="time"
                        value={recurringPattern.startTime}
                        onChange={(e) => setRecurringPattern({ ...recurringPattern, startTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Bitiş Saati</label>
                      <input
                        type="time"
                        value={recurringPattern.endTime}
                        onChange={(e) => setRecurringPattern({ ...recurringPattern, endTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Başlangıç Tarihi</label>
                      <input
                        type="date"
                        value={recurringPattern.startDate}
                        onChange={(e) => setRecurringPattern({ ...recurringPattern, startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Bitiş Tarihi</label>
                      <input
                        type="date"
                        value={recurringPattern.endDate}
                        onChange={(e) => setRecurringPattern({ ...recurringPattern, endDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      <strong>Bilgi:</strong> Seçilen günlerde, belirtilen saat aralığında {slotDuration} dakikalık slotlar otomatik oluşturulacaktır.
                      <br />
                      Örnek: 09:00-18:00 arası ({slotDuration} dk slotlar) = {Math.floor((9 * 60) / slotDuration)} adet slot
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={createRecurringSlots}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-600 font-semibold"
                    >
                      Slotları Oluştur
                    </button>
                    <button
                      onClick={() => setShowRecurringModal(false)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
