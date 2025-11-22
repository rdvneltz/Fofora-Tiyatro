'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface Service {
  id: string
  title: string
  description: string
  icon: string
  details: string
  image?: string
  ageGroup?: string
  duration?: string
  order: number
  active: boolean
}

export default function ServicesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Scale',
    details: '',
    image: '',
    ageGroup: '',
    duration: '',
    order: 0,
    active: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/api/services')
      setServices(data)
    } catch (error) {
      console.error('Programlar yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingService) {
        await axios.put('/api/services', { id: editingService.id, ...formData })
      } else {
        await axios.post('/api/services', formData)
      }
      setShowForm(false)
      setEditingService(null)
      setFormData({ title: '', description: '', icon: 'Scale', details: '', image: '', ageGroup: '', duration: '', order: 0, active: true })
      fetchServices()
    } catch (error) {
      console.error('İşlem başarısız', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      details: service.details,
      image: service.image || '',
      ageGroup: service.ageGroup || '',
      duration: service.duration || '',
      order: service.order,
      active: service.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu programı silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`/api/services?id=${id}`)
      fetchServices()
    } catch (error) {
      console.error('Silme başarısız', error)
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl font-bold text-white">Eğitim Programları Yönetimi</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingService(null)
              setFormData({ title: '', description: '', icon: 'Scale', details: '', image: '', ageGroup: '', duration: '', order: 0, active: true })
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-gold-700 hover:to-gold-600"
          >
            <Plus className="w-5 h-5" />
            Yeni Program
          </button>
        </div>

        {showForm && (
          <div className="glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingService ? 'Program Düzenle' : 'Yeni Program Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-white mb-2">İkon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Kısa Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Detaylı Açıklama</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={5}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Program Fotoğrafı URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-white/50 text-sm mt-1">Örnek: /assets/programs/cocuk-drama.jpg</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Yaş Grubu</label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    placeholder="örn: 4-6 yaş"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Süre</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    placeholder="örn: 3 ay"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Sıra</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-white gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5"
                    />
                    Aktif
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingService(null)
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{service.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-2">{service.description}</p>
              <div className="text-gold-500 text-xs">Sıra: {service.order}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
