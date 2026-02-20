'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, ChevronLeft, ChevronRight, ImageIcon, Film, Folder, AlertTriangle } from 'lucide-react'

interface GalleryItem {
  id: string
  albumId: string
  type: string // image, video, youtube
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

interface GallerySectionProps {
  albums: GalleryAlbum[]
}

export default function GallerySection({ albums }: GallerySectionProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Prevent body scroll when lightbox is open + keyboard navigation
  useEffect(() => {
    if (lightboxItem) {
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setLightboxItem(null)
        if (e.key === 'ArrowRight') navigateLightbox(1)
        if (e.key === 'ArrowLeft') navigateLightbox(-1)
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [lightboxItem, lightboxIndex])

  const activeAlbums = albums.filter(a => a.active && a.items.some(i => i.active))

  const currentItems = selectedAlbum
    ? selectedAlbum.items.filter(i => i.active).sort((a, b) => a.order - b.order)
    : activeAlbums.flatMap(a => a.items.filter(i => i.active)).sort((a, b) => a.order - b.order)

  const openLightbox = (item: GalleryItem, index: number) => {
    setLightboxItem(item)
    setLightboxIndex(index)
  }

  const navigateLightbox = (direction: number) => {
    const newIndex = lightboxIndex + direction
    if (newIndex >= 0 && newIndex < currentItems.length) {
      setLightboxIndex(newIndex)
      setLightboxItem(currentItems[newIndex])
    }
  }

  const getYoutubeId = (url: string) => {
    if (url.includes('youtu.be')) return url.split('youtu.be/')[1]?.split('?')[0]
    return url.split('v=')[1]?.split('&')[0]
  }

  const getItemThumbnail = (item: GalleryItem) => {
    if (item.type === 'image') return item.url
    if (item.thumbnail) return item.thumbnail
    if (item.type === 'youtube') {
      const ytId = getYoutubeId(item.url)
      return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null
    }
    return null
  }

  // Sub-component for lightbox image with error handling
  const LightboxImage = ({ url, title }: { url: string; title: string }) => {
    const [error, setError] = useState(false)

    if (error) {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-3 py-20">
          <AlertTriangle className="w-16 h-16 text-red-400/40" />
          <p className="text-red-400/60 text-lg">Görsel yüklenemedi</p>
          <p className="text-white/30 text-xs break-all max-w-md text-center px-4">{url}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 text-sm transition-colors"
          >
            URL&apos;yi Yeni Sekmede Aç
          </a>
        </div>
      )
    }

    return (
      <div className="relative w-full" style={{ maxHeight: '75vh' }}>
        <img
          src={url}
          alt={title}
          className="w-full h-full object-contain max-h-[75vh] rounded-lg"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  // Sub-component with error handling for grid thumbnails
  const GridThumb = ({ src, alt }: { src: string | null; alt: string }) => {
    const [error, setError] = useState(false)

    if (!src || error) {
      return (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-navy-700 to-navy-800 flex flex-col items-center justify-center gap-1">
          <AlertTriangle className="w-8 h-8 text-white/20" />
          <p className="text-white/20 text-xs">Yüklenemedi</p>
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        onError={() => setError(true)}
      />
    )
  }

  if (activeAlbums.length === 0) return null

  return (
    <>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4">Galeri</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Tiyatromuzdan kareler, oyunlardan sahneler ve basında biz
          </p>
        </motion.div>

        {/* Album Tabs */}
        {activeAlbums.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <button
              onClick={() => setSelectedAlbum(null)}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                !selectedAlbum
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-lg shadow-gold-500/25'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
              }`}
            >
              <Folder className="w-4 h-4" />
              Tümü
            </button>
            {activeAlbums.map(album => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedAlbum?.id === album.id
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-lg shadow-gold-500/25'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                }`}
              >
                {album.title}
              </button>
            ))}
          </motion.div>
        )}

        {/* Single Album Description */}
        {selectedAlbum && selectedAlbum.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/60 mb-8 max-w-2xl mx-auto"
          >
            {selectedAlbum.description}
          </motion.p>
        )}

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {currentItems.map((item, index) => {
              const thumb = getItemThumbnail(item)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                  onClick={() => openLightbox(item, index)}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-gold-500/50 transition-all"
                >
                  <GridThumb src={thumb} alt={item.title || 'Galeri'} />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {item.title && (
                      <p className="text-white font-semibold text-sm line-clamp-1">{item.title}</p>
                    )}
                    {item.description && (
                      <p className="text-white/70 text-xs line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>

                  {/* Video Play Icon */}
                  {(item.type === 'video' || item.type === 'youtube') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-gold-500/80 transition-all group-hover:scale-110">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {currentItems.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Bu albümde henüz içerik yok</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center"
            onClick={() => setLightboxItem(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-[210] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {lightboxIndex < currentItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Content */}
            <motion.div
              key={lightboxItem.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
            >
              {/* Media */}
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                {lightboxItem.type === 'image' && (
                  <LightboxImage url={lightboxItem.url} title={lightboxItem.title || 'Galeri'} />
                )}
                {lightboxItem.type === 'video' && (
                  <video
                    controls
                    autoPlay
                    className="w-full max-h-[75vh] rounded-lg"
                    src={lightboxItem.url}
                  >
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                )}
                {lightboxItem.type === 'youtube' && (
                  <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${getYoutubeId(lightboxItem.url)}?autoplay=1`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Caption */}
              {(lightboxItem.title || lightboxItem.description) && (
                <div className="mt-4 text-center px-4">
                  {lightboxItem.title && (
                    <h3 className="text-xl font-bold text-white mb-1">{lightboxItem.title}</h3>
                  )}
                  {lightboxItem.description && (
                    <p className="text-white/70 text-sm">{lightboxItem.description}</p>
                  )}
                </div>
              )}

              {/* Counter */}
              <div className="mt-3 text-center text-white/40 text-sm">
                {lightboxIndex + 1} / {currentItems.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
