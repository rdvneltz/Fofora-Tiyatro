'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import Image from 'next/image'
import ImageUploader from '@/components/ImageUploader'
import FocalPointPicker from '@/components/FocalPointPicker'

interface TeamMember {
  id: string
  name: string
  title: string
  bio: string
  image: string
  imagePosX?: number
  imagePosY?: number
  email?: string
  phone?: string
  linkedin?: string
  order: number
  active: boolean
}

const emptyForm = { name: '', title: '', bio: '', image: '', imagePosX: 50, imagePosY: 50, email: '', phone: '', linkedin: '', order: 0, active: true }

export default function TeamPage() {
  const { status } = useSession()
  const router = useRouter()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

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
      const { data } = await axios.get('/api/team?admin=true')
      setTeam(data)
    } catch (error) {
      console.error('Ekip yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUploading) {
      alert('Fotoğraf hâlâ yükleniyor, lütfen yükleme bitene kadar bekleyin.')
      return
    }
    try {
      if (editingMember) {
        await axios.put('/api/team', { id: editingMember.id, ...formData })
      } else {
        await axios.post('/api/team', formData)
      }
      setShowForm(false)
      setEditingMember(null)
      setFormData(emptyForm)
      fetchTeam()
    } catch (error) {
      console.error('İşlem başarısız', error)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setImageUploading(false)
    setFormData({
      name: member.name,
      title: member.title,
      bio: member.bio,
      image: member.image,
      imagePosX: member.imagePosX ?? 50,
      imagePosY: member.imagePosY ?? 50,
      email: member.email || '',
      phone: member.phone || '',
      linkedin: member.linkedin || '',
      order: member.order,
      active: member.active,
    })
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

  const toggleActive = async (member: TeamMember) => {
    try {
      await axios.put('/api/team', { ...member, active: !member.active })
      fetchTeam()
    } catch (error) {
      console.error('Durum güncellenemedi', error)
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
              setImageUploading(false)
              setFormData(emptyForm)
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
              <ImageUploader
                currentUrl={formData.image}
                onUrlChange={(url) => setFormData({ ...formData, image: url })}
                onUploadingChange={setImageUploading}
                label="Ekip Üyesi Fotoğrafı"
                folder="images/team"
              />

              {formData.image && (
                <FocalPointPicker
                  imageUrl={formData.image}
                  posX={formData.imagePosX}
                  posY={formData.imagePosY}
                  onChange={(x, y) => setFormData({ ...formData, imagePosX: x, imagePosY: y })}
                />
              )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-white mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
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
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={imageUploading}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageUploading ? 'Fotoğraf yükleniyor…' : 'Kaydet'}
                </button>
                {imageUploading && (
                  <span className="text-gold-400 text-sm">Fotoğraf yüklenene kadar bekleyin, aksi halde eski fotoğraf kaydedilir.</span>
                )}
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
            <div key={member.id} className={`glass rounded-xl p-6 ${!member.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-navy-900/50 border border-white/10 flex-shrink-0">
                  {member.image ? (
                    <Image src={member.image} alt={member.name} fill sizes="64px" className="object-cover" style={{ objectPosition: `${member.imagePosX ?? 50}% ${member.imagePosY ?? 50}%` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs text-center px-1">Fotoğraf yok</div>
                  )}
                </div>
                <div className="flex-1 flex items-start justify-between">
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
              </div>
              <p className="text-white/70 text-sm mb-2">{member.bio.substring(0, 100)}...</p>
              <div className="flex items-center justify-between">
                <div className="text-gold-500 text-xs">Sıra: {member.order}</div>
                <button
                  onClick={() => toggleActive(member)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${member.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}
                >
                  {member.active ? 'Yayında' : 'Pasif'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
