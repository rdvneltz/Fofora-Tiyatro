'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Edit, Trash2, X } from 'lucide-react'
import axios from 'axios'

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  active: boolean
}

export default function AdminSlots() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    active: true
  })

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get('/api/slots?admin=true')
      setSlots(data)
    } catch (error) {
      console.error('Failed to fetch slots', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingSlot) {
        await axios.put('/api/slots', {
          id: editingSlot.id,
          ...formData
        })
      } else {
        await axios.post('/api/slots', formData)
      }

      fetchSlots()
      setShowModal(false)
      setEditingSlot(null)
      setFormData({ date: '', startTime: '', endTime: '', active: true })
    } catch (error) {
      alert('Kayıt başarısız oldu')
    }
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('Bu zaman dilimini silmek istediğinizden emin misiniz?')) return

    try {
      await axios.delete(`/api/slots?id=${id}`)
      fetchSlots()
    } catch (error) {
      alert('Silme işlemi başarısız oldu')
    }
  }

  const toggleActive = async (slot: Slot) => {
    try {
      await axios.put('/api/slots', {
        id: slot.id,
        active: !slot.active,
        isBooked: slot.isBooked
      })
      fetchSlots()
    } catch (error) {
      alert('Güncelleme başarısız oldu')
    }
  }

  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot)
    setFormData({
      date: new Date(slot.date).toISOString().split('T')[0],
      startTime: slot.startTime,
      endTime: slot.endTime,
      active: slot.active
    })
    setShowModal(true)
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, Slot[]>)

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
          <h1 className="text-4xl font-bold text-white">Uygun Saatler Yönetimi</h1>
          <button
            onClick={() => {
              setEditingSlot(null)
              setFormData({ date: '', startTime: '', endTime: '', active: true })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni Saat Ekle
          </button>
        </div>

        {/* Slots by Date */}
        <div className="space-y-8">
          {sortedDates.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <p className="text-white/60 text-lg">Henüz uygun saat tanımlanmamış</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-gold-500" />
                  {new Date(date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedSlots[date]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(slot => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          slot.isBooked
                            ? 'bg-red-500/10 border-red-500/50'
                            : slot.active
                            ? 'bg-green-500/10 border-green-500/50'
                            : 'bg-gray-500/10 border-gray-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <Clock className="w-4 h-4 text-gold-500" />
                            {slot.startTime}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="p-1 rounded hover:bg-white/10 transition-all"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                            </button>
                            <button
                              onClick={() => deleteSlot(slot.id)}
                              className="p-1 rounded hover:bg-white/10 transition-all"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                            </button>
                          </div>
                        </div>

                        <div className="text-white/60 text-sm mb-3">
                          Bitiş: {slot.endTime}
                        </div>

                        <div className="flex gap-2">
                          {slot.isBooked && (
                            <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/50">
                              Dolu
                            </span>
                          )}
                          <button
                            onClick={() => toggleActive(slot)}
                            className={`px-2 py-1 rounded text-xs border ${
                              slot.active
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                            }`}
                          >
                            {slot.active ? 'Aktif' : 'Pasif'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl max-w-md w-full p-6 border border-gold-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingSlot ? 'Saat Düzenle' : 'Yeni Saat Ekle'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Tarih *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Başlangıç Saati *</label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Bitiş Saati *</label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-white">
                      Aktif olarak ekle
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-3 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
                  >
                    {editingSlot ? 'Güncelle' : 'Ekle'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
