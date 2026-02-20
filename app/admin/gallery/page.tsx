'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, Image as ImageIcon, Film, Youtube,
  ChevronUp, ChevronDown, Eye, EyeOff, Folder, Upload, AlertTriangle, ExternalLink, Copy
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import ImageUploader from '@/components/ImageUploader'

interface GalleryItem {
  id: string
  albumId: string
  type: string
  url: string
  thumbnail?: string
  title?: string
  description?: string
  order: number
  active: boolean
}

interface GalleryAlbum {
  id: string
  title: string
  description?: string
  coverImage?: string
  order: number
  active: boolean
  items: GalleryItem[]
}

// Thumbnail component with error handling
function GalleryItemThumb({ item }: { item: GalleryItem }) {
  const [error, setError] = useState(false)

  const getYtId = (url: string) => {
    if (url.includes('youtu.be')) return url.split('youtu.be/')[1]?.split('?')[0]
    return url.split('v=')[1]?.split('&')[0]
  }

  const imgSrc = item.type === 'image'
    ? item.url
    : item.type === 'youtube'
      ? `https://img.youtube.com/vi/${getYtId(item.url)}/hqdefault.jpg`
      : item.thumbnail || null

  return (
    <div className="aspect-square bg-navy-800 relative">
      {error || !imgSrc ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-red-500/5">
          <AlertTriangle className="w-6 h-6 text-red-400/60" />
          <p className="text-red-400/60 text-[10px]">Yüklenemedi</p>
          {item.type !== 'youtube' && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-blue-400/60 hover:text-blue-400 mt-1"
            >
              <ExternalLink className="w-3 h-3" /> URL Test
            </a>
          )}
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={item.title || ''}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          loading="lazy"
        />
      )}

      {/* Type badge */}
      <div className="absolute top-2 left-2">
        {item.type === 'video' && (
          <span className="px-2 py-1 bg-purple-500/80 text-white text-xs rounded-full flex items-center gap-1">
            <Film className="w-3 h-3" /> Video
          </span>
        )}
        {item.type === 'youtube' && (
          <span className="px-2 py-1 bg-red-500/80 text-white text-xs rounded-full flex items-center gap-1">
            <Youtube className="w-3 h-3" /> YouTube
          </span>
        )}
      </div>
    </div>
  )
}

