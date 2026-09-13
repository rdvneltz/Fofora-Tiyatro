'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Menu, X } from 'lucide-react'

const defaultLabels = { playsTitle: 'Oyunlar', educationTitle: 'Eğitimler', impactTitle: 'Neler Yaptık?', newsTitle: 'Bizden Haberler', teamTitle: 'Ekibimiz' }

export default function SiteHeader({ variant = 'solid' }: { variant?: 'solid' | 'overlay' }) {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [menu, setMenu] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [labels, setLabels] = useState(defaultLabels)

  useEffect(() => {
    fetch('/api/settings').then(r => (r.ok ? r.json() : null)).then(data => {
      if (!data) return
      if (data.logo) setLogo(data.logo)
      setLabels(l => ({
        playsTitle: data.homepageContent?.playsTitle || l.playsTitle,
        educationTitle: data.homepageContent?.educationTitle || l.educationTitle,
        impactTitle: data.impactTitle || l.impactTitle,
        newsTitle: data.homepageContent?.newsTitle || l.newsTitle,
        teamTitle: data.homepageContent?.teamTitle || l.teamTitle,
      }))
    }).catch(() => undefined)
  }, [])

  const links: [string, string][] = [
    [labels.playsTitle, '/oyunlar'],
    [labels.educationTitle, '/egitimler'],
    [labels.impactTitle, '/neler-yaptik'],
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
      <nav className={menu ? 'nav-links open' : 'nav-links'}>
        {links.map(([label, href]) => (
          <Link key={href} href={`${base}${href}`} onClick={() => setMenu(false)}>{label}</Link>
        ))}
        <a href="https://instagram.com/foforatiyatro" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
      </nav>
      <button className="menu-button" onClick={() => setMenu(!menu)} aria-label={menu ? 'Menüyü kapat' : 'Menüyü aç'}>{menu ? <X /> : <Menu />}</button>
    </header>
  )
}
