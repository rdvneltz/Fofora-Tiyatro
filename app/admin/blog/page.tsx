'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, X } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import Image from 'next/image'
import ImageUploader from '@/components/ImageUploader'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image?: string
  category: string
  tags: string[]
  videoUrl?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function BlogPage() {
  const { status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    category: '',
    tags: [] as string[],
    videoUrl: '',
    published: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/api/blog?admin=true')
      setPosts(data)
    } catch (error) {
      console.error('Blog yazıları yüklenemedi', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPost) {
        await axios.put('/api/blog', { id: editingPost.id, ...formData })
      } else {
        await axios.post('/api/blog', formData)
      }
      setShowForm(false)
      setEditingPost(null)
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image: '',
        category: '',
        tags: [],
        videoUrl: '',
        published: false,
      })
      fetchPosts()
    } catch (error) {
      console.error('İşlem başarısız', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      image: post.image || '',
      category: post.category,
      tags: post.tags,
      videoUrl: post.videoUrl || '',
      published: post.published,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`/api/blog?id=${id}`)
      fetchPosts()
    } catch (error) {
      console.error('Silme başarısız', error)
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      await axios.put('/api/blog', {
        id: post.id,
        published: !post.published,
      })
      fetchPosts()
    } catch (error) {
      console.error('Yayın durumu değiştirilemedi', error)
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
            <h1 className="text-4xl font-bold text-white">Blog Yönetimi</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingPost(null)
              setFormData({
                title: '',
                slug: '',
                content: '',
                excerpt: '',
                image: '',
                category: '',
                tags: [],
                videoUrl: '',
                published: false,
              })
            }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-gold-700 hover:to-gold-600"
          >
            <Plus className="w-5 h-5" />
            Yeni Blog Yazısı
          </button>
        </div>

        {showForm && (
          <div className="glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Featured Image Upload */}
              <ImageUploader
                currentUrl={formData.image}
                onUrlChange={(url) => setFormData({ ...formData, image: url })}
                label="Öne Çıkan Görsel"
                folder="images/blog"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Özet</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">İçerik</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-mono"
                  rows={12}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Kategori</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              {/* Video Upload */}
              <ImageUploader
                currentUrl={formData.videoUrl}
                onUrlChange={(url) => setFormData({ ...formData, videoUrl: url })}
                label="Video (Opsiyonel)"
                folder="videos/blog"
                acceptVideo={true}
              />

              <div>
                <label className="block text-white mb-2">Etiketler</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    placeholder="Etiket ekle ve Enter'a bas"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-gold-500 text-white px-4 py-3 rounded-lg hover:bg-gold-600"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center text-white gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5"
                  />
                  Yayınla
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
                    setEditingPost(null)
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
          {posts.map((post) => (
            <div key={post.id} className="glass rounded-xl p-6">
              {post.image && (
                <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{post.title}</h3>
                  <p className="text-gold-400 text-sm">{post.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublish(post)}
                    className={`${
                      post.published ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'
                    }`}
                    title={post.published ? 'Yayından kaldır' : 'Yayınla'}
                  >
                    {post.published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(post)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-3">{post.excerpt.substring(0, 100)}...</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-white/10 text-white/60 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-white/40 text-xs">
                {new Date(post.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-white mb-4">Henüz blog yazısı yok</h2>
            <p className="text-white/70">
              İlk blog yazınızı oluşturmak için yukarıdaki "Yeni Blog Yazısı" butonuna tıklayın.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
