'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'

type About = { title: string; content: string; mission?: string | null; vision?: string | null; values: string[]; image?: string | null }

const fallback: About = {
  title: 'Hakkımızda',
  content: 'Fofora Tiyatro, Üsküdar’da çocuk, genç ve yetişkinlere yönelik tiyatro eğitimleri veren, sahneyi birlikte üreten bir topluluktur. Oyna. Öğren. Üret. Birlikte büyü.',
  mission: null,
  vision: null,
  values: [],
  image: '/demo/story-5.jpg',
}

export default function AboutPage() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [about, setAbout] = useState<About>(fallback)

  useEffect(() => {
    fetch('/api/about').then(r => (r.ok ? r.json() : null)).then(data => {
      if (data && data.title) setAbout({ ...fallback, ...data })
    }).catch(() => undefined)
  }, [])

  return (
    <>
    <SiteHeader/>
    <main className="detail-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      {about.image && <div className="detail-hero"><Image src={about.image} alt={about.title} fill priority sizes="100vw" /></div>}
      <article className="news-detail">
        <p className="eyebrow ink">FOFORA TİYATRO</p>
        <h1>{about.title}</h1>
        <div className="rich-copy">{about.content}</div>
        {(about.mission || about.vision) && (
          <div className="about-pillars">
            {about.mission && <div><h3>Misyonumuz</h3><p>{about.mission}</p></div>}
            {about.vision && <div><h3>Vizyonumuz</h3><p>{about.vision}</p></div>}
          </div>
        )}
        {about.values?.length > 0 && (
          <div className="about-values">
            <h3>Değerlerimiz</h3>
            <ul>{about.values.map(v => <li key={v}><Check /> {v}</li>)}</ul>
          </div>
        )}
      </article>
    </main>
    </>
  )
}
