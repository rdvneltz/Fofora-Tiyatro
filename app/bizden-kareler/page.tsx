'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type GalleryItem = { id: string; type: string; url: string; thumbnail?: string; active: boolean }
type GalleryAlbum = { id: string; title: string; description?: string; coverImage?: string; active: boolean; items: GalleryItem[] }

export default function BizdenKarelerPage() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [label, setLabel] = useState('Bizden Kareler')
  usePageTitle(label)
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.reelsTitle) setLabel(data.homepageContent.reelsTitle)
    }).catch(() => undefined)
    fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setAlbums(data) }).catch(() => undefined)
  }, [])

  const visibleAlbums = useMemo(() => albums
    .filter(a => a.active)
    .map(a => ({ ...a, items: (a.items || []).filter(it => it.active) }))
    .filter(a => a.items.length > 0), [albums])

  const filteredAlbums = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    if (!q) return visibleAlbums
    return visibleAlbums.filter(a => a.title.toLocaleLowerCase('tr').includes(q) || a.description?.toLocaleLowerCase('tr').includes(q))
  }, [visibleAlbums, query])

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header">
        <p className="eyebrow ink">PERDENİN ARKASI</p>
        <h1>{label}</h1>
        <p className="lead">Prova salonundan sahneye, Fofora’nın biriktirdiği kareler. Bir albüm seçin.</p>
      </div>

      {visibleAlbums.length > 3 && (
        <div className="gallery-search">
          <Search />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Albümlerde ara..."
            aria-label="Albümlerde ara"
          />
        </div>
      )}

      {visibleAlbums.length === 0 && <p className="listing-empty">Henüz paylaşılan bir kare yok.</p>}
      {visibleAlbums.length > 0 && filteredAlbums.length === 0 && <p className="listing-empty">“{query}” ile eşleşen albüm bulunamadı.</p>}

      <div className="listing-grid">
        {filteredAlbums.map(album => {
          const cover = album.coverImage || album.items[0]?.thumbnail || album.items[0]?.url
          return (
            <a key={album.id} className="listing-card" href={`${base}/bizden-kareler/${album.id}`}>
              <div className="listing-media">
                {cover && <Image src={cover} alt={album.title} fill sizes="(max-width:700px) 100vw, 33vw" />}
              </div>
              <small>{album.items.length} KARE</small>
              <h3>{album.title}</h3>
              {album.description && <p>{album.description}</p>}
            </a>
          )
        })}
      </div>
    </main>
  </>
}
