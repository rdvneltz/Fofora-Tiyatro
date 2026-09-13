'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Menu, X } from 'lucide-react'

const defaultLabels = { playsTitle: 'Oyunlar', educationTitle: 'Eğitimler', impactTitle: 'Neler Yaptık?', reelsTitle: 'Bizden Kareler', newsTitle: 'Bizden Haberler', teamTitle: 'Ekibimiz' }

export default function SiteHeader({ variant = 'solid', minimal = false }: { variant?: 'solid' | 'overlay'; minimal?: boolean }) {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [menu, setMenu] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [labels, setLabels] = useState(defaultLabels)

  useEffect(() => {
    fetch('/api/settings').then(r => (r.ok ? r.json() : null)).then(data => {
      if (!data) return
      if (data.logo) setLogo(data.logo)
      if (minimal) return
      setLabels(l => ({
        playsTitle: data.homepageContent?.playsTitle || l.playsTitle,
        educationTitle: data.homepageContent?.educationTitle || l.educationTitle,
        impactTitle: data.impactTitle || l.impactTitle,
        reelsTitle: data.homepageContent?.reelsTitle || l.reelsTitle,
        newsTitle: data.homepageContent?.newsTitle || l.newsTitle,
        teamTitle: data.homepageContent?.teamTitle || l.teamTitle,
      }))
    }).catch(() => undefined)
  }, [])

  const links: [string, string][] = [
    [labels.playsTitle, '/oyunlar'],
    [labels.educationTitle, '/egitimler'],
    [labels.impactTitle, '/neler-yaptik'],
    [labels.reelsTitle, '/bizden-kareler'],
    ['Hakkımızda', '/hakkimizda'],
    [labels.newsTitle, '/haberler'],
    [labels.teamTitle, '/ekibimiz'],
    ['İletişim', '/iletisim'],
  ]

  return (
    <header className={variant === 'overlay' ? 'topbar' : 'topbar solid'}>
      <Link href={`${base}/`} className="brand" onClick={() => setMenu(false)}>
        {logo ? <img src={logo} alt="Fofora Tiyatro" className="brand-logo" /> : <><span>Fofora</span><small>TIYATRO</small></>}
      </Link>
      {!minimal && <>
        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          {links.map(([label, href]) => {
            const currentPath = base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname
            const isActive = currentPath === href || currentPath.startsWith(`${href}/`)
            return <Link key={href} href={`${base}${href}`} className={isActive ? 'active' : undefined} onClick={() => setMenu(false)}>{label}</Link>
          })}
          <a href="https://instagram.com/foforatiyatro" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
        </nav>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Menüyü kapat' : 'Menüyü aç'}>{menu ? <X /> : <Menu />}</button>
      </>}
    </header>
  )
}
