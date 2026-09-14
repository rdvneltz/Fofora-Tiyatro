'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type Team = { id: string; name: string; title: string; image: string; imagePosX?: number; imagePosY?: number; bio?: string; email?: string; phone?: string }

const BIO_EXCERPT_LENGTH = 120

export default function EkibimizListing() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [team, setTeam] = useState<Team[]>([])
  const [loaded, setLoaded] = useState(false)
  const [label, setLabel] = useState('Ekibimiz')
  usePageTitle(label)

  useEffect(() => {
    fetch('/api/team').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setTeam(data) }).catch(() => undefined).finally(() => setLoaded(true))
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.teamTitle) setLabel(data.homepageContent.teamTitle)
    }).catch(() => undefined)
  }, [])

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">BİRLİKTE ÜRETİYORUZ</p><h1>{label}</h1><p className="lead">Fofora Tiyatro’yu birlikte var eden eğitmen ve ekip.</p></div>
      {!loaded ? (
        <div className="listing-grid">{Array.from({ length: 4 }, (_, i) => <div className="listing-card skeleton-block" key={i} style={{ aspectRatio: '3/4' }} />)}</div>
      ) : team.length ? (
        <div className="listing-grid">
          {team.map(m => (
            <a key={m.id} className="listing-card" href={`${base}/ekibimiz/${m.id}`}>
              <div className="listing-media"><Image src={m.image} alt={m.name} fill sizes="(max-width:700px) 100vw, 33vw" style={{ objectPosition: `${m.imagePosX ?? 50}% ${m.imagePosY ?? 50}%` }} /></div>
              <h3>{m.name}</h3>
              <p>{m.title}</p>
              {m.bio && <p>{m.bio.length <= BIO_EXCERPT_LENGTH ? m.bio : `${m.bio.slice(0, BIO_EXCERPT_LENGTH)}…`}</p>}
            </a>
          ))}
        </div>
      ) : <p className="listing-empty">Henüz ekip üyesi eklenmemiş.</p>}
    </main>
  </>
}
