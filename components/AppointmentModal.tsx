'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Mail, User, FileText, CheckCircle, Sparkles } from 'lucide-react'
import axios from 'axios'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Service {
  id: string
  title: string
  ageGroup?: string
  active: boolean
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchServices()
      setSuccess(false)
    }
  }, [isOpen])

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/api/services')
      setServices(data.filter((s: Service) => s.active))
    } catch (error) {
      console.error('Failed to fetch services', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/inquiries', formData)
      setSuccess(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: ''
      })

      // 3 saniye sonra modalı kapat
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 3000)
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSuccess(false)
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: ''
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl max-w-md w-full overflow-hidden glass border border-gold-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-navy-900/95 backdrop-blur-lg border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Bilgi & Kayıt Talebi</h2>
                <p className="text-white/60 text-sm mt-1">Size en kısa sürede dönüş yapacağız</p>
              </div>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Talebiniz Alındı!</h3>
                <p className="text-white/70 mb-2">
                  En kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <p className="text-gold-400 text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fofora Tiyatro
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Ad Soyad */}
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-gold-500" />
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                    <Phone className="w-4 h-4 text-gold-500" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="0555 555 55 55"
                  />
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-gold-500" />
                    E-posta
                    <span className="text-white/40 text-xs">(Opsiyonel)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                {/* Konu */}
                <div>
                  <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4 text-gold-500" />
                    İlgilendiğiniz Program
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all [&>option]:bg-navy-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-navy-800 text-white">Program seçin</option>
                    {services.map(service => (
                      <option key={service.id} value={service.title} className="bg-navy-800 text-white">
                        {service.title} {service.ageGroup && `(${service.ageGroup} yaş)`}
                      </option>
                    ))}
                    <option value="Genel Bilgi" className="bg-navy-800 text-white">Genel Bilgi Almak İstiyorum</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !formData.name || !formData.phone || !formData.subject}
                  className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-4 rounded-xl font-semibold hover:from-gold-700 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Gönderiliyor...
                    </span>
                  ) : (
                    'Talep Gönder'
                  )}
                </button>

                <p className="text-white/40 text-xs text-center">
                  Bilgileriniz gizli tutulacak ve sadece sizinle iletişim için kullanılacaktır.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
