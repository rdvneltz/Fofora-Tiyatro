'use client'
import { useEffect,useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
export default function NewsDetail(){const {slug}=useParams<{slug:string}>(),[post,setPost]=useState<any>();useEffect(()=>{fetch('/api/blog').then(r=>r.json()).then(x=>setPost(x.find((p:any)=>p.slug===slug)))},[slug]);if(!post)return <main className="detail-page"><p>Haber yükleniyor…</p></main>;return <main className="detail-page"><a href="/#haberler"><ArrowLeft/> Haberlere dön</a>{post.image&&<div className="detail-hero"><Image src={post.image} alt={post.title} fill priority sizes="100vw"/></div>}<article className="news-detail"><p className="eyebrow">{post.category} • {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p><h1>{post.title}</h1><p className="lead">{post.excerpt}</p><div className="rich-copy">{post.content}</div></article></main>}
