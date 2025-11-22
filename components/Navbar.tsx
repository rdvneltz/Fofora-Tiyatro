'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import axios from 'axios'
import { Menu, X, Instagram, Youtube } from 'lucide-react'

interface SectionVisibility {
  hero: boolean
  services: boolean
  about: boolean
  team: boolean
  testimonials: boolean
  blog: boolean
  contact: boolean
}

interface SocialMediaLink {
  platform: string
  url: string
  active: boolean
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    hero: true,
    services: true,
    about: true,
    team: true,
    testimonials: true,
    blog: true,
    contact: true
  })
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([])
  const [logo, setLogo] = useState<string>('/assets/fofora-logo.png')

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings')
        if (res.data && res.data.sectionVisibility) {
          setSectionVisibility(res.data.sectionVisibility)
        }
        if (res.data && res.data.socialMedia) {
          // Ensure socialMedia is an array
          const socialMedia = Array.isArray(res.data.socialMedia)
            ? res.data.socialMedia
            : []
          setSocialMediaLinks(socialMedia)
        }
        if (res.data && res.data.logo) {
          setLogo(res.data.logo)
        }
      } catch (error) {
        console.error('Failed to fetch navbar settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
      setMobileMenuOpen(false) // Close mobile menu after clicking
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      case 'youtube':
        return <Youtube className="w-5 h-5" />
      default:
        return null
    }
  }

  const navItems = [
    { id: 'services', label: 'Programlar', visible: sectionVisibility.services },
    { id: 'about', label: 'Hakkımızda', visible: sectionVisibility.about },
    { id: 'team', label: 'Ekip', visible: sectionVisibility.team },
    { id: 'testimonials', label: 'Yorumlar', visible: sectionVisibility.testimonials },
    { id: 'blog', label: 'Blog', visible: sectionVisibility.blog },
    { id: 'contact', label: 'İletişim', visible: sectionVisibility.contact },
  ].filter(item => item.visible)

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
                  src={logo}
                  alt="Fofora Tiyatro"
                  width={80}
                  height={80}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 ml-auto items-center">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                whileHover={{ scale: 1.1, color: '#c19a6b' }}
                className="text-white font-medium transition-colors"
              >
                {item.label}
              </motion.button>
            ))}

            {/* Social Media Icons */}
            {socialMediaLinks.filter(link => link.active).map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, color: '#c19a6b' }}
                className="text-white transition-colors"
              >
                {getSocialIcon(link.platform)}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-auto text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-4 py-4 px-2">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    whileTap={{ scale: 0.95 }}
                    className="text-white font-medium text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ))}

                {/* Social Media Icons in Mobile */}
                {socialMediaLinks.filter(link => link.active).length > 0 && (
                  <div className="flex gap-6 pt-4 px-3 border-t border-white/10">
                    {socialMediaLinks.filter(link => link.active).map((link, index) => (
                      <motion.a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.9 }}
                        className="text-white"
                      >
                        {getSocialIcon(link.platform)}
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
