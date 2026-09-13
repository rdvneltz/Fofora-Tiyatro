'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.impactStats) setImpact({ title: data.impactTitle || 'Neler Yaptık?', intro: data.impactIntro || '', stats: data.impactStats, image: data.impactImage || '/demo/story-5.jpg' })
    }).catch(() => undefined)
  }, [])

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">BİRLİKTE BÜYÜDÜK</p><h1>{impact.title}</h1><p className="lead">{impact.intro}</p></div>
      <div className="listing-stats">
        {impact.stats.map((s: string[]) => <div key={s[1]}><strong>{s[0]}</strong><span>{s[1]}</span></div>)}
      </div>
    </main>
  </>
}
