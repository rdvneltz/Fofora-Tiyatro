'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Palette, Globe, ArrowLeft, Instagram, Youtube, ChevronUp, ChevronDown, Video } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import ImageUploader from '@/components/ImageUploader'

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
    instagram: boolean
    blog: boolean
    contact: boolean
    gallery: boolean
  }
  sectionOrder?: string[]
  heroVideoClickToNext?: boolean
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Fofora Tiyatro',
    siteTitle: 'Fofora Tiyatro - Sahnenin Gücü',
    description: 'Tiyatro eğitimi için profesyonel, yaratıcı ve ilham verici programlar sunuyoruz',
    primaryColor: '#c19a6b',
    secondaryColor: '#243b53',
    footerText: '© 2024 Fofora Tiyatro. Tüm hakları saklıdır.',
    socialMedia: [
      { platform: 'instagram', url: '', active: false },
      { platform: 'youtube', url: '', active: false }
    ],
    sectionVisibility: {
      hero: true,
      services: true,
      about: true,
      team: true,
      testimonials: true,
      instagram: true,
      blog: true,
      contact: true,
      gallery: true,
    },
    sectionOrder: ['hero', 'services', 'about', 'team', 'testimonials', 'gallery', 'instagram', 'blog', 'contact'],
    heroVideoClickToNext: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        // Ensure socialMedia is an array
        const socialMedia = Array.isArray(data.socialMedia)
          ? data.socialMedia
          : [
              { platform: 'instagram', url: '', active: false },
              { platform: 'youtube', url: '', active: false }
            ]

        // Ensure gallery is in sectionVisibility and sectionOrder
        const sectionVisibility = data.sectionVisibility || {}
        if (sectionVisibility.gallery === undefined) sectionVisibility.gallery = true

        const sectionOrder = data.sectionOrder || ['hero', 'services', 'about', 'team', 'testimonials', 'gallery', 'instagram', 'blog', 'contact']
        if (!sectionOrder.includes('gallery')) {
          // Insert gallery before instagram if possible
          const instagramIndex = sectionOrder.indexOf('instagram')
          if (instagramIndex >= 0) {
            sectionOrder.splice(instagramIndex, 0, 'gallery')
          } else {
            sectionOrder.push('gallery')
          }
        }

        setSettings({
          ...data,
          socialMedia,
          sectionVisibility: {
            hero: true,
            services: true,
            about: true,
            team: true,
            testimonials: true,
            instagram: true,
            blog: true,
            contact: true,
            gallery: true,
            ...sectionVisibility,
          },
          sectionOrder,
          heroVideoClickToNext: data.heroVideoClickToNext !== undefined ? data.heroVideoClickToNext : true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings', error)
    } finally {
      setLoading(false)
    }
  }

  const moveSectionUp = (index: number) => {
    if (index === 0 || !settings.sectionOrder) return
    const newOrder = [...settings.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    setSettings({ ...settings, sectionOrder: newOrder })
  }

  const moveSectionDown = (index: number) => {
    if (!settings.sectionOrder || index === settings.sectionOrder.length - 1) return
    const newOrder = [...settings.sectionOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    setSettings({ ...settings, sectionOrder: newOrder })
  }

  const getSectionName = (sectionId: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero Bölümü',
      services: 'Programlar',
      about: 'Hakkımızda',
      team: 'Ekip',
      testimonials: 'Yorumlar',
      gallery: 'Galeri',
      instagram: 'Instagram',
      blog: 'Blog',
      contact: 'İletişim'
    }
    return labels[sectionId] || sectionId
  }

  const toggleSectionVisibility = (sectionKey: string) => {
    setSettings({
      ...settings,
      sectionVisibility: {
        ...settings.sectionVisibility!,
        [sectionKey]: !settings.sectionVisibility?.[sectionKey as keyof typeof settings.sectionVisibility]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updatedSettings = { ...settings }

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
            <h2 className="text-2xl font-bold text-white mb-4">Logo</h2>
            <ImageUploader
              currentUrl={settings.logo}
              onUrlChange={(url) => setSettings({ ...settings, logo: url })}
              label="Site Logosu"
              folder="images/logos"
            />
            <p className="text-white/40 text-sm mt-4">PNG, JPG veya SVG. Maksimum 2MB.</p>
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
                  placeholder="Fofora Tiyatro"
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
                  placeholder="Fofora Tiyatro - Sahnenin Gücü"
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
                  placeholder="© 2024 Fofora Tiyatro. Tüm hakları saklıdır."
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

          {/* Sayfa Bölümleri Yönetimi - Merged Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Sayfa Bölümleri Yönetimi</h3>
            <p className="text-white/60 text-sm mb-6">
              Bölümlerin görünürlüğünü ve sırasını buradan yönetebilirsiniz.
              Yukarı/aşağı ok tuşları ile sıralamayı, toggle ile görünürlüğü ayarlayın.
            </p>

            <div className="space-y-3">
              {settings.sectionOrder?.map((sectionKey, index) => (
                <motion.div
                  key={sectionKey}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Order number */}
                  <div className="text-white/40 font-bold text-lg min-w-[30px]">
                    {index + 1}
                  </div>

                  {/* Section name */}
                  <div className="flex-1 text-white font-medium">
                    {getSectionName(sectionKey)}
                  </div>

                  {/* Visibility toggle */}
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(sectionKey)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      settings.sectionVisibility?.[sectionKey as keyof typeof settings.sectionVisibility]
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}
                  >
                    {settings.sectionVisibility?.[sectionKey as keyof typeof settings.sectionVisibility] ? 'Aktif' : 'Pasif'}
                  </button>

                  {/* Order controls */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSectionDown(index)}
                      disabled={index === settings.sectionOrder!.length - 1}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Instagram className="w-6 h-6 text-gold-500" />
              Sosyal Medya Linkleri
            </h2>

            <div className="space-y-4">
              {/* Instagram */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-white/70" />
                    <span className="text-white font-medium">Instagram</span>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.socialMedia?.find((s: any) => s.platform === 'instagram')?.active ?? false}
                      onChange={(e) => {
                        const newSocialMedia = settings.socialMedia?.map((s: any) =>
                          s.platform === 'instagram' ? { ...s, active: e.target.checked } : s
                        ) || []
                        setSettings({ ...settings, socialMedia: newSocialMedia })
                      }}
                      className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="ml-2 text-white/70 text-sm">Aktif</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.socialMedia?.find((s: any) => s.platform === 'instagram')?.url ?? ''}
                  onChange={(e) => {
                    const newSocialMedia = settings.socialMedia?.map((s: any) =>
                      s.platform === 'instagram' ? { ...s, url: e.target.value } : s
                    ) || []
                    setSettings({ ...settings, socialMedia: newSocialMedia })
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              {/* YouTube */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-white/70" />
                    <span className="text-white font-medium">YouTube</span>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.socialMedia?.find((s: any) => s.platform === 'youtube')?.active ?? false}
                      onChange={(e) => {
                        const newSocialMedia = settings.socialMedia?.map((s: any) =>
                          s.platform === 'youtube' ? { ...s, active: e.target.checked } : s
                        ) || []
                        setSettings({ ...settings, socialMedia: newSocialMedia })
                      }}
                      className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="ml-2 text-white/70 text-sm">Aktif</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.socialMedia?.find((s: any) => s.platform === 'youtube')?.url ?? ''}
                  onChange={(e) => {
                    const newSocialMedia = settings.socialMedia?.map((s: any) =>
                      s.platform === 'youtube' ? { ...s, url: e.target.value } : s
                    ) || []
                    setSettings({ ...settings, socialMedia: newSocialMedia })
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </div>

            <p className="text-white/40 text-sm mt-4">
              Not: Aktif olan sosyal medya ikonları navbar'da sağ tarafta görünecektir.
            </p>
          </div>

          {/* Hero Video Settings */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-6 h-6 text-gold-500" />
              Hero Video Ayarları
            </h2>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">Tıklayarak Sonraki Video</span>
                  <p className="text-white/50 text-sm mt-1">
                    Header alanına tıklandığında bir sonraki videoya geçilsin mi?
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.heroVideoClickToNext ?? true}
                    onChange={(e) => setSettings({ ...settings, heroVideoClickToNext: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="ml-2 text-white/70 text-sm">
                    {settings.heroVideoClickToNext ? 'Aktif' : 'Pasif'}
                  </span>
                </label>
              </div>
            </div>
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
            <li><strong>Programlar:</strong> Admin Programlar panelinden eğitim programlarını ekleyip düzenleyebilirsiniz</li>
            <li><strong>Hakkımızda:</strong> Admin Hakkımızda panelinden kurum bilgilerini güncelleyebilirsiniz</li>
            <li><strong>Ekip:</strong> Admin Ekip panelinden ekip üyelerini yönetebilirsiniz</li>
            <li><strong>Kayıtlar:</strong> Admin Kayıtlar ve Uygun Saatler panellerinden kayıt sistemini yönetebilirsiniz</li>
            <li><strong>Hero Videoları:</strong> Admin Videolar panelinden arka plan videolarını ve sıralarını ayarlayabilirsiniz</li>
            <li><strong>Galeri:</strong> Admin Galeri panelinden albümler oluşturabilir, fotoğraf/video ekleyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
