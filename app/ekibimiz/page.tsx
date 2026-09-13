'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type Team = { id: string; name: string; title: string; image: string }

const fallbackTeam: Team[] = [
  { id: 't1', name: 'Zeynep Arslan', title: 'Kurucu / Sanat Yönetmeni', image: '/demo/training-3.jpg' },
  { id: 't2', name: 'Murat Can Demir', title: 'Eğitmen', image: '/demo/training-4.jpg' },
  { id: 't3', name: 'Elif Kaya', title: 'Eğitmen', image: '/demo/training-5.jpg' },
  { id: 't4', name: 'Kerem Yıldız', title: 'Eğitmen', image: '/demo/training-2.jpg' },
]

export default function EkibimizListing() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [team, setTeam] = useState<Team[]>(fallbackTeam)
  const [label, setLabel] = useState('Ekibimiz')
  usePageTitle(label)

  useEffect(() => {
    fetch('/api/team').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data) && data.length) setTeam(data) }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.teamTitle) setLabel(data.homepageContent.teamTitle)
    }).catch(() => undefined)
  }, [])

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">BİRLİKTE ÜRETİYORUZ</p><h1>{label}</h1><p className="lead">Fofora Tiyatro’yu birlikte var eden eğitmen ve ekip.</p></div>
      <div className="listing-grid">
        {team.map(m => (
          <div key={m.id} className="listing-card">
            <div className="listing-media"><Image src={m.image} alt={m.name} fill sizes="(max-width:700px) 100vw, 33vw" /></div>
            <h3>{m.name}</h3>
            <p>{m.title}</p>
          </div>
        ))}
      </div>
    </main>
  </>
}
