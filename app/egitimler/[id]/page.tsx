'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, MessageCircle, Sparkles, type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import SiteHeader from '../../../components/SiteHeader'
import usePageTitle from '../../../components/usePageTitle'

// Programın "icon" alanı bir lucide-react ikon adı (örn. "Scale") ya da bir emoji olabilir.
function ServiceIcon({ icon }: { icon?: string }) {
  if (!icon) return null
  const isEmoji = /\p{Extended_Pictographic}/u.test(icon)
  if (isEmoji) return <span className="detail-icon" aria-hidden>{icon}</span>
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[icon] || Sparkles
  return <Icon className="detail-icon" aria-hidden />
}

const fallbackPrograms: Record<string, any> = {
  cocuk: { title: 'Çocuk', ageGroup: '4–12 yaş', description: 'Oyunla keşfet, sahnede özgürleş.', details: 'Çocukların hayal gücünü, ifade becerisini ve ekip ruhunu oyun yoluyla güçlendiren yaratıcı tiyatro programı.', image: '/demo/training-1.jpg' },
  genc: { title: 'Genç', ageGroup: '13–17 yaş', description: 'Sesini, bedenini ve hikâyeni bul.', details: 'Gençlerin özgüvenini ve sahne dilini geliştiren; doğaçlama, karakter ve metin çalışmalarını buluşturan program.', image: '/demo/training-2.jpg' },
  yetiskin: { title: 'Yetişkin', ageGroup: '18+', description: 'Gündelik hayatın dışına çık, sahneye adım at.', details: 'Deneyim şartı olmadan beden, ses, doğaçlama ve oyunculuk araçlarıyla tanışabileceğiniz yetişkin atölyesi.', image: '/demo/training-3.jpg' },
  konservatuvar: { title: 'Konservatuvar', ageGroup: 'Hazırlık', description: 'Sınava değil, sanat yolculuğuna hazırlan.', details: 'Oyunculuk bölümlerine hazırlanan adaylar için sahne, tirat, ses ve hareket odaklı yoğunlaştırılmış çalışma.', image: '/demo/training-4.jpg' },
  diksiyon: { title: 'Diksiyon', ageGroup: 'Etkili iletişim', description: 'Sözünü, nefesini ve etkini güçlendir.', details: 'Doğru nefes, artikülasyon, vurgu ve topluluk önünde etkili konuşma becerilerini geliştiren program.', image: '/demo/training-5.jpg' },
}

export default function EducationDetail() {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [item, setItem] = useState<any>(fallbackPrograms[id])
  usePageTitle(item?.title)
  const [label, setLabel] = useState('Eğitimler')
  const [contact, setContact] = useState({ phone: '+90 538 496 26 24' })
  const [whatsappText, setWhatsappText] = useState('Merhaba, {program} hakkında bilgi almak istiyorum.')

  useEffect(() => {
    fetch('/api/services').then((response) => response.ok ? response.json() : []).then((items) => {
      if (!Array.isArray(items)) return
      const found = items.find((service: any) => service.id === id) || items.find((service: any) => service.title?.toLocaleLowerCase('tr').includes(id.replaceAll('-', ' ')))
      if (found) setItem(found)
    }).catch(() => undefined)
    fetch('/api/contact').then(r => r.ok ? r.json() : null).then(data => { if (data?.phone) setContact(data) }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.educationTitle) setLabel(data.homepageContent.educationTitle)
      if (data?.homepageContent?.whatsappText) setWhatsappText(data.homepageContent.whatsappText)
    }).catch(() => undefined)
  }, [id])

  const waHref = `https://wa.me/${contact.phone.replace(/\D/g, '').replace(/^0/, '90')}?text=${encodeURIComponent(item ? `Merhaba, "${item.title}" programı hakkında bilgi almak istiyorum.` : whatsappText)}`

  if (!item) return <><SiteHeader/><main className="detail-page"><a href={`${base}/egitimler`}><ArrowLeft /> {label}’e dön</a><h1>Program bulunamadı.</h1></main></>
  return <>
    <SiteHeader/>
    <main className="detail-page">
      <a href={`${base}/egitimler`}><ArrowLeft /> {label}’e dön</a>
      <div className="detail-layout">
        <div className="detail-media">{item.image && <Image src={item.image} alt={item.title} fill sizes="50vw" />}</div>
        <article>
          <p className="eyebrow ink">{item.ageGroup} {item.duration && `• ${item.duration}`}</p>
          <h1><ServiceIcon icon={item.icon} /> {item.title}</h1>
          <p className="lead">{item.description}</p>
          <div className="rich-copy">{item.details}</div>
          <a className="button acid" href={waHref} target="_blank" rel="noopener noreferrer">Bilgi al <MessageCircle /></a>
        </article>
      </div>
    </main>
  </>
}
