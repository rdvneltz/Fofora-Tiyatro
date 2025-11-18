'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Image
              src="/assets/murekkep-logo-saydam.png"
              alt="Mürekkep Hukuk"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </motion.div>

          <div className="flex gap-6">
            {[
              { id: 'hero', label: 'Ana Sayfa' },
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

            <motion.a
              href="/admin/login"
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-6 py-2 rounded-full font-semibold hover:from-gold-700 hover:to-gold-600 transition-all"
            >
              Admin
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
