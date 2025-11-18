'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LayoutDashboard, FileText, Users, Phone, Settings, Image, Star, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  const menuItems = [
    { title: 'Hero Bölümü', href: '/admin/hero', icon: <Image className="w-6 h-6" />, color: 'from-blue-500 to-blue-600' },
    { title: 'Hizmetler', href: '/admin/services', icon: <FileText className="w-6 h-6" />, color: 'from-green-500 to-green-600' },
    { title: 'Ekip', href: '/admin/team', icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
    { title: 'Hakkımızda', href: '/admin/about', icon: <LayoutDashboard className="w-6 h-6" />, color: 'from-yellow-500 to-yellow-600' },
    { title: 'İletişim', href: '/admin/contact', icon: <Phone className="w-6 h-6" />, color: 'from-red-500 to-red-600' },
    { title: 'Yorumlar', href: '/admin/testimonials', icon: <Star className="w-6 h-6" />, color: 'from-pink-500 to-pink-600' },
    { title: 'Blog', href: '/admin/blog', icon: <BookOpen className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600' },
    { title: 'Site Ayarları', href: '/admin/settings', icon: <Settings className="w-6 h-6" />, color: 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gold-300">Hoş geldiniz, {session?.user?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="glass rounded-xl p-6 hover:bg-white/20 transition-all group hover:-translate-y-2"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">12</div>
              <div className="text-white/70">Toplam Hizmet</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">5</div>
              <div className="text-white/70">Ekip Üyesi</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">24</div>
              <div className="text-white/70">Blog Yazısı</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
