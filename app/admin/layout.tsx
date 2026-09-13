'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { BookOpen, CalendarDays, ChevronLeft, FileText, GalleryHorizontalEnd, Inbox, Instagram, Info, LayoutDashboard, LogOut, Menu, MessageSquareQuote, PanelBottom, Phone, Settings, Sparkles, Type, User, Users, Video, X } from 'lucide-react'
import { useState } from 'react'

const links=[
  ['Bugün','/admin/dashboard',LayoutDashboard],['Hızlı Metin Düzenle','/admin/content',Type],['Takvim','/admin/calendar',CalendarDays],['Vitrin ve Duyurular','/admin/videos',Video],['Programlar','/admin/services',FileText],['Neler Yaptık?','/admin/impact',Sparkles],['Mesaj Kutusu','/admin/appointments',Inbox],['Bizden Haberler','/admin/blog',BookOpen],['Galeri ve Bizden Kareler','/admin/gallery',GalleryHorizontalEnd],['Ekip','/admin/team',Users],['İletişim Bilgileri','/admin/contact',Phone],['Hakkımızda','/admin/about',Info],['Yorumlar','/admin/testimonials',MessageSquareQuote],['Instagram','/admin/instagram',Instagram],['Footer Ayarları','/admin/footer',PanelBottom],['Site Ayarları','/admin/settings',Settings],
] as const
export default function AdminLayout({children}:{children:React.ReactNode}){const path=usePathname(),[open,setOpen]=useState(false);if(path==='/admin/login')return children;return <div className="admin-frame"><button className="admin-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><aside className={open?'open':''}><Link href="/admin/dashboard" className="admin-brand"><span>Fofora</span><small>İÇERİK STÜDYOSU</small></Link><nav>{links.map(([name,href,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={path===href?'active':''}><Icon/>{name}</Link>)}</nav><div className="admin-bottom"><Link href="/admin/profile" onClick={()=>setOpen(false)} className={path==='/admin/profile'?'active':''}><User/> Profil</Link><Link href="/yeni" target="_blank"><ChevronLeft/> Yeni siteyi görüntüle</Link><button onClick={()=>signOut({callbackUrl:'/admin/login'})}><LogOut/> Çıkış yap</button></div></aside><div className="admin-content">{children}</div></div>}
