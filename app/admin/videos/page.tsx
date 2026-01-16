'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Video as VideoIcon,
  ArrowLeft,
  Star,
  Edit3,
  X,
  Clock,
  Repeat,
  Type,
  FileText,
  Sparkles
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface HeroVideo {
  id: string
  fileName: string
  order: number
  active: boolean
  title?: string | null
  subtitle?: string | null
  description?: string | null
  useCustomContent?: boolean
  playDuration?: number | null
  playCount?: number
  featured?: boolean
  featuredWeight?: number
}

export default function AdminVideos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [newVideoName, setNewVideoName] = useState('')
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; videoId: string | null; videoName: string }>({
    show: false,
    videoId: null,
    videoName: ''
  })
  const [randomPlay, setRandomPlay] = useState(false)
  const [editingVideo, setEditingVideo] = useState<HeroVideo | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchVideos()
    fetchSettings()
  }, [])

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get('/api/hero-videos')
      setVideos(data.sort((a: HeroVideo, b: HeroVideo) => a.order - b.order))
    } catch (error) {
      console.error('Failed to fetch videos', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      setRandomPlay(data?.heroVideoRandomPlay || false)
    } catch (error) {
      console.error('Failed to fetch settings', error)
    }
  }

  const toggleRandomPlay = async () => {
    try {
      const newValue = !randomPlay
      await axios.patch('/api/settings', {
        heroVideoRandomPlay: newValue
      })
      setRandomPlay(newValue)
    } catch (error) {
      console.error('Failed to update random play setting', error)
      alert('Ayar güncellenemedi')
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setVideoFiles(fileArray)
      setTotalFiles(fileArray.length)
      setNewVideoName(fileArray[0].name)
    }
  }

  const uploadSingleVideo = async (file: File, index: number, total: number) => {
    try {
      console.log(`[${index + 1}/${total}] Getting presigned URL for:`, file.name)

      const presignedRes = await axios.post('/api/upload/presigned-url', {
        fileName: file.name,
        contentType: file.type || 'video/mp4'
      })

      const { presignedUrl, publicUrl } = presignedRes.data
      console.log(`[${index + 1}/${total}] Presigned URL received, uploading to R2...`)

      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type || 'video/mp4'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      })

      console.log(`[${index + 1}/${total}] Video uploaded successfully to R2`)
      return publicUrl
    } catch (error) {
      console.error(`[${index + 1}/${total}] Video yükleme hatası:`, error)
      return null
    }
  }

  const uploadVideos = async () => {
    if (videoFiles.length === 0) return []

    setUploading(true)
    setShowProgress(true)
    setUploadProgress(0)
    setCurrentUploadIndex(0)

    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < videoFiles.length; i++) {
        setCurrentUploadIndex(i + 1)
        const publicUrl = await uploadSingleVideo(videoFiles[i], i, videoFiles.length)
        if (publicUrl) {
          uploadedUrls.push(publicUrl)
        }
      }

      setTimeout(() => {
        setShowProgress(false)
        setUploadProgress(0)
        setCurrentUploadIndex(0)
      }, 2000)

      return uploadedUrls
    } catch (error) {
      console.error('Toplu video yükleme hatası:', error)
      alert('Bazı videolar yüklenemedi. Lütfen kontrol edin.')
      setShowProgress(false)
      setUploadProgress(0)
      setCurrentUploadIndex(0)
      return uploadedUrls
    } finally {
      setUploading(false)
    }
  }

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (videoFiles.length > 0) {
      const uploadedFileNames = await uploadVideos()
      if (uploadedFileNames.length === 0) {
        alert('Hiçbir video yüklenemedi. Lütfen tekrar deneyin.')
        return
      }

      try {
        let maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) : -1

        for (const fileName of uploadedFileNames) {
          await axios.post('/api/hero-videos', {
            fileName,
            order: maxOrder + 1,
            active: true
          })
          maxOrder++
        }

        setNewVideoName('')
        setVideoFiles([])
        fetchVideos()
        alert(`${uploadedFileNames.length} video başarıyla eklendi!`)
      } catch (error) {
        alert('Videolar yüklendi ancak veritabanına eklenemedi')
      }
    } else if (newVideoName.trim()) {
      const fileName = newVideoName.trim()

      try {
        const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) : -1
        await axios.post('/api/hero-videos', {
          fileName,
          order: maxOrder + 1,
          active: true
        })
        setNewVideoName('')
        fetchVideos()
      } catch (error) {
        alert('Video eklenemedi')
      }
    } else {
      alert('Lütfen bir video dosyası yükleyin veya dosya adı girin')
    }
  }

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === videos.length - 1)
    ) {
      return
    }

    const newVideos = [...videos]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    const temp = newVideos[index]
    newVideos[index] = newVideos[targetIndex]
    newVideos[targetIndex] = temp

    for (let i = 0; i < newVideos.length; i++) {
      await axios.put('/api/hero-videos', {
        id: newVideos[i].id,
        order: i
      })
    }

    fetchVideos()
  }

  const toggleActive = async (video: HeroVideo) => {
    try {
      await axios.put('/api/hero-videos', {
        id: video.id,
        active: !video.active
      })
      fetchVideos()
    } catch (error) {
      alert('Güncelleme başarısız oldu')
    }
  }

  const toggleFeatured = async (video: HeroVideo) => {
    try {
      await axios.put('/api/hero-videos', {
        id: video.id,
        featured: !video.featured
      })
      fetchVideos()
    } catch (error) {
      alert('Güncelleme başarısız oldu')
    }
  }

  const handleDeleteClick = (video: HeroVideo) => {
    setDeleteConfirm({
      show: true,
      videoId: video.id,
      videoName: video.fileName
    })
  }

  const confirmDelete = async () => {
    const { videoId } = deleteConfirm
    if (!videoId) return

    try {
      await axios.delete(`/api/hero-videos?id=${videoId}`)
      alert('Video başarıyla silindi')
      setDeleteConfirm({ show: false, videoId: null, videoName: '' })
      fetchVideos()
    } catch (error: any) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Bilinmeyen hata'
      alert('Silme işlemi başarısız oldu: ' + errorMessage)
      setDeleteConfirm({ show: false, videoId: null, videoName: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, videoId: null, videoName: '' })
  }

  const openEditModal = (video: HeroVideo) => {
    setEditingVideo({ ...video })
  }

  const closeEditModal = () => {
    setEditingVideo(null)
  }

  const saveVideoSettings = async () => {
    if (!editingVideo) return

    setSaving(true)
    try {
      await axios.put('/api/hero-videos', {
        id: editingVideo.id,
        title: editingVideo.title || null,
        subtitle: editingVideo.subtitle || null,
        description: editingVideo.description || null,
        useCustomContent: editingVideo.useCustomContent,
        playDuration: editingVideo.playDuration || null,
        playCount: editingVideo.playCount || 1,
        featured: editingVideo.featured,
        featuredWeight: editingVideo.featuredWeight || 3
      })
      alert('Video ayarları kaydedildi')
      closeEditModal()
      fetchVideos()
    } catch (error) {
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

  const featuredCount = videos.filter(v => v.featured).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl font-bold text-white">Hero Video Yönetimi</h1>
          </div>
          <p className="text-white/60 mb-4">
            {videos.length} video yönetiliyor
            {featuredCount > 0 && <span className="text-gold-400 ml-2">({featuredCount} öne çıkan)</span>}
          </p>

          {/* Settings Row */}
          <div className="flex flex-wrap gap-4">
            {/* Random Play Toggle */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
              <input
                type="checkbox"
                id="randomPlay"
                checked={randomPlay}
                onChange={toggleRandomPlay}
                className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-gold-500 checked:border-gold-500 cursor-pointer transition-all"
              />
              <label htmlFor="randomPlay" className="text-white font-medium cursor-pointer select-none">
                Videoları karışık sırada oynat
              </label>
              <span className="ml-2 text-white/40 text-sm">
                {randomPlay ? 'Rastgele' : 'Sıralı'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Video Form */}
        <form onSubmit={addVideo} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 text-sm font-medium">Video Dosyaları Yükle</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  multiple
                  onChange={handleVideoChange}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                />
                {videoFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFiles([])
                      setNewVideoName('')
                      setTotalFiles(0)
                    }}
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <p className="text-white/40 text-xs mt-1">
                {videoFiles.length > 0
                  ? `${videoFiles.length} video seçildi`
                  : 'MP4 veya WebM formatında. Birden fazla video seçebilirsiniz.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/40 text-sm">VEYA</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={newVideoName}
                onChange={(e) => setNewVideoName(e.target.value)}
                placeholder="Manuel dosya adı girin (örn: 1.mp4)"
                disabled={videoFiles.length > 0}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {videoFiles.length > 0 ? `${videoFiles.length} Video Ekle` : 'Ekle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Upload Progress Bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 backdrop-blur-lg rounded-xl p-6 border border-gold-500/30 mb-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/30 flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-gold-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">
                  {totalFiles > 1
                    ? `Video Yükleniyor... (${currentUploadIndex}/${totalFiles})`
                    : 'Video Yükleniyor...'}
                </h3>
                <p className="text-white/60 text-sm">
                  Lütfen bekleyin, video R2 sunucusuna yükleniyor.
                </p>
              </div>
              <div className="text-2xl font-bold text-gold-400">{uploadProgress}%</div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Video List */}
        <div className="space-y-4">
          {videos.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center">
              <p className="text-white/60 text-lg">Henüz video eklenmemiş</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all ${
                  video.featured
                    ? 'border-gold-500/50 bg-gold-500/5'
                    : video.active
                    ? 'border-green-500/50'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Order Number */}
                  <div className="flex flex-col items-center">
                    <div className="text-white/40 text-xs mb-1">Sıra</div>
                    <div className="bg-white/10 rounded-lg px-4 py-2 text-white font-bold text-xl min-w-[50px] text-center">
                      {index + 1}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <VideoIcon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      <span className="text-white font-semibold truncate">{video.fileName.split('/').pop()}</span>
                      {video.featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Öne Çıkan
                        </span>
                      )}
                      {video.useCustomContent && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          <Type className="w-3 h-3" />
                          Özel İçerik
                        </span>
                      )}
                    </div>

                    {/* Custom Content Preview */}
                    {video.useCustomContent && video.title && (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-gold-400 font-medium text-sm">{video.title}</p>
                        {video.subtitle && <p className="text-white/60 text-xs mt-0.5">{video.subtitle}</p>}
                      </div>
                    )}

                    {/* Settings Preview */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/50">
                      {video.playDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {video.playDuration}sn
                        </span>
                      )}
                      {video.playCount && video.playCount > 1 && (
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {video.playCount}x tekrar
                        </span>
                      )}
                      {video.featured && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Her {video.featuredWeight || 3} videoda 1
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Featured Toggle */}
                    <button
                      onClick={() => toggleFeatured(video)}
                      className={`p-2 rounded-lg transition-all ${
                        video.featured
                          ? 'bg-gold-500/30 text-gold-400'
                          : 'bg-white/10 text-white/40 hover:bg-white/20'
                      }`}
                      title={video.featured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                    >
                      <Star className="w-5 h-5" fill={video.featured ? 'currentColor' : 'none'} />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(video)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all"
                      title="Düzenle"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>

                    {/* Status Toggle */}
                    <button
                      onClick={() => toggleActive(video)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        video.active
                          ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50 hover:bg-gray-500/30'
                      }`}
                    >
                      {video.active ? 'Aktif' : 'Pasif'}
                    </button>

                    {/* Move Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveVideo(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Yukarı"
                      >
                        <ChevronUp className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => moveVideo(index, 'down')}
                        disabled={index === videos.length - 1}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Aşağı"
                      >
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteClick(video)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <VideoIcon className="w-5 h-5" />
            Video Özellikleri
          </h3>
          <ul className="text-white/60 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-gold-400">Öne Çıkar:</strong> Bu videolar daha sık gösterilir. Duyurular ve yeni eğitimler için kullanın.</span>
            </li>
            <li className="flex items-start gap-2">
              <Type className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-purple-400">Özel İçerik:</strong> Video oynarken kendi başlık ve açıklamanızı gösterin.</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-blue-400">Süre:</strong> Videoyu belirli bir süre sonra değiştirin (saniye).</span>
            </li>
            <li className="flex items-start gap-2">
              <Repeat className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-green-400">Tekrar:</strong> Videoyu art arda kaç kez oynatılacağını belirleyin.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingVideo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-navy-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Video Ayarları</h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Video Name (readonly) */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Video Dosyası</label>
                  <div className="px-4 py-3 bg-white/5 rounded-lg text-white/80 border border-white/10 truncate">
                    {editingVideo.fileName.split('/').pop()}
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="p-4 bg-gold-500/10 rounded-xl border border-gold-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-gold-400" fill={editingVideo.featured ? 'currentColor' : 'none'} />
                      <div>
                        <h4 className="text-white font-medium">Öne Çıkar</h4>
                        <p className="text-white/50 text-sm">Bu video daha sık gösterilsin</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingVideo.featured || false}
                        onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:ring-2 peer-focus:ring-gold-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                  </div>

                  {editingVideo.featured && (
                    <div className="mt-4">
                      <label className="block text-white/60 text-sm mb-2">
                        Gösterim Sıklığı (Her kaç videoda 1)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editingVideo.featuredWeight || 3}
                        onChange={(e) => setEditingVideo({ ...editingVideo, featuredWeight: parseInt(e.target.value) || 3 })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <p className="text-white/40 text-xs mt-1">Örn: 3 = Her 3 videodan sonra bu video gösterilir</p>
                    </div>
                  )}
                </div>

                {/* Custom Content Toggle */}
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Type className="w-6 h-6 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">Özel İçerik Kullan</h4>
                        <p className="text-white/50 text-sm">Video oynarken kendi yazılarınızı gösterin</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingVideo.useCustomContent || false}
                        onChange={(e) => setEditingVideo({ ...editingVideo, useCustomContent: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {editingVideo.useCustomContent && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Başlık</label>
                        <input
                          type="text"
                          value={editingVideo.title || ''}
                          onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                          placeholder="Örn: Yeni Sezon Başlıyor!"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Alt Başlık</label>
                        <input
                          type="text"
                          value={editingVideo.subtitle || ''}
                          onChange={(e) => setEditingVideo({ ...editingVideo, subtitle: e.target.value })}
                          placeholder="Örn: Drama Eğitimi"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Açıklama</label>
                        <textarea
                          value={editingVideo.description || ''}
                          onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                          placeholder="Video için kısa bir açıklama..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Playback Settings */}
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Oynatma Ayarları
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Oynatma Süresi (saniye)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingVideo.playDuration || ''}
                        onChange={(e) => setEditingVideo({ ...editingVideo, playDuration: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Video bitene kadar"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-white/40 text-xs mt-1">Boş bırakılırsa video sonuna kadar oynar</p>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Tekrar Sayısı</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editingVideo.playCount || 1}
                        onChange={(e) => setEditingVideo({ ...editingVideo, playCount: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-white/40 text-xs mt-1">Video kaç kez oynatılsın</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeEditModal}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveVideoSettings}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="text-2xl font-bold text-white">Video Sil</h3>
            </div>

            <p className="text-white/80 mb-2">Bu videoyu listeden çıkarmak istediğinizden emin misiniz?</p>
            <p className="text-gold-400 font-semibold mb-6 truncate">{deleteConfirm.videoName}</p>

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
