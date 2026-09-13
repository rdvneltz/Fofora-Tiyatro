'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import ImageUploader from '@/components/ImageUploader'

interface AboutSection {
  id: string
  title: string
  content: string
  mission?: string
  vision?: string
  values: string[]
  image?: string
  active: boolean
}

export default function AboutPage() {
  const { status } = useSession()
  const router = useRouter()
  const [about, setAbout] = useState<AboutSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mission: '',
    vision: '',
    values: [''] as string[],
    image: '',
    active: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const { data } = await axios.get('/api/about?admin=true')
      if (data) {
        setAbout(data)
        setFormData({
          title: data.title,
          content: data.content,
          mission: data.mission || '',
          vision: data.vision || '',
          values: data.values || [''],
          image: data.image || '',
          active: data.active,
        })
      }
    } catch (error) {
      console.error('Hakkımızda yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (about) {
        await axios.put('/api/about', { id: about.id, ...formData })
      } else {
        await axios.post('/api/about', formData)
      }
      alert('Hakkımızda bölümü başarıyla güncellendi!')
      fetchAbout()
    } catch (error) {
      console.error('Kaydetme başarısız', error)
      alert('Bir hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  const addValue = () => {
    setFormData({ ...formData, values: [...formData.values, ''] })
  }

  const removeValue = (index: number) => {
    const newValues = formData.values.filter((_, i) => i !== index)
    setFormData({ ...formData, values: newValues })
  }

  const updateValue = (index: number, value: string) => {
    const newValues = [...formData.values]
    newValues[index] = value
    setFormData({ ...formData, values: newValues })
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
          <h1 className="text-4xl font-bold text-white">Hakkımızda Yönetimi</h1>
        </div>

        <div className="glass rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                required
              />
            </div>

            <div>
              <ImageUploader
                currentUrl={formData.image}
                onUrlChange={(url) => setFormData({ ...formData, image: url })}
                label="Hakkımızda Fotoğrafı"
                folder="images/about"
              />
            </div>

            <div>
              <label className="block text-white mb-2">İçerik</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Misyon (Opsiyonel)</label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-white mb-2">Vizyon (Opsiyonel)</label>
                <textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={4}
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Değerlerimiz</label>
              {formData.values.map((value, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    placeholder={`Değer ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeValue(index)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Sil
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addValue}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Değer Ekle
              </button>
            </div>

            <div>
              <label className="flex items-center text-white gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5"
                />
                Aktif
              </label>
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
