'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface LegalLink {
  title: string
  content: string
  active: boolean
  order: number
}

interface FooterProps {
  copyrightText?: string
  legalLinks?: LegalLink[]
}

export default function Footer() {
  const [copyrightText, setCopyrightText] = useState('© 2024 Fofora Tiyatro. Tüm hakları saklıdır.')
  const [legalLinks, setLegalLinks] = useState<LegalLink[]>([])
  const [logo, setLogo] = useState<string>('/assets/fofora-logo.png')
  const [selectedLegalContent, setSelectedLegalContent] = useState<{
    title: string
    content: string
  } | null>(null)

  useEffect(() => {
    fetchFooterSettings()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedLegalContent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedLegalContent])

  const fetchFooterSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings')
      if (data.copyrightText) {
        setCopyrightText(data.copyrightText)
      }
      if (data.legalLinks && Array.isArray(data.legalLinks)) {
        const activeLinks = data.legalLinks
          .filter((link: LegalLink) => link.active)
          .sort((a: LegalLink, b: LegalLink) => a.order - b.order)
        setLegalLinks(activeLinks)
      }
      if (data.logo) {
        setLogo(data.logo)
      }
    } catch (error) {
      console.error('Failed to fetch footer settings:', error)
    }
  }

  const openLegalModal = (link: LegalLink) => {
    setSelectedLegalContent({
      title: link.title,
      content: link.content
    })
  }

  const closeLegalModal = () => {
    setSelectedLegalContent(null)
  }

  return (
    <>
      <footer className="bg-navy-900 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src={logo}
            alt="Fofora Tiyatro"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <p className="text-white/60 mb-4">
            {copyrightText}
          </p>
          <div className="flex justify-center items-center gap-4 text-white/60 flex-wrap">
            {legalLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-4">
                <button
                  onClick={() => openLegalModal(link)}
                  className="hover:text-gold-500 transition cursor-pointer"
                >
                  {link.title}
                </button>
                {index < legalLinks.length - 1 && <span className="text-white/40">|</span>}
              </div>
            ))}
            {legalLinks.length > 0 && <span className="text-white/40">|</span>}
            <a
              href="/admin/login"
              className="text-white/40 hover:text-gold-500 transition-colors"
              title="Admin Paneli"
            >
              <Settings className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Legal Content Modal */}
      <AnimatePresence>
        {selectedLegalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLegalModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-white/10"
            >
              {/* Modal Header */}
              <div className="bg-navy-900/50 border-b border-white/10 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {selectedLegalContent.title}
                </h2>
                <button
                  onClick={closeLegalModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="prose prose-invert prose-gold max-w-none">
                  <div
                    className="text-white/80 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedLegalContent.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-navy-900/50 border-t border-white/10 px-8 py-4 flex justify-end">
                <button
                  onClick={closeLegalModal}
                  className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
