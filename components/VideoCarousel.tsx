'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoCarouselProps {
  videoCount: number
  videoPath: string
  fadeDuration?: number
}

export default function VideoCarousel({
  videoCount = 21,
  videoPath = '/videos/optimized',
  fadeDuration = 1000
}: VideoCarouselProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)
  const [activeVideoRef, setActiveVideoRef] = useState<1 | 2>(1)

  // Video listesi
  const videoFiles = Array.from({ length: videoCount }, (_, i) => `${videoPath}/${i + 1}.mp4`)

  useEffect(() => {
    const activeRef = activeVideoRef === 1 ? videoRef1.current : videoRef2.current
    const inactiveRef = activeVideoRef === 1 ? videoRef2.current : videoRef1.current

    if (activeRef && inactiveRef) {
      // Video bittiğinde sonraki videoya geç
      const handleVideoEnd = () => {
        const nextIndex = (currentVideoIndex + 1) % videoCount

        // İnaktif video elementini hazırla
        inactiveRef.src = videoFiles[nextIndex]
        inactiveRef.load()

        // Video yüklendiğinde play et
        inactiveRef.addEventListener('loadeddata', () => {
          inactiveRef.play()
        }, { once: true })

        setIsTransitioning(true)

        setTimeout(() => {
          setCurrentVideoIndex(nextIndex)
          setActiveVideoRef(activeVideoRef === 1 ? 2 : 1)
          setIsTransitioning(false)
        }, fadeDuration / 2)
      }

      activeRef.addEventListener('ended', handleVideoEnd)

      return () => {
        activeRef.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [currentVideoIndex, activeVideoRef, videoCount, fadeDuration, videoFiles])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video 1 */}
      <motion.video
        ref={videoRef1}
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={videoFiles[currentVideoIndex]}
        initial={{ opacity: 1 }}
        animate={{
          opacity: activeVideoRef === 1 && !isTransitioning ? 1 : 0,
          scale: activeVideoRef === 1 && !isTransitioning ? 1 : 1.05
        }}
        transition={{ duration: fadeDuration / 1000, ease: "easeInOut" }}
      />

      {/* Video 2 */}
      <motion.video
        ref={videoRef2}
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={videoFiles[(currentVideoIndex + 1) % videoCount]}
        initial={{ opacity: 0 }}
        animate={{
          opacity: activeVideoRef === 2 && !isTransitioning ? 1 : 0,
          scale: activeVideoRef === 2 && !isTransitioning ? 1 : 1.05
        }}
        transition={{ duration: fadeDuration / 1000, ease: "easeInOut" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80 z-10"></div>
    </div>
  )
}
