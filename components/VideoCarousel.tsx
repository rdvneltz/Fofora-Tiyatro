'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  clickToNext?: boolean
  onContentChange?: (content: VideoContent | null) => void
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Theater-themed animated background with floating bubbles, spotlights, and curtain effects
function TheaterLoadingAnimation() {
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

    // Floating bubbles / stage light particles
    const particles: {
      x: number; y: number; radius: number; speedX: number; speedY: number
      opacity: number; color: string; pulseSpeed: number; pulsePhase: number
    }[] = []

    for (let i = 0; i < 35; i++) {
      const colors = [
        'rgba(193, 154, 107,',  // gold
        'rgba(212, 175, 55,',   // bright gold
        'rgba(255, 215, 0,',    // pure gold
        'rgba(180, 140, 100,',  // warm bronze
        'rgba(220, 190, 150,',  // light gold
        'rgba(160, 120, 80,',   // deep bronze
      ]
      particles.push({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
        radius: 2 + Math.random() * 6,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -0.2 - Math.random() * 0.5, // float upward
        opacity: 0.15 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Spotlight configurations
    const spotlights = [
      { x: 0.2, y: -0.1, targetX: 0.5, targetY: 0.6, color: { r: 193, g: 154, b: 107 }, swaySpeed: 0.3, swayAmount: 0.08 },
      { x: 0.8, y: -0.1, targetX: 0.5, targetY: 0.6, color: { r: 88, g: 28, b: 135 }, swaySpeed: 0.25, swayAmount: 0.06 },
      { x: 0.5, y: -0.15, targetX: 0.5, targetY: 0.5, color: { r: 212, g: 175, b: 55 }, swaySpeed: 0.2, swayAmount: 0.04 },
    ]

    const animate = () => {
      time += 0.004

      // Deep navy/dark base with subtle color shift
      const baseR = 15 + Math.sin(time * 0.3) * 5
      const baseG = 23 + Math.sin(time * 0.4) * 3
      const baseB = 42 + Math.sin(time * 0.5) * 8
      ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw curtain-like gradient on sides
      const curtainWidth = canvas.width * 0.15
      // Left curtain
      const leftGrad = ctx.createLinearGradient(0, 0, curtainWidth, 0)
      leftGrad.addColorStop(0, `rgba(80, 10, 20, ${0.4 + Math.sin(time * 0.5) * 0.1})`)
      leftGrad.addColorStop(0.5, `rgba(100, 15, 25, ${0.2 + Math.sin(time * 0.5) * 0.05})`)
      leftGrad.addColorStop(1, 'rgba(100, 15, 25, 0)')
      ctx.fillStyle = leftGrad
      ctx.fillRect(0, 0, curtainWidth, canvas.height)

      // Right curtain
      const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width - curtainWidth, 0)
      rightGrad.addColorStop(0, `rgba(80, 10, 20, ${0.4 + Math.sin(time * 0.5) * 0.1})`)
      rightGrad.addColorStop(0.5, `rgba(100, 15, 25, ${0.2 + Math.sin(time * 0.5) * 0.05})`)
      rightGrad.addColorStop(1, 'rgba(100, 15, 25, 0)')
      ctx.fillStyle = rightGrad
      ctx.fillRect(canvas.width - curtainWidth, 0, curtainWidth, canvas.height)

      // Draw spotlights
      spotlights.forEach((spot) => {
        const swayX = Math.sin(time * spot.swaySpeed) * spot.swayAmount
        const centerX = (spot.targetX + swayX) * canvas.width
        const centerY = spot.targetY * canvas.height

        const spotGrad = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, canvas.height * 0.6
        )

        const alpha = 0.06 + Math.sin(time * 0.8 + spot.swaySpeed) * 0.02
        spotGrad.addColorStop(0, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${alpha * 2})`)
        spotGrad.addColorStop(0.3, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${alpha})`)
        spotGrad.addColorStop(1, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, 0)`)

        ctx.fillStyle = spotGrad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      // Draw and update floating particles (bubbles/sparkles)
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(time * 2 + p.pulsePhase) * 0.3
        p.y += p.speedY

        // Reset particle when it goes off screen
        if (p.y < -20) {
          p.y = canvas.height + 20
          p.x = Math.random() * canvas.width
        }
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20

        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase)
        const currentOpacity = p.opacity * (0.6 + pulse * 0.4)
        const currentRadius = p.radius * (0.8 + pulse * 0.3)

        // Glow effect
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 3)
        glowGrad.addColorStop(0, `${p.color} ${currentOpacity})`)
        glowGrad.addColorStop(0.4, `${p.color} ${currentOpacity * 0.3})`)
        glowGrad.addColorStop(1, `${p.color} 0)`)
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core bright point
        ctx.fillStyle = `${p.color} ${currentOpacity * 1.2})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentRadius * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Soft vignette overlay
      const vignetteGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      )
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
      ctx.fillStyle = vignetteGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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
  const [videoReady, setVideoReady] = useState(false)

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const isTransitioningRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter active videos
  const activeVideos = useMemo(() => videos.filter(v => v.active), [videos])

  // Separate featured and normal videos
  const featuredVideos = useMemo(() => activeVideos.filter(v => v.featured), [activeVideos])
  const normalVideos = useMemo(() => activeVideos.filter(v => !v.featured), [activeVideos])

  // Build playlist
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

  // Video path generator - handles both full R2 URLs and relative filenames
  const getVideoPath = useCallback((video: HeroVideoData | undefined) => {
    if (!video) return ''
    if (video.fileName.startsWith('http://') || video.fileName.startsWith('https://')) {
      return video.fileName
    }
    return `${videoPath}/${video.fileName}`
  }, [videoPath])

  // Notify content change
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

  // Safe play with retry logic
  const safePlay = useCallback((videoEl: HTMLVideoElement, onSuccess?: () => void) => {
    const attemptPlay = () => {
      const playPromise = videoEl.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoReady(true)
            onSuccess?.()
          })
          .catch(() => {
            // Retry: listen for user interaction to resume playback
            const handleInteraction = () => {
              videoEl.play()
                .then(() => {
                  setVideoReady(true)
                  onSuccess?.()
                })
                .catch(() => {})
              document.removeEventListener('click', handleInteraction)
              document.removeEventListener('touchstart', handleInteraction)
              document.removeEventListener('scroll', handleInteraction)
            }
            document.addEventListener('click', handleInteraction, { once: true })
            document.addEventListener('touchstart', handleInteraction, { once: true })
            document.addEventListener('scroll', handleInteraction, { once: true })

            // Also retry after a short delay (some browsers unblock after page settles)
            retryTimeoutRef.current = setTimeout(() => {
              videoEl.play()
                .then(() => {
                  setVideoReady(true)
                  onSuccess?.()
                  document.removeEventListener('click', handleInteraction)
                  document.removeEventListener('touchstart', handleInteraction)
                  document.removeEventListener('scroll', handleInteraction)
                })
                .catch(() => {})
            }, 1500)
          })
      }
    }

    // Wait for the video to have enough data before playing
    if (videoEl.readyState >= 3) {
      attemptPlay()
    } else {
      const handleCanPlay = () => {
        attemptPlay()
        videoEl.removeEventListener('canplay', handleCanPlay)
      }
      videoEl.addEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Go to next video
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
        safePlay(activeVideo)
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

      // Wait for hidden video to be ready, then transition
      safePlay(hiddenVideo, () => {
        isTransitioningRef.current = false
      })
    }

    setShowingFirst(!showingFirst)
    setCurrentIndex(nextIndex)

    setPlayCounters(prev => {
      const newMap = new Map(prev)
      newMap.set(nextVideo?.id || '', 0)
      return newMap
    })

    notifyContentChange(nextVideo)

    // Safety: ensure transition flag resets even if play fails
    setTimeout(() => {
      isTransitioningRef.current = false
    }, fadeDuration + 2000)

  }, [currentIndex, playlist, playCounters, showingFirst, fadeDuration, getVideoPath, notifyContentChange, safePlay])

  // Header click to next video
  const handleHeaderClick = useCallback(() => {
    if (clickToNext && playlist.length > 1) {
      goToNextVideo()
    }
  }, [clickToNext, playlist.length, goToNextVideo])

  // Initial load
  useEffect(() => {
    if (isInitialized || playlist.length === 0) return

    const firstVideo = playlist[0]
    if (video1Ref.current && firstVideo) {
      video1Ref.current.src = getVideoPath(firstVideo)
      video1Ref.current.load()

      safePlay(video1Ref.current)

      notifyContentChange(firstVideo)

      if (video2Ref.current && playlist.length > 1) {
        video2Ref.current.src = getVideoPath(playlist[1])
        video2Ref.current.load()
      }

      setIsInitialized(true)
    }
  }, [playlist, getVideoPath, notifyContentChange, isInitialized, safePlay])

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

  // Duration timer
  useEffect(() => {
    if (!isInitialized) return

    const currentVideo = playlist[currentIndex]

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

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

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      onClick={handleHeaderClick}
      style={{ cursor: clickToNext && playlist.length > 1 ? 'pointer' : 'default' }}
    >
      {/* Theater-themed animated background - always visible as fallback */}
      <AnimatePresence>
        {!videoReady && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{ zIndex: 2 }}
          >
            <TheaterLoadingAnimation />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent background (behind videos, behind animation) */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-[#1a1025] to-navy-950" style={{ zIndex: 0 }} />

      {/* Video 1 */}
      {playlist.length > 0 && (
        <motion.video
          ref={video1Ref}
          autoPlay
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
          autoPlay
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
