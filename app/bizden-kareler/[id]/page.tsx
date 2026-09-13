'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import SiteHeader from '../../../components/SiteHeader'
import usePageTitle from '../../../components/usePageTitle'

type GalleryItem = { id: string; type: string; url: string; thumbnail?: string; title?: string; description?: string; active: boolean }
type GalleryAlbum = { id: string; title: string; description?: string; active: boolean; items: GalleryItem[] }

export default function BizdenKarelerAlbumPage() {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [album, setAlbum] = useState<GalleryAlbum | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [openItem, setOpenItem] = useState<GalleryItem | null>(null)
  usePageTitle(album?.title)

  useEffect(() => {
    fetch(`/api/gallery?albumId=${id}`).then(r => r.ok ? r.json() : null).then(data => {
      if (data && data.active !== false) setAlbum(data)
      else setNotFound(true)
    }).catch(() => setNotFound(true))
  }, [id])

  if (notFound) return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/bizden-kareler`}><ArrowLeft /> Bizden Kareler’e dön</a>
      <h1>Albüm bulunamadı.</h1>
    </main>
  </>

  const items = (album?.items || []).filter(it => it.active)

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/bizden-kareler`}><ArrowLeft /> Bizden Kareler’e dön</a>
      {album && <div className="listing-header">
        <p className="eyebrow ink">PERDENİN ARKASI</p>
        <h1>{album.title}</h1>
        {album.description && <p className="lead">{album.description}</p>}
      </div>}
      {album && items.length === 0 && <p className="listing-empty">Bu albümde henüz paylaşılan bir kare yok.</p>}
      <div className="listing-grid">
        {items.map(it => (
          <button key={it.id} className="listing-card" onClick={() => setOpenItem(it)} aria-label={`${it.title || 'İçerik'} — büyüt`}>
            <div className="listing-media">
              {it.type === 'video'
                ? <video src={it.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Image src={it.thumbnail || it.url} alt={it.title || ''} fill sizes="(max-width:700px) 100vw, 33vw" />}
            </div>
            {it.title && <h3>{it.title}</h3>}
          </button>
        ))}
      </div>
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
