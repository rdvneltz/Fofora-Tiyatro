'use client'
import { useEffect,useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen,CalendarDays,ChevronRight,GalleryHorizontalEnd,Inbox,Plus,Type,Video } from 'lucide-react'

export default function Dashboard(){const {data}=useSession();const [stats,setStats]=useState({messages:0,events:0,posts:0})
 useEffect(()=>{Promise.all(['/api/inquiries?status=new','/api/calendar?admin=true','/api/blog?admin=true'].map(x=>fetch(x).then(r=>r.json()))).then(([a,b,c])=>setStats({messages:Array.isArray(a)?a.length:0,events:Array.isArray(b)?b.length:0,posts:Array.isArray(c)?c.length:0})).catch(()=>{})},[])
 const quick=[['Yeni duyuru','/admin/videos',Video],['Takvime ekle','/admin/calendar',CalendarDays],['Yeni haber','/admin/blog',BookOpen],['Medya yükle','/admin/gallery',GalleryHorizontalEnd]] as const
 return <div className="studio-page dashboard-studio"><header className="studio-head"><div><small>FOFORA YÖNETİM</small><h1>Bugün</h1><p>Merhaba {data?.user?.name||''}. Sitede neyi güncellemek istersin?</p></div><Link className="studio-primary" href="/admin/content"><Type/> Sayfa metinleri</Link></header>
 <section className="quick-grid">{quick.map(([title,href,Icon])=><Link href={href} key={href}><Icon/><strong>{title}</strong><ChevronRight/></Link>)}</section>
 <section className="dashboard-grid"><Link href="/admin/appointments"><span>Yeni mesaj</span><strong>{stats.messages}</strong><Inbox/></Link><Link href="/admin/calendar"><span>Takvim kaydı</span><strong>{stats.events}</strong><CalendarDays/></Link><Link href="/admin/blog"><span>Haber ve oyun</span><strong>{stats.posts}</strong><BookOpen/></Link></section>
 <section className="studio-card"><h2>Sık kullandıkların</h2><div className="shortcut-list"><Link href="/admin/videos"><Plus/> Hero ilanı veya video ekle</Link><Link href="/admin/calendar"><Plus/> Bugünün programını ekle</Link><Link href="/admin/gallery"><Plus/> Bizden Kareler’e fotoğraf/video yükle</Link><Link href="/admin/blog"><Plus/> Haber veya oyun yayınla</Link></div></section>
 </div>}
