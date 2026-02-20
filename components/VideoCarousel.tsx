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
  clickToNext?: boolean
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

// Canvas animated gradient background component
function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const colors = [
      { r: 36, g: 59, b: 83 },    // navy
      { r: 193, g: 154, b: 107 },  // gold
      { r: 88, g: 28, b: 135 },    // purple
      { r: 30, g: 41, b: 59 },     // dark slate
      { r: 146, g: 107, b: 60 },   // dark gold
      { r: 15, g: 23, b: 42 },     // deep navy
    ]

    const blobs = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 200 + Math.random() * 300,
      color,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      phase: (i / colors.length) * Math.PI * 2,
    }))

    const animate = () => {
      time += 0.003

      // Dark base
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animate and draw blobs
      blobs.forEach((blob, i) => {
        blob.x += Math.sin(time + blob.phase) * blob.speedX * 2
        blob.y += Math.cos(time * 0.7 + blob.phase) * blob.speedY * 2

        // Wrap around
        if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius
        if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius
        if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius
        if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius

        const pulseFactor = 1 + Math.sin(time * 2 + blob.phase) * 0.15
        const currentRadius = blob.radius * pulseFactor

        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, currentRadius
        )

        const alpha = 0.12 + Math.sin(time + i) * 0.05
        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${alpha * 0.4})`)
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      // Soft noise overlay for texture
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 6
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }
      ctx.putImageData(imageData, 0, 0)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

export default function VideoCarousel({
  videos = [],
  videoPath = '/videos',
  fadeDuration = 1200,
  randomPlay = false,
  clickToNext = true,
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

  // Header'a tıklayınca sonraki videoya geç
  const handleHeaderClick = useCallback(() => {
    if (clickToNext && playlist.length > 1) {
      goToNextVideo()
    }
  }, [clickToNext, playlist.length, goToNextVideo])

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
    // İlk yükleme tamamlanmadan timer kurma
    if (!isInitialized) return

    const currentVideo = playlist[currentIndex]

    // Önceki timer'ı temizle
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Eğer playDuration varsa timer kur
    if (currentVideo && currentVideo.playDuration && currentVideo.playDuration > 0) {
      timerRef.current = setTimeout(() => {
        goToNextVideo()
      }, currentVideo.playDuration * 1000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentIndex, playlist, goToNextVideo, isInitialized])

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      onClick={handleHeaderClick}
      style={{ cursor: clickToNext && playlist.length > 1 ? 'pointer' : 'default' }}
    >
      {/* Animated gradient background - always visible as fallback */}
      <AnimatedGradientBackground />

      {/* Video 1 */}
      {playlist.length > 0 && (
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
          style={{ pointerEvents: 'none', zIndex: 1 }}
        />
      )}

      {/* Video 2 */}
      {playlist.length > 0 && (
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
          style={{ pointerEvents: 'none', zIndex: 1 }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80 z-10"></div>
    </div>
  )
}
