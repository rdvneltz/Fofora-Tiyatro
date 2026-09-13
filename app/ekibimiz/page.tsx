'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type Team = { id: string; name: string; title: string; image: string; bio?: string; email?: string; phone?: string }

const BIO_EXCERPT_LENGTH = 120

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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  usePageTitle(label)

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

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
            {m.bio && (
              <p>
                {expanded[m.id] || m.bio.length <= BIO_EXCERPT_LENGTH ? m.bio : `${m.bio.slice(0, BIO_EXCERPT_LENGTH)}…`}
                {m.bio.length > BIO_EXCERPT_LENGTH && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(m.id)}
                    style={{ display: 'block', marginTop: 4, background: 'none', border: 0, padding: 0, color: 'var(--wine)', fontWeight: 700, fontSize: '.75rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    {expanded[m.id] ? 'Daha az göster' : 'Devamını oku'}
                  </button>
                )}
              </p>
            )}
            {(m.email || m.phone) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {m.email && (
                  <a href={`mailto:${m.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'inherit' }}>
                    <Mail style={{ width: 14, height: 14, flex: '0 0 auto' }} /> {m.email}
                  </a>
                )}
                {m.phone && (
                  <a href={`tel:${m.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'inherit' }}>
                    <Phone style={{ width: 14, height: 14, flex: '0 0 auto' }} /> {m.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  </>
}
