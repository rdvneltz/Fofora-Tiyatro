'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Mail, MapPin, Menu, MessageCircle, Pause, Play, Sparkles, X } from 'lucide-react'

type Slide = { id:string; fileName:string; title?:string|null; subtitle?:string|null; description?:string|null; actionType?:string|null; actionValue?:string|null; actionLabel?:string|null; secondaryActionType?:string|null; secondaryActionValue?:string|null; secondaryActionLabel?:string|null; playDuration?:number|null; startsAt?:string|null; endsAt?:string|null; active:boolean; order:number }
type Service = { id:string; title:string; description:string; image?:string; ageGroup?:string; duration?:string }
type Post = { id:string; title:string; slug:string; excerpt:string; image?:string; category:string; createdAt:string }
type Team = { id:string; name:string; title:string; image:string }
type Album = { id:string; items:{ id:string; type:string; url:string; thumbnail?:string; title?:string }[] }

const fallbackSlides:Slide[] = [
  {id:'welcome',fileName:'/demo/hero-stage.png',title:'Sahne Senin.\nHikâyen Burada Başlıyor.',subtitle:'FOFORA TİYATRO',description:'Oyna. Öğren. Üret. Birlikte büyü.',actionType:'section',actionValue:'egitimler',actionLabel:'Eğitimleri keşfet',secondaryActionType:'message',secondaryActionLabel:'Bize yaz',active:true,order:0},
  {id:'season',fileName:'/demo/story-4.jpg',title:'Yeni dönem\nkayıtları başladı.',subtitle:'2026 • YENİ SEZON',description:'Çocuk, genç ve yetişkin gruplarında sahne seni bekliyor.',actionType:'internal',actionValue:'/egitimler',actionLabel:'Programları incele',secondaryActionType:'whatsapp',secondaryActionLabel:'WhatsApp’tan sor',active:true,order:1},
]
const fallbackServices:Service[] = [
  {id:'cocuk',title:'Çocuk',description:'Oyunla keşfet, sahnede özgürleş.',ageGroup:'4–12 yaş',image:'/demo/training-1.jpg'},
  {id:'genc',title:'Genç',description:'Sesini, bedenini ve hikâyeni bul.',ageGroup:'13–17 yaş',image:'/demo/training-2.jpg'},
  {id:'yetiskin',title:'Yetişkin',description:'Gündelik hayatın dışına çık, sahneye adım at.',ageGroup:'18+',image:'/demo/training-3.jpg'},
  {id:'konservatuvar',title:'Konservatuvar',description:'Sınava değil, sanat yolculuğuna hazırlan.',ageGroup:'Hazırlık',image:'/demo/training-4.jpg'},
  {id:'diksiyon',title:'Diksiyon',description:'Sözünü, nefesini ve etkini güçlendir.',ageGroup:'Etkili iletişim',image:'/demo/training-5.jpg'},
]
const samplePosts:Post[] = [
  {id:'p1',title:'Fiyonk',slug:'fiyonk',excerpt:'Acının gölgesinde yeni bir oyun.',category:'Yeni oyun',createdAt:'2026-03-20',image:'/demo/story-1.jpg'},
  {id:'p2',title:'Sen Kimsin?',slug:'sen-kimsin',excerpt:'Çocuk oyunumuz seyirciyle buluşuyor.',category:'Öğrenci oyunu',createdAt:'2026-04-12',image:'/demo/story-2.jpg'},
  {id:'p3',title:'Bir Nefes Dede Korkut',slug:'dede-korkut',excerpt:'Masallar sahnede yeniden hayat buluyor.',category:'Turne',createdAt:'2026-05-08',image:'/demo/story-3.jpg'},
]
const sampleNews:Post[] = [
  {id:'n1',title:'Öğrencilerimizden Yeni Gösteri',slug:'ogrenci-gosterisi',excerpt:'Provalardan sahneye uzanan heyecanlı yolculuk.',category:'Sahneden',createdAt:'2026-03-12',image:'/demo/story-4.jpg'},
  {id:'n2',title:'Üsküdar’da Tiyatroya Genç Bir Soluk',slug:'uskudar-tiyatro',excerpt:'Yeni dönemde yeni hikâyeler anlatıyoruz.',category:'Bizden',createdAt:'2026-03-03',image:'/demo/story-5.jpg'},
  {id:'n3',title:'Atölyelerimizde Yeni Dönem',slug:'yeni-donem',excerpt:'Yaşına ve hedeflerine uygun programı keşfet.',category:'Eğitim',createdAt:'2026-02-20',image:'/demo/story-6.jpg'},
]
const fallbackTeam:Team[]=[
  {id:'t1',name:'Zeynep Arslan',title:'Kurucu / Sanat Yönetmeni',image:'/demo/training-3.jpg'},
  {id:'t2',name:'Murat Can Demir',title:'Eğitmen',image:'/demo/training-4.jpg'},
  {id:'t3',name:'Elif Kaya',title:'Eğitmen',image:'/demo/training-5.jpg'},
  {id:'t4',name:'Kerem Yıldız',title:'Eğitmen',image:'/demo/training-2.jpg'},
]
const defaultStats=[['12','Oyun'],['350+','Öğrenci'],['28','Öğrenci gösterisi'],['6','Yıllık yolculuk']]
const path=(s:Slide)=>!s.fileName?'':s.fileName.startsWith('/')?s.fileName:s.fileName.startsWith('http')?s.fileName.replace(/https?:\/\/pub-[a-z0-9]+\.r2\.dev/,'https://cdn.foforatiyatro.com'):`/videos/${s.fileName}`

