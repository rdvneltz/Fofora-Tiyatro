'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteHeader from '../../../components/SiteHeader'
import usePageTitle from '../../../components/usePageTitle'

const fallbackPosts: Record<string, any> = {
  'ogrenci-gosterisi': { title: 'Öğrencilerimizden Yeni Gösteri', category: 'Sahneden', createdAt: '2026-03-12', excerpt: 'Provalardan sahneye uzanan heyecanlı yolculuk.', content: 'Öğrencilerimizin dönem boyunca ürettiği çalışmaları seyirciyle buluşturduk. Sahne, birlikte büyüdüğümüz hikâyelere açıldı.', image: '/demo/story-4.jpg' },
  'uskudar-tiyatro': { title: 'Üsküdar’da Tiyatroya Genç Bir Soluk', category: 'Bizden', createdAt: '2026-03-03', excerpt: 'Yeni dönemde yeni hikâyeler anlatıyoruz.', content: 'Üsküdar’da farklı yaşlardan katılımcıları oyun, eğitim ve sahne deneyimi etrafında buluşturmaya devam ediyoruz.', image: '/demo/story-5.jpg' },
  'yeni-donem': { title: 'Atölyelerimizde Yeni Dönem', category: 'Eğitim', createdAt: '2026-02-20', excerpt: 'Yaşına ve hedeflerine uygun programı keşfet.', content: 'Çocuk, genç ve yetişkin gruplarımızda yeni dönem programı başladı. Ayrıntılı bilgi için bize ulaşabilirsiniz.', image: '/demo/story-6.jpg' },
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()
  const pathname = usePathname()
  const base = pathname.startsWith('/yeni') ? '/yeni' : ''
  const [post, setPost] = useState<any>(fallbackPosts[slug])
  usePageTitle(post?.title)
  const [label, setLabel] = useState('Bizden Haberler')

  useEffect(() => {
    fetch('/api/blog').then((response) => response.ok ? response.json() : []).then((items) => {
      if (!Array.isArray(items)) return
      const found = items.find((item: any) => item.slug === slug)
      if (found) setPost(found)
    }).catch(() => undefined)
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.homepageContent?.newsTitle) setLabel(data.homepageContent.newsTitle)
    }).catch(() => undefined)
  }, [slug])

  if (!post) return <><SiteHeader/><main className="detail-page"><a href={`${base}/haberler`}><ArrowLeft /> {label}’e dön</a><h1>Haber bulunamadı.</h1></main></>
  return <>
    <SiteHeader/>
    <main className="detail-page">
      <a href={`${base}/haberler`}><ArrowLeft /> {label}’e dön</a>
      {post.image && <div className="detail-hero"><Image src={post.image} alt={post.title} fill priority sizes="100vw" /></div>}
      <article className="news-detail">
        <p className="eyebrow">{post.category} • {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        <div className="rich-copy">{post.content}</div>
      </article>
    </main>
  </>
}
