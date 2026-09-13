'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, MessageCircle } from 'lucide-react'

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

  useEffect(() => {
    fetch('/api/services').then((response) => response.ok ? response.json() : []).then((items) => {
      if (!Array.isArray(items)) return
      const found = items.find((service: any) => service.id === id) || items.find((service: any) => service.title?.toLocaleLowerCase('tr').includes(id.replaceAll('-', ' ')))
      if (found) setItem(found)
    }).catch(() => undefined)
  }, [id])

  if (!item) return <main className="detail-page"><a href={`${base}/#egitimler`}><ArrowLeft /> Eğitimlere dön</a><h1>Program bulunamadı.</h1></main>
  return <main className="detail-page"><a href={`${base}/#egitimler`}><ArrowLeft /> Eğitimlere dön</a><div className="detail-layout"><div className="detail-media">{item.image && <Image src={item.image} alt={item.title} fill sizes="50vw" />}</div><article><p className="eyebrow">{item.ageGroup} {item.duration && `• ${item.duration}`}</p><h1>{item.title}</h1><p className="lead">{item.description}</p><div className="rich-copy">{item.details}</div><a className="button acid" href={`${base}/#iletisim`}>Bilgi al <MessageCircle /></a></article></div></main>
}
