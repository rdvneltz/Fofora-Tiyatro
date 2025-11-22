'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, Upload, Star } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  title: string
  content: string
  rating: number
  image?: string
  videoUrl?: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function TestimonialsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
    rating: 5,
    image: '',
    videoUrl: '',
    active: true,
    order: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get('/api/testimonials')
      setTestimonials(data)
    } catch (error) {
      console.error('Yorumlar yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = formData.image

      // Upload image if changed
      if (imageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', imageFile)

        const uploadRes = await axios.post('/api/upload', formDataUpload)
        imageUrl = uploadRes.data.url
      }

      const updatedData = { ...formData, image: imageUrl }

      if (editingTestimonial) {
        await axios.put('/api/testimonials', { id: editingTestimonial.id, ...updatedData })
      } else {
        await axios.post('/api/testimonials', updatedData)
      }
      setShowForm(false)
      setEditingTestimonial(null)
      setImageFile(null)
      setImagePreview('')
      setFormData({
        name: '',
        title: '',
        content: '',
        rating: 5,
        image: '',
        videoUrl: '',
        active: true,
        order: 0,
      })
      fetchTestimonials()
    } catch (error) {
      console.error('İşlem başarısız', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      title: testimonial.title,
      content: testimonial.content,
      rating: testimonial.rating,
      image: testimonial.image || '',
      videoUrl: testimonial.videoUrl || '',
      active: testimonial.active,
      order: testimonial.order,
    })
    setImagePreview(testimonial.image || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`/api/testimonials?id=${id}`)
      fetchTestimonials()
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
            <h1 className="text-4xl font-bold text-white">Öğrenci Yorumları Yönetimi</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingTestimonial(null)
              setFormData({
                name: '',
                title: '',
                content: '',
                rating: 5,
                image: '',
                videoUrl: '',
                active: true,
                order: 0,
              })
              setImagePreview('')
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-gold-700 hover:to-gold-600"
          >
            <Plus className="w-5 h-5" />
            Yeni Yorum Ekle
          </button>
        </div>

        {showForm && (
          <div className="glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingTestimonial ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gold-500" />
                  Öğrenci Fotoğrafı (İsteğe Bağlı)
                </h3>

                <div className="flex items-start gap-6">
                  {(imagePreview || formData.image) && (
                    <div className="relative w-32 h-32 bg-white/10 rounded-full overflow-hidden border border-white/20">
                      <Image
                        src={imagePreview || formData.image}
                        alt="Öğrenci"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block text-white mb-2">Fotoğraf Yükle</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                    />
                    <p className="text-white/40 text-sm mt-2">JPG, PNG veya WebP. Maksimum 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">İsim</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Ünvan</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                    placeholder="Örn: Şirket Sahibi, Mimar, vb."
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Yorum</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Video URL (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  placeholder="YouTube URL veya yerel video yolu: /videos/testimonial1.mp4"
                />
                <p className="text-white/40 text-sm mt-1">
                  YouTube URL (örn: https://youtube.com/watch?v=...) veya yerel video yolu girebilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Puan (1-5)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) })}
                      className="w-24 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                      min="1"
                      max="5"
                      required
                    />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Sıra</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
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
                    setEditingTestimonial(null)
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
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.image && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
                    <p className="text-gold-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm mb-3">{testimonial.content.substring(0, 150)}...</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Sıra: {testimonial.order}</span>
                <span className={`px-2 py-1 rounded ${testimonial.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {testimonial.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-white mb-4">Henüz yorum yok</h2>
            <p className="text-white/70">
              İlk öğrenci yorumunu eklemek için yukarıdaki "Yeni Yorum Ekle" butonuna tıklayın.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
