'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type Post = { id: string; title: string; slug: string; excerpt: string; image?: string; category: string; createdAt: string; tags?: string[] }

const sampleNews: Post[] = [
  { id: 'n1', title: 'Öğrencilerimizden Yeni Gösteri', slug: 'ogrenci-gosterisi', excerpt: 'Provalardan sahneye uzanan heyecanlı yolculuk.', category: 'Sahneden', createdAt: '2026-03-12', image: '/demo/story-4.jpg' },
  { id: 'n2', title: 'Üsküdar’da Tiyatroya Genç Bir Soluk', slug: 'uskudar-tiyatro', excerpt: 'Yeni dönemde yeni hikâyeler anlatıyoruz.', category: 'Bizden', createdAt: '2026-03-03', image: '/demo/story-5.jpg' },
  { id: 'n3', title: 'Atölyelerimizde Yeni Dönem', slug: 'yeni-donem', excerpt: 'Yaşına ve hedeflerine uygun programı keşfet.', category: 'Eğitim', createdAt: '2026-02-20', image: '/demo/story-6.jpg' },
]

export default function HaberlerListing() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [posts, setPosts] = useState<Post[]>([])
  const [label, setLabel] = useState('Bizden Haberler')
  usePageTitle(label)

  useEffect(() => {
    fetch('/api/blog').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setPosts(data) }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.newsTitle) setLabel(data.homepageContent.newsTitle)
    }).catch(() => undefined)
  }, [])

  const shown = posts.length ? posts : sampleNews

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">GÜNCEL</p><h1>{label}</h1><p className="lead">Fofora Tiyatro’dan güncel haberler ve duyurular.</p></div>
      <div className="listing-grid">
        {shown.map(p => (
          <a key={p.id} className="listing-card" href={`${base}/haberler/${p.slug}`}>
            <div className="listing-media">{p.image && <Image src={p.image} alt={p.title} fill sizes="(max-width:700px) 100vw, 33vw" />}</div>
            <small>{p.category} • {new Date(p.createdAt).toLocaleDateString('tr-TR')}</small>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                      border: '1px solid #c9c3b7',
                      color: 'var(--wine)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  </>
}
