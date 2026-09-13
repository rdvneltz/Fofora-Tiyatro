'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type GalleryItem = { id: string; type: string; url: string; thumbnail?: string; title?: string; description?: string; active: boolean }
type GalleryAlbum = { id: string; title: string; description?: string; active: boolean; items: GalleryItem[] }

export default function BizdenKarelerPage() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [label, setLabel] = useState('Bizden Kareler')
  usePageTitle(label)
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [openItem, setOpenItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.reelsTitle) setLabel(data.homepageContent.reelsTitle)
    }).catch(() => undefined)
    fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setAlbums(data) }).catch(() => undefined)
  }, [])

  const visibleAlbums = albums
    .filter(a => a.active)
    .map(a => ({ ...a, items: (a.items || []).filter(it => it.active) }))
    .filter(a => a.items.length > 0)

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">PERDENİN ARKASI</p><h1>{label}</h1><p className="lead">Prova salonundan sahneye, Fofora’nın biriktirdiği kareler.</p></div>
      {visibleAlbums.length === 0 && <p className="listing-empty">Henüz paylaşılan bir kare yok.</p>}
      {visibleAlbums.map(album => (
        <section className="gallery-album" key={album.id}>
          <h2>{album.title}</h2>
          {album.description && <p className="gallery-album-desc">{album.description}</p>}
          <div className="listing-grid">
            {album.items.map(it => (
              <button key={it.id} className="listing-card" onClick={() => setOpenItem(it)} aria-label={`${it.title || 'İçerik'} — büyüt`}>
                <div className="listing-media">
                  {it.type === 'video'
                    ? <video src={it.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Image src={it.thumbnail || it.url} alt={it.title || ''} fill sizes="(max-width:700px) 100vw, 33vw" />}
                </div>
                {it.title && <p>{it.title}</p>}
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
    {openItem && <div className="reel-modal" role="dialog" aria-modal="true" aria-label={openItem.title || 'İçerik'} onClick={() => setOpenItem(null)}>
      <button className="modal-close" onClick={() => setOpenItem(null)} aria-label="Kapat"><X/></button>
      <div className="reel-modal-inner" onClick={e => e.stopPropagation()}>
        <div className="reel-modal-media">{openItem.type === 'video' ? <video src={openItem.url} controls autoPlay playsInline/> : <Image src={openItem.thumbnail || openItem.url} alt={openItem.title || ''} fill sizes="60vw"/>}</div>
        {(openItem.title || openItem.description) && <div className="reel-modal-copy">{openItem.title && <h3>{openItem.title}</h3>}{openItem.description && <p>{openItem.description}</p>}</div>}
      </div>
    </div>}
  </>
}