export default function Home(){
  const [slides,setSlides]=useState<Slide[]>(fallbackSlides),[services,setServices]=useState<Service[]>(fallbackServices),[posts,setPosts]=useState<Post[]>([]),[team,setTeam]=useState<Team[]>(fallbackTeam),[gallery,setGallery]=useState<Album[]>([])
  const [contact,setContact]=useState({phone:'+90 538 496 26 24',email:'foforatiyatro@gmail.com',address:'İcadiye, Üsküdar / İstanbul'})
  const [impact,setImpact]=useState({title:'Neler Yaptık?',intro:'Her sayı bir prova, her fotoğraf başka bir karşılaşma. Fofora’nın bugüne kadar biriktirdiği hikâyeler.',stats:defaultStats,image:'/demo/story-5.jpg'})
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[menu,setMenu]=useState(false),[sending,setSending]=useState(false),[sent,setSent]=useState(false)
  useEffect(()=>{
    Promise.allSettled(['/api/hero-videos','/api/services','/api/blog','/api/team','/api/gallery','/api/contact','/api/settings'].map(u=>fetch(u).then(r=>r.json()))).then(r=>{
      const value=(i:number)=>r[i].status==='fulfilled'?(r[i] as PromiseFulfilledResult<any>).value:null
      if(Array.isArray(value(0))&&value(0).length){
        const now=Date.now()
        const live=value(0).filter((s:Slide)=>s.active&&(!s.startsAt||new Date(s.startsAt).getTime()<=now)&&(!s.endsAt||new Date(s.endsAt).getTime()>=now))
        if(live.length)setSlides(live.map((slide:Slide,i:number)=>{
          const demo=fallbackSlides[i%fallbackSlides.length]
          return {...demo,...slide,title:slide.title||demo.title,subtitle:slide.subtitle||demo.subtitle,description:slide.description||demo.description,actionLabel:slide.actionLabel||demo.actionLabel}
        }))
      }
      if(Array.isArray(value(1))&&value(1).length)setServices(value(1))
      if(Array.isArray(value(2)))setPosts(value(2))
      if(Array.isArray(value(3))&&value(3).length)setTeam(value(3))
      if(Array.isArray(value(4)))setGallery(value(4))
      if(value(5)?.phone)setContact(value(5))
      if(value(6)?.impactStats)setImpact({title:value(6).impactTitle||'Neler Yaptık?',intro:value(6).impactIntro||'',stats:value(6).impactStats,image:value(6).impactImage||'/demo/story-5.jpg'})
    })
  },[])
  useEffect(()=>{if(paused||slides.length<2)return;const t=setTimeout(()=>setIndex(i=>(i+1)%slides.length),(slides[index]?.playDuration||7)*1000);return()=>clearTimeout(t)},[index,paused,slides])
  const current=slides[index]||fallbackSlides[0],media=path(current),video=/\.(mp4|webm|mov)(\?|$)/i.test(media),reels=useMemo(()=>gallery.flatMap(a=>a.items||[]).slice(0,8),[gallery])
  const go=(type?:string|null,value?:string|null)=>{if(type==='whatsapp'){const p=contact.phone.replace(/\D/g,'').replace(/^0/,'90');open(`https://wa.me/${p}?text=${encodeURIComponent(value||'Merhaba, Fofora Tiyatro hakkında bilgi almak istiyorum.')}`,'_blank')}else if(type==='message')document.getElementById('iletisim')?.scrollIntoView({behavior:'smooth'});else if(type==='section')document.getElementById(value||'')?.scrollIntoView({behavior:'smooth'});else if(value)location.href=value}
  const send=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setSending(true);const form=e.currentTarget,res=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});setSending(false);if(res.ok){form.reset();setSent(true)}}

  return <main className="site-shell">
    <header className="topbar"><a href="#hero" className="brand"><span>Fofora</span><small>TIYATRO</small></a><nav className={menu?'nav-links open':'nav-links'}>{[['Oyunlar','oyunlar'],['Eğitimler','egitimler'],['Neler Yaptık?','neler-yaptik'],['Bizden Haberler','haberler'],['Ekibimiz','ekip'],['İletişim','iletisim']].map(x=><a key={x[0]} href={`#${x[1]}`} onClick={()=>setMenu(false)}>{x[0]}</a>)}<a href="https://instagram.com/foforatiyatro" target="_blank"><Instagram size={18}/></a></nav><button className="menu-button" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    <section id="hero" className="hero-stage"><AnimatePresence mode="wait"><motion.div key={current.id} className="hero-media" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>{media?(video?<video src={media} autoPlay muted playsInline loop/>:<Image src={media} alt="" fill priority sizes="100vw"/>):<div className={`hero-placeholder h-${index%2}`}/>}</motion.div></AnimatePresence><div className="hero-scrim"/><AnimatePresence mode="wait"><motion.div key={'c'+current.id} className="hero-copy" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} onClick={()=>go(current.actionType,current.actionValue)}><p className="eyebrow">{current.subtitle}</p><h1>{current.title?.split('\n').map(x=><span key={x}>{x}</span>)}</h1><p>{current.description}</p><div className="hero-actions" onClick={e=>e.stopPropagation()}><button className="button acid" onClick={()=>go(current.actionType,current.actionValue)}>{current.actionLabel||'Keşfet'} <ArrowRight/></button>{current.secondaryActionLabel&&<button className="button outline" onClick={()=>go(current.secondaryActionType,current.secondaryActionValue)}>{current.secondaryActionLabel} <ArrowRight/></button>}</div></motion.div></AnimatePresence>
      <div className="hero-controls"><button onClick={()=>setIndex(i=>(i-1+slides.length)%slides.length)}><ChevronLeft/></button><span>{String(index+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span><button onClick={()=>setIndex(i=>(i+1)%slides.length)}><ChevronRight/></button><button onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</button></div>
      <div className="hero-phone"><div className="phone-notch"/>{reels[0]?.url?(reels[0].type==='video'?<video src={reels[0].url} autoPlay muted loop playsInline/>:<Image src={reels[0].url} alt="Sahne akışı" fill sizes="280px"/>):<Image src="/demo/training-6.jpg" alt="Sahne akışı" fill sizes="280px"/>}<div className="phone-caption"><small>ŞİMDİ FOFORA’DA</small><b>Sahnenin perde arkası</b></div></div>
    </section>
    <section className="now-strip"><h2>Şu Anda Fofora’da</h2><div><small>SIRADAKİ OYUN</small><strong>Yeni sezon hazırlıkları başladı</strong></div><div><small>KAYITLAR</small><strong>Çocuk, genç ve yetişkin grupları</strong></div><div><small>BİZDEN HABERLER</small><strong>{posts[0]?.title||'Sahnede büyüyen bir topluluk'}</strong></div></section>
    <section id="oyunlar" className="section dark-section"><Heading eyebrow="PERDE AÇILIYOR" title="Yaklaşan Oyunlar"/><div className="poster-grid">{(posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4).length?posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4):samplePosts).map((p,i)=><article className={`poster p-${i}`} key={p.id}>{p.image&&<Image src={p.image} alt="" fill sizes="30vw"/>}<span>0{i+1}</span><div><small>{p.category}</small><h3>{p.title}</h3><p>{p.excerpt}</p><button><ArrowRight/></button></div></article>)}</div></section>
    <section id="egitimler" className="section paper-section"><Heading eyebrow="SAHNEYE ÇIK" title="Eğitimler" light/><div className="education-grid">{services.slice(0,5).map((s,i)=><article className="education-card" key={s.id}><div className={`education-visual e-${i}`}>{s.image&&<Image src={s.image} alt={s.title} fill sizes="20vw"/>}</div><small>{s.ageGroup}{s.duration&&` • ${s.duration}`}</small><h3>{s.title}</h3><p>{s.description}</p><a href={`/egitimler/${s.id}`}><ArrowRight/></a></article>)}</div></section>
    <section id="neler-yaptik" className="impact-section"><div className="impact-intro"><p className="eyebrow">BİRLİKTE BÜYÜDÜK</p><h2>{impact.title}</h2><p>{impact.intro}</p></div><div className="impact-numbers">{impact.stats.map((s:string[],i:number)=><motion.div key={s[1]} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}><strong>{s[0]}</strong><span>{s[1]}</span></motion.div>)}</div><div className="impact-collage"><Image src={impact.image} alt="Fofora geçmişinden" fill sizes="30vw"/><b>2019</b><strong>PERDE<br/>AÇILDI</strong><b>2026</b><p>Sahnede büyüyen<br/>bir topluluk.</p></div></section>
    <section className="section reel-section"><Heading eyebrow="PERDENİN ARKASI" title="Sahne Akışı" light/><div className="reel-track">{(reels.length?reels:Array.from({length:6},(_,i)=>({id:`r${i}`,type:'image',url:`/demo/training-${i+1}.jpg`,thumbnail:'',title:['Prova günü','Bu ekip başka','Karaktere doğru','Tiyatro iyi gelir','Perde arkası','Alkış zamanı'][i]}))).map((r,i)=><article className={`reel-card r-${i}`} key={r.id}>{r.url&&(r.type==='video'?<video src={r.url} muted playsInline/>:<Image src={r.thumbnail||r.url} alt={r.title||''} fill sizes="220px"/>)}<span><Play fill="currentColor"/></span><h3>{r.title}</h3></article>)}</div></section>
    <section id="haberler" className="section news-section"><Heading eyebrow="GÜNCEL" title="Bizden Haberler" light/><div className="news-grid">{(posts.slice(0,3).length?posts.slice(0,3):sampleNews).map((p,i)=><article key={p.id}><div className={`news-image n-${i}`}>{p.image&&<Image src={p.image} alt={p.title} fill sizes="33vw"/>}</div><small>{p.category} • {new Date(p.createdAt).toLocaleDateString('tr-TR')}</small><h3>{p.title}</h3><p>{p.excerpt}</p><a href={`/haberler/${p.slug}`}>Devamını oku <ArrowRight/></a></article>)}</div></section>
    {team.length>0&&<section id="ekip" className="section team-section"><Heading eyebrow="BİRLİKTE ÜRETİYORUZ" title="Ekibimiz"/><div className="team-grid">{team.slice(0,4).map(m=><article key={m.id}><div><Image src={m.image} alt={m.name} fill sizes="25vw"/></div><h3>{m.name}</h3><p>{m.title}</p></article>)}</div></section>}
    <section id="iletisim" className="contact-section"><div className="contact-copy"><p className="eyebrow ink">BİR MERHABA YETER</p><h2>Bize<br/>Yazın.</h2><p>Soru, fikir, iş birliği ya da eğitim bilgisi… Mesajınız doğrudan ekibimizin gelen kutusuna ulaşsın.</p><div><a href={`https://wa.me/${contact.phone.replace(/\D/g,'')}`} target="_blank"><MessageCircle/> WhatsApp’tan yaz</a><a href={`mailto:${contact.email}`}><Mail/> {contact.email}</a><span><MapPin/> {contact.address}</span></div></div><form onSubmit={send}><div className="form-row"><label>Adınız Soyadınız<input name="name" required/></label><label>Telefon<input name="phone" required/></label></div><label>E-posta<input name="email" type="email"/></label><label>Konu<select name="subject" required defaultValue=""><option value="" disabled>Bir konu seçin</option><option>Eğitimler</option><option>Oyunlar ve bilet</option><option>Okul / kurum iş birliği</option><option>Basın ve iletişim</option><option>Diğer</option></select></label><label>Mesajınız<textarea name="message" rows={5}/></label><button className="button form-button" disabled={sending}>{sending?'Gönderiliyor…':'Mesajı gönder'} <ArrowRight/></button>{sent&&<p className="success">Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.</p>}</form></section>
    <footer><a className="brand"><span>Fofora</span><small>TIYATRO</small></a><p>Üsküdar’da daha fazla sahne, daha fazla insan için.</p><div><a href="https://instagram.com/foforatiyatro"><Instagram/></a><a href={`mailto:${contact.email}`}><Mail/></a></div><small>© {new Date().getFullYear()} Fofora Tiyatro</small></footer>
  </main>
}
function Heading({eyebrow,title,light=false}:{eyebrow:string;title:string;light?:boolean}){return <div className="section-heading"><div><p className={`eyebrow ${light?'ink':''}`}>{eyebrow}</p><h2>{title}</h2></div><a href="#iletisim">Daha fazlası <ArrowRight/></a></div>}
