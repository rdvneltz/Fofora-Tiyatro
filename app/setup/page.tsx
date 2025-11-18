'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/seed')
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || data.error || 'Bir hata oluştu')
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/murekkep-logo-saydam.png"
                alt="Mürekkep Hukuk"
                width={120}
                height={120}
                className="drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">İlk Kurulum</h1>
            <p className="text-gold-300">Veritabanını başlat</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-200 text-sm">
              <p className="mb-2">Bu işlem şunları yapacak:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Admin kullanıcısı oluşturacak</li>
                <li>Hero section verilerini ekleyecek</li>
                <li>İletişim bilgilerini ekleyecek</li>
                <li>Site ayarlarını oluşturacak</li>
              </ul>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-3 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kurulum yapılıyor...' : 'Kurulumu Başlat'}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Hata:</p>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-2">✅ {result.message}</p>
                {result.admin && (
                  <div className="mt-3 pt-3 border-t border-green-500/30">
                    <p className="font-semibold mb-2">Admin Giriş Bilgileri:</p>
                    <p>Email: {result.admin.email}</p>
                    <p>Şifre: {result.admin.password}</p>
                    <a
                      href="/admin/login"
                      className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Admin Panele Git →
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <a
                href="/"
                className="text-gold-400 hover:text-gold-300 text-sm transition"
              >
                ← Ana Sayfaya Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
