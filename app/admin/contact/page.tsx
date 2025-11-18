'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface ContactInfo {
  id: string
  address: string
  phone: string
  email: string
  workingHours: string
  mapUrl?: string
}

export default function ContactPage() {
  const { status } = useSession()
  const router = useRouter()
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    mapUrl: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchContact()
  }, [])

  const fetchContact = async () => {
    try {
      const { data } = await axios.get('/api/contact')
      if (data) {
        setContact(data)
        setFormData({
          address: data.address,
          phone: data.phone,
          email: data.email,
          workingHours: data.workingHours,
          mapUrl: data.mapUrl || '',
        })
      }
    } catch (error) {
      console.error('İletişim bilgileri yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (contact) {
        await axios.put('/api/contact', { id: contact.id, ...formData })
      } else {
        await axios.post('/api/contact', formData)
      }
      alert('İletişim bilgileri başarıyla güncellendi!')
      fetchContact()
    } catch (error) {
      console.error('Kaydetme başarısız', error)
      alert('Bir hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold text-white">İletişim Bilgileri Yönetimi</h1>
        </div>

        <div className="glass rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">Adres</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Telefon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Çalışma Saatleri</label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="Pazartesi - Cuma: 09:00 - 18:00"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Harita URL (Opsiyonel)</label>
              <input
                type="text"
                value={formData.mapUrl}
                onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                placeholder="Google Maps embed URL"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
