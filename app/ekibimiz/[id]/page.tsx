'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Linkedin } from 'lucide-react'
import SiteHeader from '../../../components/SiteHeader'
import usePageTitle from '../../../components/usePageTitle'

type Team = { id: string; name: string; title: string; bio?: string; image: string; imagePosX?: number; imagePosY?: number; email?: string; phone?: string; linkedin?: string }

export default function EkibimizDetail() {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [member, setMember] = useState<Team | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [label, setLabel] = useState('Ekibimiz')
  usePageTitle(member?.name)

  useEffect(() => {
    fetch('/api/team').then(r => r.ok ? r.json() : []).then((items) => {
      if (Array.isArray(items)) {
        const found = items.find((m: Team) => m.id === id)
        if (found) setMember(found)
      }
    }).finally(() => setLoaded(true))
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.teamTitle) setLabel(data.homepageContent.teamTitle)
    }).catch(() => undefined)
  }, [id])

  if (loaded && !member) return <>
    <SiteHeader/>
    <main className="detail-page">
      <a href={`${base}/ekibimiz`}><ArrowLeft /> {label}’e dön</a>
      <h1>Ekip üyesi bulunamadı.</h1>
    </main>
  </>

  if (!member) return null

  return <>
    <SiteHeader/>
    <main className="detail-page">
      <a href={`${base}/ekibimiz`}><ArrowLeft /> {label}’e dön</a>
      <div className="detail-layout">
        <div className="detail-media">
          <Image src={member.image} alt={member.name} fill sizes="50vw" style={{ objectPosition: `${member.imagePosX ?? 50}% ${member.imagePosY ?? 50}%` }} />
        </div>
        <article>
          <p className="eyebrow ink">{member.title}</p>
          <h1>{member.name}</h1>
          {member.bio && <div className="rich-copy">{member.bio}</div>}
          {(member.email || member.phone || member.linkedin) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              {member.email && (
                <a href={`mailto:${member.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', color: 'inherit' }}>
                  <Mail style={{ width: 16, height: 16, flex: '0 0 auto' }} /> {member.email}
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', color: 'inherit' }}>
                  <Phone style={{ width: 16, height: 16, flex: '0 0 auto' }} /> {member.phone}
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', color: 'inherit' }}>
                  <Linkedin style={{ width: 16, height: 16, flex: '0 0 auto' }} /> LinkedIn
                </a>
              )}
            </div>
          )}
        </article>
      </div>
    </main>
  </>
}
