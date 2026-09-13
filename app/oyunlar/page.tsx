'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type Post = { id: string; title: string; slug: string; excerpt: string; image?: string; category: string; createdAt: string }

const samplePosts: Post[] = [
  { id: 'p1', title: 'Fiyonk', slug: 'fiyonk', excerpt: 'Acının gölgesinde yeni bir oyun.', category: 'Yeni oyun', createdAt: '2026-03-20', image: '/demo/story-1.jpg' },
  { id: 'p2', title: 'Sen Kimsin?', slug: 'sen-kimsin', excerpt: 'Çocuk oyunumuz seyirciyle buluşuyor.', category: 'Öğrenci oyunu', createdAt: '2026-04-12', image: '/demo/story-2.jpg' },
  { id: 'p3', title: 'Bir Nefes Dede Korkut', slug: 'dede-korkut', excerpt: 'Masallar sahnede yeniden hayat buluyor.', category: 'Turne', createdAt: '2026-05-08', image: '/demo/story-3.jpg' },
  { id: 'p4', title: 'Tartuffe', slug: 'tartuffe', excerpt: 'Klasik metin, Fofora sahnesinde yeni bir yorumla.', category: 'Yeni oyun', createdAt: '2026-06-22', image: '/demo/story-6.jpg' },
]

export default function OyunlarListing() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [posts, setPosts] = useState<Post[]>([])
  const [label, setLabel] = useState('Oyunlar')
  usePageTitle(label)

  useEffect(() => {
    fetch('/api/blog').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setPosts(data) }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.playsTitle) setLabel(data.homepageContent.playsTitle)
    }).catch(() => undefined)
  }, [])

  const plays = posts.filter(p => /oyun|etkinlik/i.test(p.category))
  const shown = plays.length ? plays : samplePosts

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">SAHNEDE</p><h1>{label}</h1><p className="lead">Fofora sahnesindeki güncel ve yaklaşan oyunlar.</p></div>
      {shown.length ? (
        <div className="listing-grid">
          {shown.map(p => (
            <a key={p.id} className="listing-card" href={`${base}/haberler/${p.slug}`}>
              <div className="listing-media">{p.image && <Image src={p.image} alt={p.title} fill sizes="(max-width:700px) 100vw, 33vw" />}</div>
              <small>{p.category}</small>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </a>
          ))}
        </div>
      ) : <p className="listing-empty">Henüz oyun eklenmemiş.</p>}
    </main>
  </>
}
