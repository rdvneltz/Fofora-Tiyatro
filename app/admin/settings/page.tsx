'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold text-white">Site Ayarları</h1>
        </div>

        <div className="glass rounded-xl p-8">
          <p className="text-white/70">Bu sayfa yakında eklenecek...</p>
        </div>
      </div>
    </div>
  )
}