export default function AdminGallery() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)

  // Album form
  const [showAlbumForm, setShowAlbumForm] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null)
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', coverImage: '' })

  // Item form
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [itemForm, setItemForm] = useState({
    itemType: 'image',
    url: '',
    thumbnail: '',
    title: '',
    description: ''
  })

  // Bulk upload
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Keep ref in sync with selectedAlbum state (avoids stale closure)
  const selectedAlbumIdRef = useRef<string | null>(null)
  useEffect(() => {
    selectedAlbumIdRef.current = selectedAlbum?.id || null
  }, [selectedAlbum])

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const { data } = await axios.get('/api/gallery')
      setAlbums(data)
      // Refresh selected album using ref (avoids stale closure)
      const currentSelectedId = selectedAlbumIdRef.current
      if (currentSelectedId) {
        const updated = data.find((a: GalleryAlbum) => a.id === currentSelectedId)
        if (updated) setSelectedAlbum(updated)
      }
    } catch (error) {
      console.error('Failed to fetch gallery albums', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== ALBUM OPERATIONS =====
  const openAlbumForm = (album?: GalleryAlbum) => {
    if (album) {
      setEditingAlbum(album)
      setAlbumForm({
        title: album.title,
        description: album.description || '',
        coverImage: album.coverImage || ''
      })
    } else {
      setEditingAlbum(null)
      setAlbumForm({ title: '', description: '', coverImage: '' })
    }
    setShowAlbumForm(true)
  }

  const saveAlbum = async () => {
    if (!albumForm.title.trim()) return alert('Albüm adı gereklidir')

    try {
      if (editingAlbum) {
        await axios.put('/api/gallery', {
          type: 'album',
          id: editingAlbum.id,
          title: albumForm.title,
          description: albumForm.description || null,
          coverImage: albumForm.coverImage || null,
        })
      } else {
        await axios.post('/api/gallery', {
          type: 'album',
          title: albumForm.title,
          description: albumForm.description || null,
          coverImage: albumForm.coverImage || null,
          order: albums.length,
        })
      }
      setShowAlbumForm(false)
      fetchAlbums()
    } catch (error) {
      console.error('Album save error:', error)
      alert('Albüm kaydedilemedi')
    }
  }

  const deleteAlbum = async (albumId: string) => {
    if (!confirm('Bu albümü ve tüm içeriğini silmek istediğinize emin misiniz?')) return

    try {
      await axios.delete(`/api/gallery?type=album&id=${albumId}`)
      if (selectedAlbum?.id === albumId) setSelectedAlbum(null)
      fetchAlbums()
    } catch (error) {
      console.error('Album delete error:', error)
      alert('Albüm silinemedi')
    }
  }

  const toggleAlbumActive = async (album: GalleryAlbum) => {
    try {
      await axios.put('/api/gallery', {
        type: 'album',
        id: album.id,
        active: !album.active,
      })
      fetchAlbums()
    } catch (error) {
      console.error('Album toggle error:', error)
    }
  }

  const moveAlbum = async (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= albums.length) return

    const album1 = albums[index]
    const album2 = albums[newIndex]

    try {
      await Promise.all([
        axios.put('/api/gallery', { type: 'album', id: album1.id, order: newIndex }),
        axios.put('/api/gallery', { type: 'album', id: album2.id, order: index }),
      ])
      fetchAlbums()
    } catch (error) {
      console.error('Album move error:', error)
    }
  }

  // ===== ITEM OPERATIONS =====
  const openItemForm = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        itemType: item.type,
        url: item.url,
        thumbnail: item.thumbnail || '',
        title: item.title || '',
        description: item.description || '',
      })
    } else {
      setEditingItem(null)
      setItemForm({ itemType: 'image', url: '', thumbnail: '', title: '', description: '' })
    }
    setShowItemForm(true)
  }

  const saveItem = async () => {
    if (!itemForm.url.trim()) return alert('URL gereklidir')
    if (!selectedAlbum) return alert('Lütfen bir albüm seçin')

    try {
      if (editingItem) {
        await axios.put('/api/gallery', {
          type: 'item',
          id: editingItem.id,
          itemType: itemForm.itemType,
          url: itemForm.url,
          thumbnail: itemForm.thumbnail || null,
          title: itemForm.title || null,
          description: itemForm.description || null,
        })
      } else {
        await axios.post('/api/gallery', {
          type: 'item',
          albumId: selectedAlbum.id,
          itemType: itemForm.itemType,
          url: itemForm.url,
          thumbnail: itemForm.thumbnail || null,
          title: itemForm.title || null,
          description: itemForm.description || null,
          order: selectedAlbum.items.length,
        })
      }
      setShowItemForm(false)
      fetchAlbums()
    } catch (error) {
      console.error('Item save error:', error)
      alert('Öğe kaydedilemedi')
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return

    try {
      await axios.delete(`/api/gallery?type=item&id=${itemId}`)
      fetchAlbums()
    } catch (error) {
      console.error('Item delete error:', error)
      alert('Öğe silinemedi')
    }
  }

  const toggleItemActive = async (item: GalleryItem) => {
    try {
      await axios.put('/api/gallery', {
        type: 'item',
        id: item.id,
        active: !item.active,
      })
      fetchAlbums()
    } catch (error) {
      console.error('Item toggle error:', error)
    }
  }

  const moveItem = async (index: number, direction: number) => {
    if (!selectedAlbum) return
    const items = selectedAlbum.items.sort((a, b) => a.order - b.order)
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return

    const item1 = items[index]
    const item2 = items[newIndex]

    try {
      await Promise.all([
        axios.put('/api/gallery', { type: 'item', id: item1.id, order: newIndex }),
        axios.put('/api/gallery', { type: 'item', id: item2.id, order: index }),
      ])
      fetchAlbums()
    } catch (error) {
      console.error('Item move error:', error)
    }
  }

  // ===== BULK UPLOAD =====
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAlbum || !e.target.files) return

    const files = Array.from(e.target.files)
    setBulkUploading(true)
    setBulkProgress({ current: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const isVideo = file.type.startsWith('video/')
        const folder = isVideo ? 'gallery/videos' : 'gallery/images'

        // Get presigned URL
        const presignedRes = await axios.post('/api/upload/presigned-url', {
          fileName: file.name,
          contentType: file.type,
          folder,
        })

        const { presignedUrl, publicUrl } = presignedRes.data

        // Upload to R2
        await axios.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
        })

        // Create gallery item
        await axios.post('/api/gallery', {
          type: 'item',
          albumId: selectedAlbum.id,
          itemType: isVideo ? 'video' : 'image',
          url: publicUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          order: selectedAlbum.items.length + i,
        })

        setBulkProgress({ current: i + 1, total: files.length })
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error)
      }
    }

    setBulkUploading(false)
    setBulkProgress({ current: 0, total: 0 })
    fetchAlbums()
    e.target.value = ''
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white">Galeri Yönetimi</h1>
            <p className="text-white/60">Albümler, fotoğraflar ve videolar</p>
          </div>
          <button
            onClick={() => openAlbumForm()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni Albüm
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Albums Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-gold-500" />
              Albümler ({albums.length})
            </h2>

            <div className="space-y-3">
              {albums.sort((a, b) => a.order - b.order).map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAlbum(album)}
                  className={`rounded-xl p-4 cursor-pointer transition-all border ${
                    selectedAlbum?.id === album.id
                      ? 'bg-gold-500/20 border-gold-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Cover Image Preview */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-navy-800">
                      {album.coverImage ? (
                        <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Folder className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold truncate">{album.title}</h3>
                        {!album.active && (
                          <span className="text-xs px-2 py-0.5 bg-gray-500/30 text-gray-400 rounded">Pasif</span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">
                        {album.items.length} öğe
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAlbumActive(album) }}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title={album.active ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {album.active ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openAlbumForm(album) }}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAlbum(album.id) }}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Order Controls */}
                  <div className="flex gap-1 mt-2 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, -1) }}
                      disabled={index === 0}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronUp className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, 1) }}
                      disabled={index === albums.length - 1}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronDown className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {albums.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <Folder className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">Henüz albüm yok</p>
                  <button
                    onClick={() => openAlbumForm()}
                    className="mt-3 text-gold-400 hover:text-gold-300 text-sm"
                  >
                    İlk albümünüzü oluşturun
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Album Content Area */}
          <div className="lg:col-span-2">
            {selectedAlbum ? (
              <>
                {/* Album Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAlbum.title}</h2>
                    {selectedAlbum.description && (
                      <p className="text-white/50 text-sm mt-1">{selectedAlbum.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* Bulk Upload */}
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Toplu Yükle
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleBulkUpload}
                        className="hidden"
                        disabled={bulkUploading}
                      />
                    </label>
                    <button
                      onClick={() => openItemForm()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Öğe Ekle
                    </button>
                  </div>
                </div>

                {/* Bulk Upload Progress */}
                {bulkUploading && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 text-sm font-medium">Yükleniyor...</span>
                      <span className="text-white/60 text-sm">{bulkProgress.current} / {bulkProgress.total}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-gold-600 to-gold-400 h-2 rounded-full transition-all"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedAlbum.items
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group relative rounded-xl overflow-hidden border ${
                          item.active ? 'border-white/10' : 'border-red-500/30 opacity-50'
                        }`}
                      >
                        {/* Thumbnail */}
                        <GalleryItemThumb item={item} />

                        {/* Info */}
                        <div className="p-3 bg-white/5">
                          <p className="text-white text-sm font-medium truncate">{item.title || 'Başlıksız'}</p>
                          {item.description && (
                            <p className="text-white/40 text-xs truncate mt-0.5">{item.description}</p>
                          )}
                          <p className="text-white/20 text-[10px] truncate mt-1 font-mono">{item.url}</p>
                        </div>

                        {/* Hover Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleItemActive(item)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title={item.active ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {item.active ? (
                              <Eye className="w-4 h-4 text-green-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                          <button
                            onClick={() => openItemForm(item)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0}
                              className="p-1 bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 transition-colors"
                            >
                              <ChevronUp className="w-3 h-3 text-white" />
                            </button>
                            <button
                              onClick={() => moveItem(index, 1)}
                              disabled={index === selectedAlbum.items.length - 1}
                              className="p-1 bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 transition-colors"
                            >
                              <ChevronDown className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {selectedAlbum.items.length === 0 && (
                  <div className="text-center py-16 bg-white/5 rounded-xl border border-dashed border-white/20">
                    <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 text-lg mb-2">Bu albümde henüz içerik yok</p>
                    <p className="text-white/30 text-sm mb-4">Fotoğraf, video veya YouTube linki ekleyin</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openItemForm()}
                        className="px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors"
                      >
                        Tek Öğe Ekle
                      </button>
                      <label className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                        Toplu Yükle
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleBulkUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white/5 rounded-xl border border-dashed border-white/20">
                <div className="text-center">
                  <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">Bir albüm seçin veya yeni albüm oluşturun</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album Form Modal */}
      <AnimatePresence>
        {showAlbumForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAlbumForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-800 rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingAlbum ? 'Albümü Düzenle' : 'Yeni Albüm'}
                </h3>
                <button onClick={() => setShowAlbumForm(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Albüm Adı *</label>
                  <input
                    type="text"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    placeholder="Örn: 2024 Sezon Oyunları"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Açıklama</label>
                  <textarea
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    rows={3}
                    placeholder="Albüm hakkında kısa açıklama..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  />
                </div>

                <ImageUploader
                  key={`album-cover-${editingAlbum?.id || 'new'}`}
                  currentUrl={albumForm.coverImage}
                  onUrlChange={(url) => setAlbumForm({ ...albumForm, coverImage: url })}
                  label="Kapak Fotoğrafı"
                  folder="gallery/covers"
                />
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowAlbumForm(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={saveAlbum}
                  className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingAlbum ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showItemForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowItemForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-800 rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}
                </h3>
                <button onClick={() => setShowItemForm(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Tür *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'image', label: 'Fotoğraf', icon: <ImageIcon className="w-5 h-5" /> },
                      { value: 'video', label: 'Video', icon: <Film className="w-5 h-5" /> },
                      { value: 'youtube', label: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, itemType: opt.value })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          itemForm.itemType === opt.value
                            ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {opt.icon}
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL / Upload */}
                {itemForm.itemType === 'youtube' ? (
                  <div>
                    <label className="block text-white mb-2 text-sm font-medium">YouTube URL *</label>
                    <input
                      type="url"
                      value={itemForm.url}
                      onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                ) : (
                  <ImageUploader
                    key={`item-url-${editingItem?.id || 'new'}-${itemForm.itemType}`}
                    currentUrl={itemForm.url}
                    onUrlChange={(url) => setItemForm({ ...itemForm, url })}
                    label={itemForm.itemType === 'video' ? 'Video Dosyası *' : 'Fotoğraf *'}
                    folder={itemForm.itemType === 'video' ? 'gallery/videos' : 'gallery/images'}
                    acceptVideo={itemForm.itemType === 'video'}
                  />
                )}

                {/* Thumbnail (for video) */}
                {itemForm.itemType === 'video' && (
                  <ImageUploader
                    key={`item-thumb-${editingItem?.id || 'new'}`}
                    currentUrl={itemForm.thumbnail}
                    onUrlChange={(url) => setItemForm({ ...itemForm, thumbnail: url })}
                    label="Küçük Resim (Opsiyonel)"
                    folder="gallery/thumbnails"
                  />
                )}

                {/* Title */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Başlık</label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="Fotoğraf/video başlığı"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Açıklama</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    rows={3}
                    placeholder="Alt yazı / açıklama..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowItemForm(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={saveItem}
                  className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
