'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Upload, Palette, Globe, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

interface SiteSettings {
  id?: string
  siteName: string
  siteTitle: string
  description: string
  logo?: string
  favicon?: string
  primaryColor: string
  secondaryColor: string
  footerText?: string
  socialMedia?: any
  sectionVisibility?: {
    hero: boolean
    services: boolean
    about: boolean
    team: boolean
    testimonials: boolean
    blog: boolean
    contact: boolean
  }
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Mürekkep Hukuk',
    siteTitle: 'Mürekkep Hukuk - Adaletin Kalemi',
    description: 'Hukuki haklarınız için güvenilir, profesyonel ve etkili çözümler sunuyoruz',
    primaryColor: '#c19a6b',
    secondaryColor: '#243b53',
    footerText: '© 2024 Mürekkep Hukuk. Tüm hakları saklıdır.',
    sectionVisibility: {
      hero: true,
      services: true,
      about: true,
      team: true,
      testimonials: true,
      blog: true,
      contact: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

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
      if (data) {
        setSettings({
          ...data,
          sectionVisibility: data.sectionVisibility || {
            hero: true,
            services: true,
            about: true,
            team: true,
            contact: true
          }
        })
        if (data.logo) setLogoPreview(data.logo)
      }
    } catch (error) {
      console.error('Failed to fetch settings', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let logoUrl = settings.logo

      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)

        const uploadRes = await axios.post('/api/upload', formData)
        logoUrl = uploadRes.data.url
      }

      const updatedSettings = { ...settings, logo: logoUrl }

      if (settings.id) {
        await axios.put('/api/settings', updatedSettings)
      } else {
        const { data } = await axios.post('/api/settings', updatedSettings)
        setSettings(data)
      }

      alert('Ayarlar kaydedildi!')
      fetchSettings()
    } catch (error) {
      console.error('Save error:', error)
      alert('Kaydetme başarısız oldu')
    } finally {
      setSaving(false)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Site Ayarları</h1>
            <p className="text-white/60">Site genelindeki ayarları buradan yönetebilirsiniz</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-gold-500" />
              Logo
            </h2>

            <div className="flex items-start gap-6">
              {logoPreview && (
                <div className="relative w-32 h-32 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}

              <div className="flex-1">
                <label className="block text-white mb-2">Yeni Logo Yükle</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                />
                <p className="text-white/40 text-sm mt-2">PNG, JPG veya SVG. Maksimum 2MB.</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-gold-500" />
              Genel Bilgiler
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Site Adı *</label>
                <input
                  type="text"
                  required
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Mürekkep Hukuk"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Site Başlığı *</label>
                <input
                  type="text"
                  required
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Mürekkep Hukuk - Adaletin Kalemi"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Site Açıklaması *</label>
                <textarea
                  required
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  placeholder="Kısa açıklama..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Footer Metni</label>
                <input
                  type="text"
                  value={settings.footerText || ''}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="© 2024 Mürekkep Hukuk. Tüm hakları saklıdır."
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-6 h-6 text-gold-500" />
              Renk Ayarları
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Ana Renk (Gold) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-16 h-12 rounded-lg border border-white/20 bg-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="#c19a6b"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">İkincil Renk (Navy) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-16 h-12 rounded-lg border border-white/20 bg-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="#243b53"
                  />
                </div>
              </div>
            </div>

            <p className="text-white/40 text-sm mt-4">
              Not: Renk değişiklikleri sayfayı yenilediğinizde geçerli olacaktır.
            </p>
          </div>

          {/* Section Visibility */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-gold-500" />
              Sayfa Bölümleri Görünürlüğü
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Hero Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.hero ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      hero: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Hizmetler Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.services ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      services: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Hakkımızda Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.about ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      about: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Ekip Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.team ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      team: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Müvekkil Görüşleri Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.testimonials ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      testimonials: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">Blog Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.blog ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      blog: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                <span className="text-white font-medium">İletişim Bölümü</span>
                <input
                  type="checkbox"
                  checked={settings.sectionVisibility?.contact ?? true}
                  onChange={(e) => setSettings({
                    ...settings,
                    sectionVisibility: {
                      ...settings.sectionVisibility!,
                      contact: e.target.checked
                    }
                  })}
                  className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                />
              </label>
            </div>

            <p className="text-white/40 text-sm mt-4">
              Not: İşaretlenmemiş bölümler ana sayfada gizlenecektir.
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-4 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-2">İçerik Yönetimi</h3>
          <p className="text-white/60 text-sm mb-2">
            İçerikleri yönetmek için ilgili admin panellerini kullanın:
          </p>
          <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
            <li><strong>Hero:</strong> Admin Hero panelinden hero başlık, açıklama ve buton metnini düzenleyebilirsiniz</li>
            <li><strong>Hizmetler:</strong> Admin Hizmetler panelinden hizmet ekleyip düzenleyebilirsiniz</li>
            <li><strong>Hakkımızda:</strong> Admin Hakkımızda panelinden şirket bilgilerini güncelleyebilirsiniz</li>
            <li><strong>Ekip:</strong> Admin Ekip panelinden ekip üyelerini yönetebilirsiniz</li>
            <li><strong>Randevular:</strong> Admin Randevular ve Uygun Saatler panellerinden randevu sistemini yönetebilirsiniz</li>
            <li><strong>Hero Videoları:</strong> Admin Videolar panelinden arka plan videolarını ve sıralarını ayarlayabilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
