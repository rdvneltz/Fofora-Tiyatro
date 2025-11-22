'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Trash2, Plus, Instagram as InstagramIcon, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface InstagramPost {
  id: string
  postUrl: string
  order: number
  active: boolean
}

export default function AdminInstagram() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostUrl, setNewPostUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; postId: string | null; postUrl: string }>({
    show: false,
    postId: null,
    postUrl: ''
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
      const { data } = await axios.get('/api/instagram-posts')
      setPosts(data.sort((a: InstagramPost, b: InstagramPost) => a.order - b.order))
    } catch (error) {
      console.error('Failed to fetch Instagram posts', error)
    } finally {
      setLoading(false)
    }
  }

  const syncInstagram = async () => {
    if (syncing) return

    setSyncing(true)
    try {
      const { data } = await axios.post('/api/instagram-posts/sync')

      if (data.success) {
        alert(`✅ ${data.count} Instagram post senkronize edildi!`)
        fetchPosts()
      } else {
        alert('❌ Instagram senkronizasyonu başarısız oldu')
      }
    } catch (error: any) {
      console.error('Instagram sync error:', error)
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Bilinmeyen hata'
      alert(`❌ Hata: ${errorMsg}\n\nLütfen .env.local dosyasında INSTAGRAM_ACCESS_TOKEN ve INSTAGRAM_USER_ID değerlerini kontrol edin.`)
    } finally {
      setSyncing(false)
    }
  }

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = newPostUrl.trim()
    if (!url) {
      alert('Lütfen Instagram post URL\'si girin')
      return
    }

    // Validate Instagram URL
    if (!url.includes('instagram.com')) {
      alert('Geçerli bir Instagram URL\'si girin (örn: https://www.instagram.com/p/ABC123/)')
      return
    }

    try {
      const maxOrder = posts.length > 0 ? Math.max(...posts.map(p => p.order)) : -1
      await axios.post('/api/instagram-posts', {
        postUrl: url,
        order: maxOrder + 1,
        active: true
      })
      setNewPostUrl('')
      fetchPosts()
    } catch (error) {
      alert('Post eklenemedi')
    }
  }

  const movePost = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === posts.length - 1)
    ) {
      return
    }

    const newPosts = [...posts]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Swap
    const temp = newPosts[index]
    newPosts[index] = newPosts[targetIndex]
    newPosts[targetIndex] = temp

    // Update orders
    for (let i = 0; i < newPosts.length; i++) {
      await axios.put('/api/instagram-posts', {
        id: newPosts[i].id,
        order: i
      })
    }

    fetchPosts()
  }

  const toggleActive = async (post: InstagramPost) => {
    try {
      await axios.put('/api/instagram-posts', {
        id: post.id,
        active: !post.active
      })
      fetchPosts()
    } catch (error) {
      alert('Güncelleme başarısız oldu')
    }
  }

  const handleDeleteClick = (post: InstagramPost) => {
    setDeleteConfirm({
      show: true,
      postId: post.id,
      postUrl: post.postUrl
    })
  }

  const confirmDelete = async () => {
    const { postId } = deleteConfirm
    if (!postId) return

    try {
      await axios.delete(`/api/instagram-posts?id=${postId}`)
      alert('Post başarıyla silindi')
      setDeleteConfirm({ show: false, postId: null, postUrl: '' })
      fetchPosts()
    } catch (error) {
      alert('Silme işlemi başarısız oldu')
      setDeleteConfirm({ show: false, postId: null, postUrl: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, postId: null, postUrl: '' })
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-4xl font-bold text-white">Instagram Post Yönetimi</h1>
            </div>
            <button
              onClick={syncInstagram}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Senkronize Ediliyor...
                </>
              ) : (
                <>
                  <InstagramIcon className="w-5 h-5" />
                  Instagram'dan Çek
                </>
              )}
            </button>
          </div>
          <p className="text-white/60">
            {posts.length} Instagram post yönetiliyor. Instagram'dan otomatik çekebilir veya manuel ekleyebilirsiniz.
          </p>
        </div>

        {/* Add Post Form */}
        <form onSubmit={addPost} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 text-sm font-medium">Instagram Post URL</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/ABC123/"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Ekle
                </button>
              </div>
              <p className="text-white/40 text-xs mt-1">
                Instagram post, reel veya story URL'sini girin. Örnek: https://www.instagram.com/p/ABC123/
              </p>
            </div>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <p className="text-white/60 text-lg">Henüz Instagram post eklenmemiş</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all ${
                  post.active ? 'border-purple-500/50' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Order Number */}
                  <div className="flex flex-col items-center">
                    <div className="text-white/40 text-xs mb-1">Sıra</div>
                    <div className="bg-white/10 rounded-lg px-4 py-2 text-white font-bold text-xl min-w-[60px] text-center">
                      {index + 1}
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <InstagramIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold text-sm truncate">{post.postUrl}</span>
                    </div>
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs underline"
                    >
                      Instagram'da Görüntüle
                    </a>
                  </div>

                  {/* Status */}
                  <button
                    onClick={() => toggleActive(post)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      post.active
                        ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50 hover:bg-gray-500/30'
                    }`}
                  >
                    {post.active ? 'Aktif' : 'Pasif'}
                  </button>

                  {/* Move Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => movePost(index, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Yukarı Taşı"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => movePost(index, 'down')}
                      disabled={index === posts.length - 1}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aşağı Taşı"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(post)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
            <InstagramIcon className="w-5 h-5" />
            Önemli Notlar
          </h3>
          <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
            <li>Instagram post, reel veya story URL'sini girebilirsiniz</li>
            <li>URL formatı: https://www.instagram.com/p/POST_ID/</li>
            <li>Postlar otomatik olarak Instagram embed ile görüntülenir</li>
            <li>Pasif postlar ana sayfada görünmez</li>
            <li>Sıralamayı yukarı/aşağı butonlarıyla değiştirebilirsiniz</li>
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-800 rounded-xl p-8 max-w-md w-full mx-4 border border-red-500/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Post Sil</h3>
            </div>

            <p className="text-white/80 mb-2">Bu Instagram post'unu listeden çıkarmak istediğinizden emin misiniz?</p>
            <p className="text-purple-400 font-semibold mb-6 truncate">{deleteConfirm.postUrl}</p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
