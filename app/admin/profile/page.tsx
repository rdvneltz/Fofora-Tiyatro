'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Key, User, Mail } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setFormData({
        ...formData,
        name: session.user.name || '',
        email: session.user.email || ''
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      await axios.put('/api/admin/profile', {
        name: formData.name,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      })

      // Update session with new name
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name
        }
      })

      setMessage('Profil başarıyla güncellendi!')
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Güncelleme başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Admin Panel
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-2xl font-bold text-white">Profil Ayarları</h1>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-4 rounded-lg mb-6"
          >
            {message}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold-400" />
                  Temel Bilgiler
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-1">E-posta adresi değiştirilemez</p>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="pt-6 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-gold-400" />
                  Şifre Değiştir
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Mevcut şifreniz"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Yeni Şifre</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Yeni şifreniz (en az 6 karakter)"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-3">
                  Şifre değiştirmek istemiyorsanız bu alanları boş bırakın
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
