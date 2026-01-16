'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface HeroVideoData {
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

export interface VideoContent {
  title?: string | null
  subtitle?: string | null
  description?: string | null
  useCustomContent?: boolean
}

interface VideoCarouselProps {
  videos?: HeroVideoData[]
  videoPath?: string
  fadeDuration?: number
  randomPlay?: boolean
  onContentChange?: (content: VideoContent | null) => void
}

export default function VideoCarousel({
  videos = [],
  videoPath = '/videos',
  fadeDuration = 1200,
  randomPlay = false,
  onContentChange
}: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showingFirst, setShowingFirst] = useState(true)
  const [playCounters, setPlayCounters] = useState<Map<string, number>>(new Map())

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const isTransitioningRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const featuredIndexRef = useRef(0) // Öne çıkan video için sayaç

  // Aktif videoları filtrele
  const activeVideos = videos.filter(v => v.active)

  // Öne çıkan ve normal videoları ayır
  const featuredVideos = activeVideos.filter(v => v.featured)
  const normalVideos = activeVideos.filter(v => !v.featured)

  // Oynatma sırasını oluştur (öne çıkan videoları daha sık ekle)
  const buildPlaylist = useCallback(() => {
    if (activeVideos.length === 0) return []

    const playlist: HeroVideoData[] = []

    if (featuredVideos.length === 0) {
      // Öne çıkan video yoksa normal sıra
      return randomPlay ? shuffleArray([...activeVideos]) : activeVideos
    }

    // Öne çıkan videoların ağırlığına göre playlist oluştur
    // Her featuredWeight videoda 1 öne çıkan video göster
    let normalIndex = 0
    let featuredIndex = 0
    const minWeight = Math.min(...featuredVideos.map(v => v.featuredWeight || 3))

    // Normal videolar arasına öne çıkan videoları serpiştir
    for (let i = 0; i < activeVideos.length * 3; i++) {
      // Her minWeight normal videodan sonra bir öne çıkan video ekle
      if ((i + 1) % minWeight === 0 && featuredVideos.length > 0) {
        playlist.push(featuredVideos[featuredIndex % featuredVideos.length])
        featuredIndex++
      } else if (normalVideos.length > 0) {
        playlist.push(normalVideos[normalIndex % normalVideos.length])
        normalIndex++
      } else {
        // Sadece öne çıkan videolar varsa
        playlist.push(featuredVideos[featuredIndex % featuredVideos.length])
        featuredIndex++
      }

      // Makul bir playlist uzunluğunda dur
      if (playlist.length >= Math.max(activeVideos.length * 2, 10)) break
    }

    return randomPlay ? shuffleArray(playlist) : playlist
  }, [activeVideos, featuredVideos, normalVideos, randomPlay])

  // Fisher-Yates shuffle
  const shuffleArray = (array: HeroVideoData[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const playlistRef = useRef<HeroVideoData[]>([])

  useEffect(() => {
    playlistRef.current = buildPlaylist()
  }, [buildPlaylist])

  const playlist = playlistRef.current.length > 0 ? playlistRef.current : activeVideos

  // Video path generator
  const getVideoPath = useCallback((video: HeroVideoData | undefined) => {
    if (!video) return ''
    // If video is already a full URL (R2), use it directly
    if (video.fileName.startsWith('http://') || video.fileName.startsWith('https://')) {
      return video.fileName
    }
    // Otherwise, use the local path
    return `${videoPath}/${video.fileName}`
  }, [videoPath])

  // İçerik değişikliğini bildir
  const notifyContentChange = useCallback((video: HeroVideoData | undefined) => {
    if (onContentChange) {
      if (video && video.useCustomContent) {
        onContentChange({
          title: video.title,
          subtitle: video.subtitle,
          description: video.description,
          useCustomContent: true
        })
      } else {
        onContentChange(null)
      }
    }
  }, [onContentChange])

  // Sonraki videoya geç
  const goToNextVideo = useCallback(() => {
    if (isTransitioningRef.current || playlist.length === 0) return

    const currentVideo = playlist[currentIndex]
    const currentPlayCount = playCounters.get(currentVideo?.id || '') || 0
    const maxPlayCount = currentVideo?.playCount || 1

    // Eğer video hala tekrar edilmeli ise
    if (currentPlayCount + 1 < maxPlayCount) {
      setPlayCounters(prev => {
        const newMap = new Map(prev)
        newMap.set(currentVideo?.id || '', currentPlayCount + 1)
        return newMap
      })
      // Aynı videoyu tekrar oynat
      const activeVideo = showingFirst ? video1Ref.current : video2Ref.current
      if (activeVideo) {
        activeVideo.currentTime = 0
        activeVideo.play().catch(err => console.error('Video replay error:', err))
      }
      return
    }

    // Tekrar sayısı doldu, sonraki videoya geç
    isTransitioningRef.current = true

    const nextIndex = (currentIndex + 1) % playlist.length
    const nextVideo = playlist[nextIndex]
    const hiddenVideo = showingFirst ? video2Ref.current : video1Ref.current

    // Gizli videoya sonraki videoyu yükle
    if (hiddenVideo && nextVideo) {
      hiddenVideo.src = getVideoPath(nextVideo)
      hiddenVideo.load()
    }

    // Geçiş yap
    setShowingFirst(!showingFirst)
    setCurrentIndex(nextIndex)

    // Yeni video için play counter sıfırla
    setPlayCounters(prev => {
      const newMap = new Map(prev)
      newMap.set(nextVideo?.id || '', 0)
      return newMap
    })

    // İçerik değişikliğini bildir
    notifyContentChange(nextVideo)

    // Gizli videoyu oynat
    setTimeout(() => {
      if (hiddenVideo) {
        hiddenVideo.play().catch(err => console.error('Video play error:', err))
      }
      isTransitioningRef.current = false
    }, fadeDuration)

  }, [currentIndex, playlist, playCounters, showingFirst, fadeDuration, getVideoPath, notifyContentChange])

  // İlk yükleme
  useEffect(() => {
    if (video1Ref.current && playlist.length > 0) {
      const firstVideo = playlist[0]
      video1Ref.current.src = getVideoPath(firstVideo)
      video1Ref.current.load()
      video1Ref.current.play().catch(err => console.error('Video play error:', err))

      // İlk video için içerik bildir
      notifyContentChange(firstVideo)

      // İkinci videoyu hazırla
      if (video2Ref.current && playlist.length > 1) {
        video2Ref.current.src = getVideoPath(playlist[1])
        video2Ref.current.load()
      }
    }
  }, [playlist.length > 0]) // Sadece playlist hazır olduğunda

  // Video ended veya duration timeout
  useEffect(() => {
    const activeVideo = showingFirst ? video1Ref.current : video2Ref.current
    const currentVideo = playlist[currentIndex]

    if (!activeVideo || !currentVideo) return

    const handleEnded = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      goToNextVideo()
    }

    // Duration timer
    const setupDurationTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      if (currentVideo.playDuration && currentVideo.playDuration > 0) {
        timerRef.current = setTimeout(() => {
          goToNextVideo()
        }, currentVideo.playDuration * 1000)
      }
    }

    activeVideo.addEventListener('ended', handleEnded)
    activeVideo.addEventListener('play', setupDurationTimer)

    return () => {
      activeVideo.removeEventListener('ended', handleEnded)
      activeVideo.removeEventListener('play', setupDurationTimer)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [showingFirst, currentIndex, goToNextVideo, playlist])

  if (playlist.length === 0) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80 z-10"></div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Video 1 */}
      <motion.video
        ref={video1Ref}
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
        animate={{
          opacity: showingFirst ? 1 : 0,
        }}
        transition={{
          duration: fadeDuration / 1000,
          ease: "easeInOut"
        }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Video 2 */}
      <motion.video
        ref={video2Ref}
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
        animate={{
          opacity: showingFirst ? 0 : 1,
        }}
        transition={{
          duration: fadeDuration / 1000,
          ease: "easeInOut"
        }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80 z-10"></div>
    </div>
  )
}
