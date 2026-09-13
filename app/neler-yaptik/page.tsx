'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

const defaultStats = [['12', 'Oyun'], ['350+', 'Öğrenci'], ['28', 'Öğrenci gösterisi'], ['6', 'Yıllık yolculuk']]

export default function NelerYaptikPage() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [impact, setImpact] = useState({ title: 'Neler Yaptık?', intro: 'Her sayı bir prova, her fotoğraf başka bir karşılaşma. Fofora’nın bugüne kadar biriktirdiği hikâyeler.', stats: defaultStats, image: '/demo/story-5.jpg' })
  usePageTitle(impact.title)
  const [gallery, setGallery] = useState<{ id: string; items: { id: string; type: string; url: string; thumbnail?: string; title?: string }[] }[]>([])

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.impactStats) setImpact({ title: data.impactTitle || 'Neler Yaptık?', intro: data.impactIntro || '', stats: data.impactStats, image: data.impactImage || '/demo/story-5.jpg' })
    }).catch(() => undefined)
    fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setGallery(data) }).catch(() => undefined)
  }, [])

  const items = gallery.flatMap(a => a.items || []).slice(0, 12)

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">BİRLİKTE BÜYÜDÜK</p><h1>{impact.title}</h1><p className="lead">{impact.intro}</p></div>
      <div className="listing-stats" style={{ marginBottom: 50 }}>
        {impact.stats.map((s: string[]) => <div key={s[1]}><strong>{s[0]}</strong><span>{s[1]}</span></div>)}
      </div>
      {items.length > 0 && (
        <div className="listing-grid">
          {items.map(it => (
            <div key={it.id} className="listing-card">
              <div className="listing-media">
                {it.type === 'video'
                  ? <video src={it.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Image src={it.thumbnail || it.url} alt={it.title || ''} fill sizes="(max-width:700px) 100vw, 33vw" />}
              </div>
              {it.title && <p>{it.title}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  </>
}
