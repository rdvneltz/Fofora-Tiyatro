'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, FileText, Users, Phone, Settings, Image, Star, BookOpen, Calendar, Clock, Video, Layout, UserCog } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    services: 0,
    team: 0,
    blog: 0,
    pendingAppointments: 0,
    testimonials: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const [servicesRes, teamRes, blogRes, appointmentsRes, testimonialsRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/team'),
        axios.get('/api/blog?admin=true'),
        axios.get('/api/appointments'),
        axios.get('/api/testimonials')
      ])

      setStats({
        services: servicesRes.data.length,
        team: teamRes.data.length,
        blog: blogRes.data.length,
        pendingAppointments: appointmentsRes.data.filter((a: any) => a.status === 'pending').length,
        testimonials: testimonialsRes.data.length
      })
    } catch (error) {
      console.error('İstatistikler yüklenemedi', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  const menuItems = [
    { title: 'Hero Bölümü', href: '/admin/hero', icon: <Image className="w-6 h-6" />, color: 'from-blue-500 to-blue-600' },
    { title: 'Hero Videoları', href: '/admin/videos', icon: <Video className="w-6 h-6" />, color: 'from-cyan-500 to-cyan-600' },
    { title: 'Programlar', href: '/admin/services', icon: <FileText className="w-6 h-6" />, color: 'from-green-500 to-green-600' },
    { title: 'Ekip', href: '/admin/team', icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
    { title: 'Hakkımızda', href: '/admin/about', icon: <LayoutDashboard className="w-6 h-6" />, color: 'from-yellow-500 to-yellow-600' },
    { title: 'İletişim', href: '/admin/contact', icon: <Phone className="w-6 h-6" />, color: 'from-red-500 to-red-600' },
    { title: 'Kayıtlar', href: '/admin/appointments', icon: <Calendar className="w-6 h-6" />, color: 'from-orange-500 to-orange-600' },
    { title: 'Uygun Saatler', href: '/admin/slots', icon: <Clock className="w-6 h-6" />, color: 'from-teal-500 to-teal-600' },
    { title: 'Yorumlar', href: '/admin/testimonials', icon: <Star className="w-6 h-6" />, color: 'from-pink-500 to-pink-600' },
    { title: 'Blog', href: '/admin/blog', icon: <BookOpen className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600' },
    { title: 'Footer', href: '/admin/footer', icon: <Layout className="w-6 h-6" />, color: 'from-slate-500 to-slate-600' },
    { title: 'Site Ayarları', href: '/admin/settings', icon: <Settings className="w-6 h-6" />, color: 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gold-300">Hoş geldiniz, {session?.user?.name}</p>
            </div>
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
            >
              <UserCog className="w-5 h-5" />
              Profil Ayarları
            </Link>
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

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">{stats.services}</div>
              <div className="text-white/70">Toplam Program</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">{stats.team}</div>
              <div className="text-white/70">Ekip Üyesi</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-gold-500 text-4xl font-bold mb-2">{stats.blog}</div>
              <div className="text-white/70">Blog Yazısı</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-orange-500 text-4xl font-bold mb-2">{stats.pendingAppointments}</div>
              <div className="text-white/70">Bekleyen Kayıt</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-pink-500 text-4xl font-bold mb-2">{stats.testimonials}</div>
              <div className="text-white/70">Öğrenci Yorumu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
