'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import Image from 'next/image'

interface TeamMember {
  id: string
  name: string
  title: string
  bio: string
  image: string
  email?: string
  phone?: string
  order: number
  active: boolean
}

export default function TeamPage() {
  const { status } = useSession()
  const router = useRouter()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image: '/assets/av-faruk-celep-foto.jpeg',
    email: '',
    phone: '',
    order: 0,
    active: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get('/api/team')
      setTeam(data)
    } catch (error) {
      console.error('Ekip yüklenemedi', error)
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

      if (editingMember) {
        await axios.put('/api/team', { id: editingMember.id, ...updatedData })
      } else {
        await axios.post('/api/team', updatedData)
      }
      setShowForm(false)
      setEditingMember(null)
      setImageFile(null)
      setImagePreview('')
      setFormData({ name: '', title: '', bio: '', image: '/assets/av-faruk-celep-foto.jpeg', email: '', phone: '', order: 0, active: true })
      fetchTeam()
    } catch (error) {
      console.error('İşlem başarısız', error)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      title: member.title,
      bio: member.bio,
      image: member.image,
      email: member.email || '',
      phone: member.phone || '',
      order: member.order,
      active: member.active,
    })
    setImagePreview(member.image)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ekip üyesini silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`/api/team?id=${id}`)
      fetchTeam()
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
            <h1 className="text-4xl font-bold text-white">Ekip Yönetimi</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingMember(null)
              setFormData({ name: '', title: '', bio: '', image: '/assets/av-faruk-celep-foto.jpeg', email: '', phone: '', order: 0, active: true })
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-gold-700 hover:to-gold-600"
          >
            <Plus className="w-5 h-5" />
            Yeni Ekip Üyesi
          </button>
        </div>

        {showForm && (
          <div className="glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingMember ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fotoğraf Upload */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gold-500" />
                  Ekip Üyesi Fotoğrafı
                </h3>

                <div className="flex items-start gap-6">
                  {(imagePreview || formData.image) && (
                    <div className="relative w-48 h-48 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                      <Image
                        src={imagePreview || formData.image}
                        alt="Ekip Üyesi"
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
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Biyografi</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Sıra</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
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
                    setEditingMember(null)
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
          {team.map((member) => (
            <div key={member.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-gold-400">{member.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-2">{member.bio.substring(0, 100)}...</p>
              <div className="text-gold-500 text-xs">Sıra: {member.order}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
