'use client'
import { useEffect,useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft,MessageCircle } from 'lucide-react'
export default function EducationDetail(){const {id}=useParams<{id:string}>(),[item,setItem]=useState<any>();useEffect(()=>{fetch('/api/services').then(r=>r.json()).then(x=>setItem(x.find((s:any)=>s.id===id)||x.find((s:any)=>s.title.toLocaleLowerCase('tr').includes(id.replaceAll('-',' ')))))},[id]);if(!item)return <main className="detail-page"><p>Program yükleniyor…</p></main>;return <main className="detail-page"><a href="/#egitimler"><ArrowLeft/> Eğitimlere dön</a><div className="detail-layout"><div className="detail-media">{item.image&&<Image src={item.image} alt={item.title} fill sizes="50vw"/>}</div><article><p className="eyebrow">{item.ageGroup} {item.duration&&`• ${item.duration}`}</p><h1>{item.title}</h1><p className="lead">{item.description}</p><div className="rich-copy">{item.details}</div><a className="button acid" href="/#iletisim">Bilgi al <MessageCircle/></a></article></div></main>}
