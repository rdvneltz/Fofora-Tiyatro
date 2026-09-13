'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'

type Service = { id: string; title: string; description: string; image?: string; ageGroup?: string; duration?: string }

const fallbackServices: Service[] = [
  { id: 'cocuk', title: 'Çocuk', description: 'Oyunla keşfet, sahnede özgürleş.', ageGroup: '4–12 yaş', image: '/demo/training-1.jpg' },
  { id: 'genc', title: 'Genç', description: 'Sesini, bedenini ve hikâyeni bul.', ageGroup: '13–17 yaş', image: '/demo/training-2.jpg' },
  { id: 'yetiskin', title: 'Yetişkin', description: 'Gündelik hayatın dışına çık, sahneye adım at.', ageGroup: '18+', image: '/demo/training-3.jpg' },
  { id: 'konservatuvar', title: 'Konservatuvar', description: 'Sınava değil, sanat yolculuğuna hazırlan.', ageGroup: 'Hazırlık', image: '/demo/training-4.jpg' },
  { id: 'diksiyon', title: 'Diksiyon', description: 'Sözünü, nefesini ve etkini güçlendir.', ageGroup: 'Etkili iletişim', image: '/demo/training-5.jpg' },
]

export default function EgitimlerListing() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [label, setLabel] = useState('Eğitimler')

  useEffect(() => {
    fetch('/api/services').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data) && data.length) setServices(data) }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.educationTitle) setLabel(data.homepageContent.educationTitle)
    }).catch(() => undefined)
  }, [])

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">SAHNEYE ÇIK</p><h1>{label}</h1><p className="lead">Çocuk, genç, yetişkin ve konservatuvar hazırlık programlarımız.</p></div>
      <div className="listing-grid">
        {services.map(s => (
          <a key={s.id} className="listing-card" href={`${base}/egitimler/${s.id}`}>
            <div className="listing-media">{s.image && <Image src={s.image} alt={s.title} fill sizes="(max-width:700px) 100vw, 33vw" />}</div>
            <small>{s.ageGroup}{s.duration && ` • ${s.duration}`}</small>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </a>
        ))}
      </div>
    </main>
  </>
}
