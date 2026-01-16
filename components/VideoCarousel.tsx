'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

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

// Fisher-Yates shuffle - component dışında tanımla
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
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
  const [isInitialized, setIsInitialized] = useState(false)

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const isTransitioningRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Aktif videoları filtrele
  const activeVideos = useMemo(() => videos.filter(v => v.active), [videos])

  // Öne çıkan ve normal videoları ayır
  const featuredVideos = useMemo(() => activeVideos.filter(v => v.featured), [activeVideos])
  const normalVideos = useMemo(() => activeVideos.filter(v => !v.featured), [activeVideos])

  // Playlist'i oluştur
  const playlist = useMemo(() => {
    if (activeVideos.length === 0) return []

    if (featuredVideos.length === 0) {
      return randomPlay ? shuffleArray([...activeVideos]) : activeVideos
    }

    const result: HeroVideoData[] = []
    let normalIndex = 0
    let featuredIndex = 0
    const minWeight = Math.min(...featuredVideos.map(v => v.featuredWeight || 3))

    for (let i = 0; i < activeVideos.length * 3; i++) {
      if ((i + 1) % minWeight === 0 && featuredVideos.length > 0) {
        result.push(featuredVideos[featuredIndex % featuredVideos.length])
        featuredIndex++
      } else if (normalVideos.length > 0) {
        result.push(normalVideos[normalIndex % normalVideos.length])
        normalIndex++
      } else {
        result.push(featuredVideos[featuredIndex % featuredVideos.length])
        featuredIndex++
      }

      if (result.length >= Math.max(activeVideos.length * 2, 10)) break
    }

    return randomPlay ? shuffleArray(result) : result
  }, [activeVideos, featuredVideos, normalVideos, randomPlay])

  // Video path generator
  const getVideoPath = useCallback((video: HeroVideoData | undefined) => {
    if (!video) return ''
    if (video.fileName.startsWith('http://') || video.fileName.startsWith('https://')) {
      return video.fileName
    }
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

    if (currentPlayCount + 1 < maxPlayCount) {
      setPlayCounters(prev => {
        const newMap = new Map(prev)
        newMap.set(currentVideo?.id || '', currentPlayCount + 1)
        return newMap
      })
      const activeVideo = showingFirst ? video1Ref.current : video2Ref.current
      if (activeVideo) {
        activeVideo.currentTime = 0
        activeVideo.play().catch(err => console.error('Video replay error:', err))
      }
      return
    }

    isTransitioningRef.current = true

    const nextIndex = (currentIndex + 1) % playlist.length
    const nextVideo = playlist[nextIndex]
    const hiddenVideo = showingFirst ? video2Ref.current : video1Ref.current

    if (hiddenVideo && nextVideo) {
      hiddenVideo.src = getVideoPath(nextVideo)
      hiddenVideo.load()
    }

    setShowingFirst(!showingFirst)
    setCurrentIndex(nextIndex)

    setPlayCounters(prev => {
      const newMap = new Map(prev)
      newMap.set(nextVideo?.id || '', 0)
      return newMap
    })

    notifyContentChange(nextVideo)

    setTimeout(() => {
      if (hiddenVideo) {
        hiddenVideo.play().catch(err => console.error('Video play error:', err))
      }
      isTransitioningRef.current = false
    }, fadeDuration)

  }, [currentIndex, playlist, playCounters, showingFirst, fadeDuration, getVideoPath, notifyContentChange])

  // İlk yükleme
  useEffect(() => {
    if (isInitialized || playlist.length === 0) return

    const firstVideo = playlist[0]
    if (video1Ref.current && firstVideo) {
      video1Ref.current.src = getVideoPath(firstVideo)
      video1Ref.current.load()
      video1Ref.current.play().catch(err => console.error('Video play error:', err))

      notifyContentChange(firstVideo)

      if (video2Ref.current && playlist.length > 1) {
        video2Ref.current.src = getVideoPath(playlist[1])
        video2Ref.current.load()
      }

      setIsInitialized(true)
    }
  }, [playlist, getVideoPath, notifyContentChange, isInitialized])

  // Video ended event handler
  useEffect(() => {
    const activeVideo = showingFirst ? video1Ref.current : video2Ref.current

    if (!activeVideo) return

    const handleEnded = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      goToNextVideo()
    }

    activeVideo.addEventListener('ended', handleEnded)

    return () => {
      activeVideo.removeEventListener('ended', handleEnded)
    }
  }, [showingFirst, goToNextVideo])

  // Duration timer - video değiştiğinde veya başladığında çalışır
  useEffect(() => {
    const currentVideo = playlist[currentIndex]

    // Önceki timer'ı temizle
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Eğer playDuration varsa timer kur
    if (currentVideo && currentVideo.playDuration && currentVideo.playDuration > 0) {
      console.log(`Timer kuruldu: ${currentVideo.playDuration} saniye için video: ${currentVideo.fileName}`)
      timerRef.current = setTimeout(() => {
        console.log('Timer doldu, sonraki videoya geçiliyor')
        goToNextVideo()
      }, currentVideo.playDuration * 1000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentIndex, playlist, goToNextVideo])

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
