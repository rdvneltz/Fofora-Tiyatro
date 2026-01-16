'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Inbox,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  User,
  FileText,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Inquiry {
  id: string
  name: string
  phone: string
  email?: string
  subject: string
  status: string
  adminNotes?: string
  repliedAt?: string
  createdAt: string
}

export default function InboxPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchInquiries()
  }, [filter])

  const fetchInquiries = async () => {
    try {
      const { data } = await axios.get(`/api/inquiries?status=${filter}`)
      setInquiries(data)
    } catch (error) {
      console.error('Failed to fetch inquiries', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put('/api/inquiries', { id, status: newStatus })
      fetchInquiries()
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus })
      }
    } catch (error) {
      alert('Güncelleme başarısız oldu')
    }
  }

  const saveNotes = async () => {
    if (!selectedInquiry) return
    try {
      await axios.put('/api/inquiries', {
        id: selectedInquiry.id,
        adminNotes
      })
      fetchInquiries()
      alert('Notlar kaydedildi')
    } catch (error) {
      alert('Kaydetme başarısız oldu')
    }
  }

  const deleteInquiry = async (id: string) => {
    try {
      await axios.delete(`/api/inquiries?id=${id}`)
      setDeleteConfirm(null)
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null)
      }
      fetchInquiries()
    } catch (error) {
      alert('Silme başarısız oldu')
    }
  }

  const openWhatsApp = (inquiry: Inquiry, type: 'reply' | 'notify') => {
    const phone = inquiry.phone.replace(/\D/g, '')
    const formattedPhone = phone.startsWith('0') ? '90' + phone.slice(1) : phone

    let message = ''
    if (type === 'reply') {
      message = `Merhaba ${inquiry.name},\n\nFofora Tiyatro'ya gösterdiğiniz ilgi için teşekkür ederiz.\n\n"${inquiry.subject}" hakkında bilgi almak istediğinizi gördük.\n\n[Mesajınızı buraya yazın]\n\nSaygılarımızla,\nFofora Tiyatro`
    } else {
      message = `Merhaba ${inquiry.name},\n\nFofora Tiyatro'ya ulaştığınız için teşekkür ederiz. Talebiniz alınmıştır ve en kısa sürede sizinle iletişime geçeceğiz.\n\nSaygılarımızla,\nFofora Tiyatro`
    }

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    if (type === 'reply') {
      updateStatus(inquiry.id, 'replied')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1"><Mail className="w-3 h-3" /> Yeni</span>
      case 'read':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><MailOpen className="w-3 h-3" /> Okundu</span>
      case 'replied':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yanıtlandı</span>
      case 'archived':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1"><Archive className="w-3 h-3" /> Arşiv</span>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Az önce'
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  const newCount = inquiries.filter(i => i.status === 'new').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800">
      <div className="flex h-screen">
        {/* Sol Panel - Liste */}
        <div className="w-full md:w-1/3 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-gold-500" />
                  Gelen Kutusu
                </h1>
                {newCount > 0 && (
                  <p className="text-blue-400 text-sm">{newCount} yeni mesaj</p>
                )}
              </div>
            </div>

            {/* Filtreler */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Tümü' },
                { value: 'new', label: 'Yeni' },
                { value: 'read', label: 'Okundu' },
                { value: 'replied', label: 'Yanıtlandı' },
                { value: 'archived', label: 'Arşiv' }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f.value
                      ? 'bg-gold-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {inquiries.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz mesaj yok</p>
              </div>
            ) : (
              inquiries.map(inquiry => (
                <div
                  key={inquiry.id}
                  onClick={() => {
                    setSelectedInquiry(inquiry)
                    setAdminNotes(inquiry.adminNotes || '')
                    if (inquiry.status === 'new') {
                      updateStatus(inquiry.id, 'read')
                    }
                  }}
                  className={`p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/5 ${
                    selectedInquiry?.id === inquiry.id ? 'bg-white/10' : ''
                  } ${inquiry.status === 'new' ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {inquiry.status === 'new' ? (
                        <Mail className="w-4 h-4 text-blue-400" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-white/40" />
                      )}
                      <span className={`font-semibold ${inquiry.status === 'new' ? 'text-white' : 'text-white/80'}`}>
                        {inquiry.name}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs">{formatDate(inquiry.createdAt)}</span>
                  </div>
                  <p className="text-gold-400 text-sm mb-1">{inquiry.subject}</p>
                  <p className="text-white/50 text-xs">{inquiry.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sağ Panel - Detay (Desktop only) */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedInquiry ? (
            <>
              {/* Detay Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedInquiry.name}</h2>
                  <p className="text-gold-400">{selectedInquiry.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedInquiry.status)}
                  <button
                    onClick={() => setDeleteConfirm(selectedInquiry.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detay İçerik */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* İletişim Bilgileri */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-gold-500" />
                      İletişim Bilgileri
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-white/40" />
                        <span className="text-white">{selectedInquiry.phone}</span>
                      </div>
                      {selectedInquiry.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-white/40" />
                          <span className="text-white">{selectedInquiry.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-white/40" />
                        <span className="text-white">{selectedInquiry.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-white/40" />
                        <span className="text-white/60 text-sm">
                          {new Date(selectedInquiry.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Aksiyonları */}
                  <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
                    <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      WhatsApp ile İletişim
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openWhatsApp(selectedInquiry, 'notify')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Onay Mesajı Gönder
                      </button>
                      <button
                        onClick={() => openWhatsApp(selectedInquiry, 'reply')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Yanıtla
                      </button>
                    </div>
                  </div>

                  {/* Admin Notları */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Admin Notları</h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                      placeholder="Bu talep hakkında notlarınız..."
                    />
                    <button
                      onClick={saveNotes}
                      className="mt-3 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-all"
                    >
                      Notları Kaydet
                    </button>
                  </div>

                  {/* Durum Değiştirme */}
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Durum Değiştir</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(selectedInquiry.id, 'new')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedInquiry.status === 'new'
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        }`}
                      >
                        Yeni
                      </button>
                      <button
                        onClick={() => updateStatus(selectedInquiry.id, 'read')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedInquiry.status === 'read'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                      >
                        Okundu
                      </button>
                      <button
                        onClick={() => updateStatus(selectedInquiry.id, 'replied')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedInquiry.status === 'replied'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        Yanıtlandı
                      </button>
                      <button
                        onClick={() => updateStatus(selectedInquiry.id, 'archived')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedInquiry.status === 'archived'
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        Arşivle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/40">
                <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Detayları görmek için bir mesaj seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Silme Onay Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-navy-800 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Mesajı Sil</h3>
              </div>
              <p className="text-white/70 mb-6">Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => deleteInquiry(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
