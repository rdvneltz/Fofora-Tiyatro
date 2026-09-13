'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ArrowRight, Mail, MapPin, MessageCircle, Quote, Star } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type TestimonialItem = { id: string; name: string; title: string; content: string; rating: number }

export default function IletisimPage() {
  usePageTitle('İletişim')
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [contact, setContact] = useState({ phone: '+90 538 496 26 24', email: 'foforatiyatro@gmail.com', address: 'İcadiye, Üsküdar / İstanbul', mapUrl: '' })
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch('/api/contact').then(r => r.ok ? r.json() : null).then(data => { if (data?.phone) setContact(data) }).catch(() => undefined)
    fetch('/api/testimonials').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setTestimonials(data) }).catch(() => undefined)
  }, [])

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    const form = e.currentTarget
    const res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) })
    setSending(false)
    if (res.ok) { form.reset(); setSent(true) }
  }

  return <>
    <SiteHeader/>
    <main className="listing-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">BİR MERHABA YETER</p><h1>İletişim</h1><p className="lead">Soru, fikir, iş birliği ya da eğitim bilgisi… Mesajınız doğrudan ekibimizin gelen kutusuna ulaşsın.</p></div>
      <div className="contact-page-grid">
        <div className="contact-page-info">
          <div className="contact-copy"><div><a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp’tan yaz</a><a href={`mailto:${contact.email}`}><Mail /> {contact.email}</a><a href={contact.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer"><MapPin /> {contact.address}</a></div></div>
          {testimonials.length > 0 && <div className="contact-testimonials" style={{ marginTop: 40 }}>
            <h3><Quote /> Ne Diyorlar?</h3>
            <div className="testimonials-grid" style={{ gridTemplateColumns: '1fr' }}>
              {testimonials.map(t => (
                <article key={t.id}>
                  {t.rating > 0 && <div className="stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} fill={i < t.rating ? 'currentColor' : 'none'} />)}</div>}
                  <p>“{t.content}”</p>
                  <span>{t.name}{t.title ? ` · ${t.title}` : ''}</span>
                </article>
              ))}
            </div>
          </div>}
        </div>
        <form className="contact-page-form" onSubmit={send}>
          <div className="form-row"><label>Adınız Soyadınız<input name="name" required /></label><label>Telefon<input name="phone" required /></label></div>
          <label>E-posta<input name="email" type="email" /></label>
          <label>Konu<select name="subject" required defaultValue=""><option value="" disabled>Bir konu seçin</option><option>Eğitimler</option><option>Oyunlar ve bilet</option><option>Okul / kurum iş birliği</option><option>Basın ve iletişim</option><option>Diğer</option></select></label>
          <label>Mesajınız<textarea name="message" rows={6} required /></label>
          <button className="button form-button" disabled={sending}>{sending ? 'Gönderiliyor…' : 'Mesajı gönder'} <ArrowRight /></button>
          {sent && <p className="success">Mesajınız iletildi, teşekkürler!</p>}
        </form>
      </div>
    </main>
  </>
}
