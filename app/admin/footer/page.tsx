'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, GripVertical } from 'lucide-react'

interface LegalLink {
  title: string
  content: string
  active: boolean
  order: number
}

export default function FooterSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copyrightText, setCopyrightText] = useState('© 2024 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır.')
  const [legalLinks, setLegalLinks] = useState<LegalLink[]>([
    {
      title: 'Gizlilik Politikası',
      content: 'Gizlilik politikası içeriği buraya gelecek...',
      active: true,
      order: 0
    },
    {
      title: 'Kullanım Koşulları',
      content: 'Kullanım koşulları içeriği buraya gelecek...',
      active: true,
      order: 1
    }
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      if (data.copyrightText) {
        setCopyrightText(data.copyrightText)
      }
      if (data.legalLinks && Array.isArray(data.legalLinks)) {
        setLegalLinks(data.legalLinks)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      await axios.patch('/api/settings', {
        copyrightText,
        legalLinks
      })
      setMessage('Footer ayarları başarıyla güncellendi!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Güncelleme başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  const addLegalLink = () => {
    setLegalLinks([
      ...legalLinks,
      {
        title: 'Yeni Bağlantı',
        content: 'İçerik buraya gelecek...',
        active: true,
        order: legalLinks.length
      }
    ])
  }

  const removeLegalLink = (index: number) => {
    setLegalLinks(legalLinks.filter((_, i) => i !== index))
  }

  const updateLegalLink = (index: number, field: keyof LegalLink, value: any) => {
    const updated = [...legalLinks]
    updated[index] = { ...updated[index], [field]: value }
    setLegalLinks(updated)
  }

  const toggleLegalLinkActive = (index: number) => {
    const updated = [...legalLinks]
    updated[index].active = !updated[index].active
    setLegalLinks(updated)
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
            <h1 className="text-2xl font-bold text-white">Footer Ayarları</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
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

        <div className="grid gap-6">
          {/* Copyright Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Telif Hakkı Metni
            </h2>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              placeholder="© 2024 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <p className="text-white/50 text-sm mt-2">
              Footer'da gösterilecek telif hakkı yazısı. Örnek: © 2024 Firma Adı. Tüm hakları saklıdır.
            </p>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Yasal Bağlantılar
              </h2>
              <button
                onClick={addLegalLink}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Ekle
              </button>
            </div>

            <div className="space-y-4">
              {legalLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <GripVertical className="w-5 h-5 text-white/30 mt-3 cursor-move" />
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLegalLink(index, 'title', e.target.value)}
                          placeholder="Başlık (örn: Gizlilik Politikası)"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                        <button
                          onClick={() => toggleLegalLinkActive(index)}
                          className={`p-3 rounded-lg transition-colors ${
                            link.active
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                          title={link.active ? 'Aktif' : 'Pasif'}
                        >
                          {link.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => removeLegalLink(index)}
                          className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <textarea
                        value={link.content}
                        onChange={(e) => updateLegalLink(index, 'content', e.target.value)}
                        placeholder="İçerik (modal açıldığında gösterilecek metin)"
                        rows={8}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {legalLinks.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  <p>Henüz yasal bağlantı eklenmemiş.</p>
                  <p className="text-sm mt-2">Gizlilik Politikası, Kullanım Koşulları gibi yasal metinler ekleyebilirsiniz.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
