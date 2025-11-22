'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface VideoCarouselProps {
  videos?: string[]
  videoPath?: string
  fadeDuration?: number
}

export default function VideoCarousel({
  videos = [],
  videoPath = '/videos',
  fadeDuration = 1200
}: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [showingFirst, setShowingFirst] = useState(true)

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const isTransitioningRef = useRef(false)

  const videoCount = videos.length

  // Video path generator
  const getVideoPath = useCallback((index: number) => {
    if (!videos[index]) return ''
    // If video is already a full URL (R2), use it directly
    if (videos[index].startsWith('http://') || videos[index].startsWith('https://')) {
      return videos[index]
    }
    // Otherwise, use the local path
    return `${videoPath}/${videos[index]}`
  }, [videoPath, videos])

  // Initialize videos
  useEffect(() => {
    if (video1Ref.current && video2Ref.current && videoCount > 0) {
      // Set initial videos
      video1Ref.current.src = getVideoPath(0)
      video2Ref.current.src = getVideoPath(1)

      // Start first video
      video1Ref.current.load()
      video1Ref.current.play().catch(err => console.error('Video play error:', err))

      // Preload second video
      if (videoCount > 1) {
        video2Ref.current.load()
      }
    }
  }, [getVideoPath, videoCount])

  // Add event listeners
  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (!video1 || !video2) return

    const handleVideoEnded = (isFirstVideo: boolean) => {
      // Only handle if this is the currently showing video
      if (isFirstVideo !== showingFirst) return
      if (isTransitioningRef.current) return

      isTransitioningRef.current = true

      const activeVideo = isFirstVideo ? video1 : video2
      const nextVideo = isFirstVideo ? video2 : video1

      // Calculate next indices
      const newCurrentIndex = (currentIndex + 1) % videoCount
      const newNextIndex = (currentIndex + 2) % videoCount

      // Start fade transition and play next video
      setShowingFirst(!isFirstVideo)

      // Play the next video
      const playPromise = nextVideo.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => console.error('Video play error:', err))
      }

      // After fade completes, prepare the hidden video for next transition
      setTimeout(() => {
        setCurrentIndex(newCurrentIndex)
        setNextIndex(newNextIndex)

        activeVideo.src = getVideoPath(newNextIndex)
        activeVideo.load()

        isTransitioningRef.current = false
      }, fadeDuration)
    }

    const handleVideo1End = () => handleVideoEnded(true)
    const handleVideo2End = () => handleVideoEnded(false)

    video1.addEventListener('ended', handleVideo1End)
    video2.addEventListener('ended', handleVideo2End)

    return () => {
      video1.removeEventListener('ended', handleVideo1End)
      video2.removeEventListener('ended', handleVideo2End)
    }
  }, [showingFirst, currentIndex, videoCount, fadeDuration, getVideoPath])

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
