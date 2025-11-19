'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const heroHeight = window.innerHeight

      setScrolled(scrollPosition > 50)
      setShowLogo(scrollPosition > heroHeight * 0.7) // Show logo after 70% of hero section
    }

    handleScroll() // Initial check
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-900/95 backdrop-blur-lg shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
                onClick={() => scrollToSection('hero')}
              >
                <Image
                  src="/assets/murekkep-logo-saydam.png"
                  alt="Mürekkep Hukuk"
                  width={80}
                  height={80}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-6 ml-auto">
            {[
              { id: 'services', label: 'Hizmetler' },
              { id: 'about', label: 'Hakkımızda' },
              { id: 'team', label: 'Ekip' },
              { id: 'contact', label: 'İletişim' },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                whileHover={{ scale: 1.1, color: '#c19a6b' }}
                className="text-white font-medium transition-colors hidden md:block"
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
