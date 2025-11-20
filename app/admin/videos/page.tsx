'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Trash2, Plus, Video as VideoIcon, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface HeroVideo {
  id: string
  fileName: string
  order: number
  active: boolean
}

export default function AdminVideos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [newVideoName, setNewVideoName] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; videoId: string | null; videoName: string }>({
    show: false,
    videoId: null,
    videoName: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchVideos()
    // Auto-import existing videos if database is empty
    checkAndImportVideos()
  }, [])

  const checkAndImportVideos = async () => {
    try {
      const { data } = await axios.get('/api/hero-videos')
      if (data.length === 0) {
        // Database is empty, show import option
        if (confirm('Veritabanında video bulunamadı. Mevcut 21 videoyu içe aktarmak ister misiniz?')) {
          await importExistingVideos()
        }
      }
    } catch (error) {
      console.error('Video kontrolü başarısız', error)
    }
  }

  const importExistingVideos = async () => {
    try {
      setLoading(true)
      // Import videos 1-21
      for (let i = 1; i <= 21; i++) {
        await axios.post('/api/hero-videos', {
          fileName: `${i}.mp4`,
          order: i - 1,
          active: true
        })
      }
      alert('21 video başarıyla içe aktarıldı!')
      fetchVideos()
    } catch (error) {
      console.error('İçe aktarma başarısız', error)
      alert('Bazı videolar içe aktarılamadı')
    } finally {
      setLoading(false)
    }
  }

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      // Auto-fill filename from uploaded file
      setNewVideoName(file.name)
    }
  }

  const uploadVideo = async () => {
    if (!videoFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('type', 'video')

      const uploadRes = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return uploadRes.data.filename
    } catch (error) {
      console.error('Video yükleme hatası:', error)
      alert('Video yüklenemedi. Dosya boyutu çok büyük olabilir.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault()

    let fileName = newVideoName.trim()

    // If user uploaded a video file, upload it first
    if (videoFile) {
      const uploadedFileName = await uploadVideo()
      if (!uploadedFileName) return // Upload failed
      fileName = uploadedFileName
    }

    if (!fileName) {
      alert('Lütfen bir video dosyası yükleyin veya dosya adı girin')
      return
    }

    try {
      const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) : -1
      await axios.post('/api/hero-videos', {
        fileName,
        order: maxOrder + 1,
        active: true
      })
      setNewVideoName('')
      setVideoFile(null)
      fetchVideos()
    } catch (error) {
      alert('Video eklenemedi')
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

    // Swap
    const temp = newVideos[index]
    newVideos[index] = newVideos[targetIndex]
    newVideos[targetIndex] = temp

    // Update orders
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

  const handleDeleteClick = (video: HeroVideo) => {
    console.log('Delete button clicked for video:', video.id, video.fileName)
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
      console.log('Deleting video with id:', videoId)
      const response = await axios.delete(`/api/hero-videos?id=${videoId}`)
      console.log('Delete response:', response.data)
      alert('Video başarıyla silindi')
      setDeleteConfirm({ show: false, videoId: null, videoName: '' })
      fetchVideos()
    } catch (error: any) {
      console.error('Delete error:', error)
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Bilinmeyen hata'
      alert('Silme işlemi başarısız oldu: ' + errorMessage)
      setDeleteConfirm({ show: false, videoId: null, videoName: '' })
    }
  }

  const cancelDelete = () => {
    console.log('Delete cancelled')
    setDeleteConfirm({ show: false, videoId: null, videoName: '' })
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
              <h1 className="text-4xl font-bold text-white">Hero Video Yönetimi</h1>
            </div>
            <button
              onClick={importExistingVideos}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Mevcut Videoları İçe Aktar (1-21)
            </button>
          </div>
          <p className="text-white/60">
            {videos.length} video yönetiliyor. Yeni video yükleyebilir veya mevcut videoları düzenleyebilirsiniz.
          </p>
        </div>

        {/* Add Video Form */}
        <form onSubmit={addVideo} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="space-y-4">
            {/* Video Upload */}
            <div>
              <label className="block text-white mb-2 text-sm font-medium">Video Dosyası Yükle</label>
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white hover:file:bg-gold-600"
              />
              <p className="text-white/40 text-xs mt-1">MP4 veya WebM formatında. Maksimum 50MB önerilir.</p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/40 text-sm">VEYA</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Manual Filename Input */}
            <div className="flex gap-4">
              <input
                type="text"
                value={newVideoName}
                onChange={(e) => setNewVideoName(e.target.value)}
                placeholder="Manuel dosya adı girin (örn: 1.mp4)"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
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
                    Ekle
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

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
                  video.active ? 'border-green-500/50' : 'border-white/10'
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

                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <VideoIcon className="w-5 h-5 text-gold-500" />
                      <span className="text-white font-semibold text-lg">{video.fileName}</span>
                    </div>
                    <div className="text-white/60 text-sm">
                      /public/videos/{video.fileName}
                    </div>
                  </div>

                  {/* Status */}
                  <button
                    onClick={() => toggleActive(video)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
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
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Yukarı Taşı"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => moveVideo(index, 'down')}
                      disabled={index === videos.length - 1}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aşağı Taşı"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
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
              </motion.div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <VideoIcon className="w-5 h-5" />
            Önemli Notlar
          </h3>
          <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
            <li>Video dosyaları <code className="bg-white/10 px-2 py-1 rounded text-xs">/public/videos/</code> klasöründe olmalıdır</li>
            <li>Desteklenen formatlar: MP4, WebM</li>
            <li>Videolar yukarıdan aşağıya doğru sırayla oynatılacaktır</li>
            <li>Pasif videolar oynatma listesinde görünmez</li>
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
              <h3 className="text-2xl font-bold text-white">Video Sil</h3>
            </div>

            <p className="text-white/80 mb-2">Bu videoyu listeden çıkarmak istediğinizden emin misiniz?</p>
            <p className="text-gold-400 font-semibold mb-6">{deleteConfirm.videoName}</p>

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
