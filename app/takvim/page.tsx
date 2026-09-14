'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import usePageTitle from '../../components/usePageTitle'

type CalendarEvent = { id: string; title: string; type: string; date: string; startTime: string; endTime?: string; location?: string; description?: string }

const typeLabel: Record<string, string> = { education: 'Eğitim', play: 'Oyun', rehearsal: 'Prova', other: 'Diğer' }

export default function TakvimPage() {
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loaded, setLoaded] = useState(false)
  usePageTitle('Takvim')

  useEffect(() => {
    fetch('/api/calendar').then(r => r.ok ? r.json() : []).then(data => { if (Array.isArray(data)) setEvents(data) }).finally(() => setLoaded(true))
  }, [])

  // Aynı gün birden fazla etkinlik olabildiği için gün bazında grupluyoruz - aynı saatte
  // çakışan etkinlikler de aynı grup içinde ayrı satırlar olarak görünür, gizlenmez.
  const groups: { key: string; label: string; items: CalendarEvent[] }[] = []
  events.forEach(ev => {
    const key = ev.date.slice(0, 10)
    let group = groups.find(g => g.key === key)
    if (!group) {
      const label = new Date(ev.date).toLocaleDateString('tr-TR', { weekday: 'long', day: '2-digit', month: 'long' })
      group = { key, label, items: [] }
      groups.push(group)
    }
    group.items.push(ev)
  })

  return <>
    <SiteHeader/>
    <main className="listing-page takvim-page">
      <a href={`${base}/`}><ArrowLeft /> Ana sayfaya dön</a>
      <div className="listing-header"><p className="eyebrow ink">TAKVİM</p><h1>Takvim</h1><p className="lead">Oyun, eğitim ve provalarımızın tam listesi.</p></div>
      {!loaded ? (
        <div className="takvim-groups">{Array.from({ length: 3 }, (_, i) => <div className="skeleton-block" key={i} style={{ height: 140 }} />)}</div>
      ) : groups.length ? (
        <div className="takvim-groups">
          {groups.map(g => {
            const timeCounts = new Map<string, number>()
            g.items.forEach(ev => timeCounts.set(ev.startTime, (timeCounts.get(ev.startTime) || 0) + 1))
            return (
              <section className="takvim-day" key={g.key}>
                <h2>{g.label}</h2>
                <div className="takvim-events">
                  {g.items.map(ev => (
                    <article key={ev.id} className="takvim-event">
                      <div className="takvim-event-time">
                        <Clock/> {ev.startTime}{ev.endTime && `–${ev.endTime}`}
                        {(timeCounts.get(ev.startTime) || 0) > 1 && <span className="takvim-event-conflict">aynı saatte {timeCounts.get(ev.startTime)} etkinlik</span>}
                      </div>
                      <div className="takvim-event-body">
                        <small>{typeLabel[ev.type] || 'Diğer'}</small>
                        <h3>{ev.title}</h3>
                        {ev.location && <p className="takvim-event-location"><MapPin/> {ev.location}</p>}
                        {ev.description && <p className="takvim-event-description">{ev.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : <p className="listing-empty">Şu anda planlanmış bir etkinlik yok.</p>}
    </main>
  </>
}
