'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Trash2, Plus, Video as VideoIcon } from 'lucide-react'
import axios from 'axios'

interface HeroVideo {
  id: string
  fileName: string
  order: number
  active: boolean
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [newVideoName, setNewVideoName] = useState('')

  useEffect(() => {
    fetchVideos()
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

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVideoName.trim()) return

    try {
      const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order)) : -1
      await axios.post('/api/hero-videos', {
        fileName: newVideoName.trim(),
        order: maxOrder + 1,
        active: true
      })
      setNewVideoName('')
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

  const deleteVideo = async (id: string) => {
    if (!confirm('Bu videoyu listeden çıkarmak istediğinizden emin misiniz?')) return

    try {
      await axios.delete(`/api/hero-videos?id=${id}`)
      fetchVideos()
    } catch (error) {
      alert('Silme işlemi başarısız oldu')
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Hero Video Yönetimi</h1>
          <p className="text-white/60">
            Video dosya adlarını girin (örn: 1.mp4, 2.mp4). Dosyalar /public/videos/ klasöründe olmalıdır.
          </p>
        </div>

        {/* Add Video Form */}
        <form onSubmit={addVideo} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newVideoName}
              onChange={(e) => setNewVideoName(e.target.value)}
              placeholder="Video dosya adı (örn: 22.mp4)"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Ekle
            </button>
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
                    onClick={() => deleteVideo(video.id)}
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
    </div>
  )
}
