'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Mail, MapPin, MessageCircle, Pause, Play, Quote, Sparkles, Star, X } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'

type Slide = { id:string; fileName:string; title?:string|null; subtitle?:string|null; description?:string|null; actionType?:string|null; actionValue?:string|null; actionLabel?:string|null; secondaryActionType?:string|null; secondaryActionValue?:string|null; secondaryActionLabel?:string|null; playDuration?:number|null; playCount?:number|null; featured?:boolean; featuredWeight?:number|null; useCustomContent?:boolean; startsAt?:string|null; endsAt?:string|null; active:boolean; order:number }
type Service = { id:string; title:string; description:string; image?:string; ageGroup?:string; duration?:string }
type Post = { id:string; title:string; slug:string; excerpt:string; image?:string; category:string; createdAt:string }
type Team = { id:string; name:string; title:string; image:string }
type Album = { id:string; active:boolean; items:{ id:string; type:string; url:string; thumbnail?:string; title?:string; description?:string; active:boolean; featured:boolean }[] }
type ReelItem = { id:string; type:string; url:string; thumbnail?:string; title?:string; description?:string }
type CalendarItem = { id:string; title:string; type:string; date:string; startTime:string }
type TestimonialItem = { id:string; name:string; title:string; content:string; rating:number }

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
  {id:'p4',title:'Tartuffe',slug:'tartuffe',excerpt:'Klasik metin, Fofora sahnesinde yeni bir yorumla.',category:'Yeni oyun',createdAt:'2026-06-22',image:'/demo/story-6.jpg'},
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
const defaultContent={nowTitle:'Şu Anda Fofora’da',nowItems:[['SIRADAKİ OYUN','Yeni sezon hazırlıkları başladı'],['KAYITLAR','Çocuk, genç ve yetişkin grupları'],['BİZDEN HABERLER','Sahnede büyüyen bir topluluk']],playsTitle:'Yaklaşan Oyunlar',calendarTitle:'Takvim',educationTitle:'Eğitimler',reelsTitle:'Bizden Kareler',newsTitle:'Bizden Haberler',teamTitle:'Ekibimiz',contactTitle:'Bize Yazın.',contactText:'Soru, fikir, iş birliği ya da eğitim bilgisi… Mesajınız doğrudan ekibimizin gelen kutusuna ulaşsın.',sloganTitle:'“Herkesin anlatacak bir hikâyesi var.”',sloganText:'Fofora Tiyatro Üsküdar’da, hayatın tam içinde.',footerTagline:'Üsküdar’da daha fazla sahne, daha fazla insan için.',whatsappText:'Merhaba, Fofora Tiyatro hakkında bilgi almak istiyorum.'}
const path=(s:Slide)=>!s.fileName?'':s.fileName.startsWith('/')?s.fileName:s.fileName.startsWith('http')?s.fileName.replace(/https?:\/\/pub-[a-z0-9]+\.r2\.dev/,'https://cdn.foforatiyatro.com'):`/videos/${s.fileName}`
const mapsHref=(address:string,mapUrl?:string)=>mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

export default function Home(){
  const pathname=usePathname(),base=pathname.startsWith('/yeni')?'/yeni':''
  const [slides,setSlides]=useState<Slide[]>(fallbackSlides),[services,setServices]=useState<Service[]>(fallbackServices),[posts,setPosts]=useState<Post[]>([]),[team,setTeam]=useState<Team[]>(fallbackTeam),[gallery,setGallery]=useState<Album[]>([]),[calendar,setCalendar]=useState<CalendarItem[]>([])
  const [copy,setCopy]=useState(defaultContent)
  const [contact,setContact]=useState({phone:'+90 538 496 26 24',email:'foforatiyatro@gmail.com',address:'İcadiye, Üsküdar / İstanbul',mapUrl:''})
  const [impact,setImpact]=useState({title:'Neler Yaptık?',intro:'Her sayı bir prova, her fotoğraf başka bir karşılaşma. Fofora’nın bugüne kadar biriktirdiği hikâyeler.',stats:defaultStats,image:'/demo/story-5.jpg'})
  const [index,setIndex]=useState(0),[socialIndex,setSocialIndex]=useState(0),[paused,setPaused]=useState(false),[sending,setSending]=useState(false),[sent,setSent]=useState(false)
  const [loaded,setLoaded]=useState(false)
  const [footerSettings,setFooterSettings]=useState<{copyrightText?:string|null;legalLinks?:{title:string;content:string;active:boolean;order:number}[]|null;socialMedia?:{platform:string;url:string;active:boolean}[]|null}>({})
  const [legalOpen,setLegalOpen]=useState<{title:string;content:string}|null>(null)
  const playRepeatRef=useRef(0),[repeatTick,setRepeatTick]=useState(0)
  const [stageTab,setStageTab]=useState<'plays'|'calendar'>('plays'),[messageOpen,setMessageOpen]=useState(false)
  const [testimonials,setTestimonials]=useState<TestimonialItem[]>([]),[testimonialsOpen,setTestimonialsOpen]=useState(false)
  const [testimonialIndex,setTestimonialIndex]=useState(0)
  const testimonialCountRef=useRef(0),testimonialTimerRef=useRef<ReturnType<typeof setTimeout>>()
  const [cardMode,setCardMode]=useState(false)
  useEffect(()=>{fetch('/api/testimonials').then(r=>r.ok?r.json():[]).then(data=>{if(Array.isArray(data))setTestimonials(data)}).catch(()=>undefined)},[])
  useEffect(()=>{testimonialCountRef.current=testimonials.length},[testimonials])
  // A callback ref (not a useEffect keyed on the index) because AnimatePresence's mode="wait" delays
  // mounting the next quote until the previous one's exit animation finishes — an effect fired on index
  // change would often measure a not-yet-mounted node. The callback ref fires exactly when React attaches
  // the real DOM node, whenever that actually happens, so the scroll setup can never race it.
  const testimonialQuoteRef=useCallback((quote:HTMLQuoteElement|null)=>{
    clearTimeout(testimonialTimerRef.current)
    if(!quote)return
    const clip=quote.parentElement
    const advance=()=>{if(testimonialCountRef.current>1)setTestimonialIndex(i=>(i+1)%testimonialCountRef.current)}
    quote.style.transition='none'
    quote.style.transform='translateY(0)'
    const overflow=clip?Math.max(0,quote.scrollHeight-clip.clientHeight):0
    if(overflow>4){
      requestAnimationFrame(()=>{
        const duration=Math.min(9000,Math.max(2200,overflow*38))
        quote.style.transition=`transform ${duration}ms linear`
        requestAnimationFrame(()=>quote.style.setProperty('transform',`translateY(-${overflow}px)`))
        testimonialTimerRef.current=setTimeout(advance,duration+1500)
      })
    } else {
      testimonialTimerRef.current=setTimeout(advance,5000)
    }
  },[])
  const [reelOpen,setReelOpen]=useState<ReelItem|null>(null)
  const [instagramPosts,setInstagramPosts]=useState<{id:string;mediaUrl:string;mediaType:string;caption?:string|null}[]>([])
  useEffect(()=>{fetch('/api/instagram-posts').then(r=>r.ok?r.json():[]).then(data=>{if(Array.isArray(data))setInstagramPosts(data.filter((p:any)=>p.active&&p.mediaUrl))}).catch(()=>undefined)},[])
  useEffect(()=>{
    Promise.allSettled(['/api/hero-videos','/api/services','/api/blog','/api/team','/api/gallery','/api/contact','/api/settings','/api/calendar'].map(u=>fetch(u).then(r=>r.json()))).then(r=>{
      const value=(i:number)=>r[i].status==='fulfilled'?(r[i] as PromiseFulfilledResult<any>).value:null
      const settings=value(6)
      if(Array.isArray(value(0))&&value(0).length){
        const now=Date.now()
        const live=value(0).filter((s:any)=>s.active&&(!s.startsAt||new Date(s.startsAt).getTime()<=now)&&(!s.endsAt||new Date(s.endsAt).getTime()>=now))
        if(live.length){
          const featured=live.filter((s:any)=>s.featured),normal=live.filter((s:any)=>!s.featured)
          let ordered=live
          if(featured.length){
            const minWeight=Math.max(1,Math.min(...featured.map((s:any)=>s.featuredWeight||3)))
            const result:any[]=[];let ni=0,fi=0
            for(let i=0;i<live.length*3&&result.length<Math.max(live.length*2,10);i++){
              if((i+1)%minWeight===0)result.push(featured[fi++%featured.length])
              else if(normal.length)result.push(normal[ni++%normal.length])
              else result.push(featured[fi++%featured.length])
            }
            ordered=result
          }
          if(settings?.heroVideoRandomPlay)ordered=[...ordered].sort(()=>Math.random()-.5)
          setSlides(ordered.map((slide:any,i:number)=>{
            const demo=fallbackSlides[i%fallbackSlides.length],custom=!!slide.useCustomContent
            return {...demo,...slide,title:custom&&slide.title?slide.title:demo.title,subtitle:custom&&slide.subtitle?slide.subtitle:demo.subtitle,description:custom&&slide.description?slide.description:demo.description,actionLabel:slide.actionLabel||demo.actionLabel}
          }))
        }
      }
      if(Array.isArray(value(1))&&value(1).length)setServices(value(1))
      if(Array.isArray(value(2)))setPosts(value(2))
      if(Array.isArray(value(3))&&value(3).length)setTeam(value(3))
      if(Array.isArray(value(4)))setGallery(value(4))
      if(value(5)?.phone)setContact(value(5))
      if(settings?.impactStats)setImpact({title:settings.impactTitle||'Neler Yaptık?',intro:settings.impactIntro||'',stats:settings.impactStats,image:settings.impactImage||'/demo/story-5.jpg'})
      if(settings?.homepageContent)setCopy({...defaultContent,...settings.homepageContent})
      if(settings?.cardModeEnabled)setCardMode(true)
      if(settings)setFooterSettings({copyrightText:settings.copyrightText,legalLinks:settings.legalLinks,socialMedia:settings.socialMedia})
      if(Array.isArray(value(7)))setCalendar(value(7))
      setLoaded(true)
    })
  },[])
  useEffect(()=>{playRepeatRef.current=0},[index])
  useEffect(()=>{
    if(paused||slides.length<2)return
    const cur=slides[index]
    const t=setTimeout(()=>{
      const max=cur?.playCount||1
      if(playRepeatRef.current+1<max){playRepeatRef.current+=1;setRepeatTick(v=>v+1)}
      else setIndex(i=>(i+1)%slides.length)
    },(cur?.playDuration||7)*1000)
    return()=>clearTimeout(t)
  },[index,paused,slides,repeatTick])
  const current=slides[index]||fallbackSlides[0],media=path(current),video=/\.(mp4|webm|mov)(\?|$)/i.test(media),reels=useMemo(()=>{const ig=instagramPosts.map(p=>({id:`ig-${p.id}`,type:p.mediaType==='VIDEO'?'video':'image',url:p.mediaUrl,thumbnail:p.mediaUrl,title:p.caption?p.caption.slice(0,40):'Instagram’dan',description:p.caption||undefined}));const galleryItems=gallery.filter(a=>a.active).flatMap(a=>(a.items||[]).filter(it=>it.active));const featured=galleryItems.filter(it=>it.featured),rest=galleryItems.filter(it=>!it.featured);return [...featured,...ig,...rest].slice(0,8)},[gallery,instagramPosts])
  const socialItems=reels.length?reels:Array.from({length:6},(_,i)=>({id:`r${i}`,type:'image',url:`/demo/training-${i+1}.jpg`,thumbnail:'',title:['Prova günü','Bu ekip başka','Karaktere doğru','Tiyatro iyi gelir','Perde arkası','Alkış zamanı'][i]}))
  useEffect(()=>{if(paused||socialItems.length<2)return;const t=setTimeout(()=>setSocialIndex(i=>(i+1)%socialItems.length),5000);return()=>clearTimeout(t)},[paused,socialIndex,socialItems.length])
  useEffect(()=>{const t=setInterval(()=>setStageTab(v=>v==='plays'?'calendar':'plays'),10000);return()=>clearInterval(t)},[])
  const socialCurrent=socialItems[socialIndex%socialItems.length],socialPreviews=Array.from({length:Math.min(4,socialItems.length-1)},(_,i)=>socialItems[(socialIndex+i+1)%socialItems.length])
  const go=(type?:string|null,value?:string|null)=>{if(type==='whatsapp'){const p=contact.phone.replace(/\D/g,'').replace(/^0/,'90');open(`https://wa.me/${p}?text=${encodeURIComponent(value||copy.whatsappText)}`,'_blank')}else if(type==='message')document.getElementById('iletisim')?.scrollIntoView({behavior:'smooth'});else if(type==='section')document.getElementById(value||'')?.scrollIntoView({behavior:'smooth'});else if(value)location.href=location.pathname.startsWith('/yeni')&&value.startsWith('/')&&!value.startsWith('/yeni')?`/yeni${value}`:value}
  const send=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setSending(true);const form=e.currentTarget,res=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});setSending(false);if(res.ok){form.reset();setSent(true)}}

  const contactBlock=<section id="iletisim" className={testimonials.length?'contact-section has-testimonials':'contact-section'}>
      {testimonials.length>0&&<aside className="contact-frame contact-testimonials"><h3><Quote/> Ne Diyorlar?</h3><div className="testimonial-rotator" onClick={()=>setTestimonialsOpen(true)}><AnimatePresence mode="wait"><motion.figure key={testimonials[testimonialIndex%testimonials.length].id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-14}} transition={{duration:.5}}><div className="rotator-clip"><blockquote ref={testimonialQuoteRef}>{testimonials[testimonialIndex%testimonials.length].content}</blockquote></div><figcaption>{testimonials[testimonialIndex%testimonials.length].name}{testimonials[testimonialIndex%testimonials.length].title?` · ${testimonials[testimonialIndex%testimonials.length].title}`:''}</figcaption></motion.figure></AnimatePresence></div>{testimonials.length>1&&<div className="testimonial-dots">{testimonials.map((t,i)=><button key={t.id} className={i===testimonialIndex%testimonials.length?'active':''} onClick={()=>setTestimonialIndex(i)} aria-label={`${i+1}. yorumu göster`}/>)}</div>}<button className="testimonial-more" onClick={()=>setTestimonialsOpen(true)}>Tümünü gör <ArrowRight/></button></aside>}
      <div className="contact-frame contact-write">
        <div className="contact-copy"><p className="eyebrow ink">BİR MERHABA YETER</p><h2>{copy.contactTitle}</h2><p>{copy.contactText}</p><div><a href={`https://wa.me/${contact.phone.replace(/\D/g,'')}`} target="_blank"><MessageCircle/> WhatsApp’tan yaz</a><a href={`mailto:${contact.email}`}><Mail/> {contact.email}</a><a href={mapsHref(contact.address,contact.mapUrl)} target="_blank" rel="noopener noreferrer"><MapPin/> {contact.address}</a></div></div>
        <form className="contact-teaser" onSubmit={e=>{e.preventDefault();setMessageOpen(true)}} onClick={()=>setMessageOpen(true)}><div className="form-row"><label className="teaser-name">Adınız Soyadınız<input readOnly tabIndex={-1}/></label><label className="teaser-email">E-posta<input readOnly tabIndex={-1}/></label></div><label className="teaser-subject">Konu<select tabIndex={-1} defaultValue=""><option value="">Bir konu seçin</option></select></label><label className="teaser-message">Mesajınız<textarea readOnly tabIndex={-1}/></label></form>
      </div>
    </section>
  const testimonialsModal=testimonialsOpen&&<div className="testimonials-modal" role="dialog" aria-modal="true" aria-label="Tüm yorumlar"><button className="modal-close" onClick={()=>setTestimonialsOpen(false)} aria-label="Kapat"><X/></button><div className="testimonials-modal-inner"><p className="eyebrow ink">NE DİYORLAR?</p><h2>Yorumlar</h2><div className="testimonials-grid">{testimonials.map(t=><article key={t.id}>{t.rating>0&&<div className="stars">{Array.from({length:5},(_,i)=><Star key={i} fill={i<t.rating?'currentColor':'none'}/>)}</div>}<p>“{t.content}”</p><span>{t.name}{t.title?` · ${t.title}`:''}</span></article>)}</div></div></div>
  const reelModal=reelOpen&&<div className="reel-modal" role="dialog" aria-modal="true" aria-label={reelOpen.title||'Sahne akışı'} onClick={()=>setReelOpen(null)}><button className="modal-close" onClick={()=>setReelOpen(null)} aria-label="Kapat"><X/></button><div className="reel-modal-inner" onClick={e=>e.stopPropagation()}><div className="reel-modal-media">{reelOpen.type==='video'?<video src={reelOpen.url} controls autoPlay playsInline/>:<Image src={reelOpen.thumbnail||reelOpen.url} alt={reelOpen.title||''} fill sizes="60vw"/>}</div>{(reelOpen.title||reelOpen.description)&&<div className="reel-modal-copy">{reelOpen.title&&<h3>{reelOpen.title}</h3>}{reelOpen.description&&<p>{reelOpen.description}</p>}</div>}</div></div>
  const socialArr=Array.isArray(footerSettings.socialMedia)?footerSettings.socialMedia:(footerSettings.socialMedia&&typeof footerSettings.socialMedia==='object'?Object.entries(footerSettings.socialMedia as any).map(([platform,url])=>({platform,url:String(url),active:true})):[])
  const igLink=socialArr.find(s=>s.platform==='instagram'&&s.active&&s.url)?.url||'https://instagram.com/foforatiyatro'
  const legalActive=(footerSettings.legalLinks||[]).filter(l=>l.active).sort((a,b)=>a.order-b.order)
  const footerBlock=<footer><a className="brand"><span>Fofora</span><small>TIYATRO</small></a><p>{copy.footerTagline}</p><div><a href={igLink} target="_blank" rel="noopener noreferrer"><Instagram/></a><a href={`mailto:${contact.email}`}><Mail/></a></div>{legalActive.length>0&&<nav className="footer-legal">{legalActive.map(l=><button key={l.title} onClick={()=>setLegalOpen(l)}>{l.title}</button>)}</nav>}<small>{footerSettings.copyrightText||`© ${new Date().getFullYear()} Fofora Tiyatro`}</small></footer>
  const legalModal=legalOpen&&<div className="reel-modal" role="dialog" aria-modal="true" aria-label={legalOpen.title} onClick={()=>setLegalOpen(null)}><button className="modal-close" onClick={()=>setLegalOpen(null)} aria-label="Kapat"><X/></button><div className="reel-modal-inner legal-modal-inner" onClick={e=>e.stopPropagation()}><h3>{legalOpen.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{legalOpen.content}</p></div></div>
  const messageModal=messageOpen&&<div className="message-modal" role="dialog" aria-modal="true" aria-label="Fofora’ya mesaj gönder"><button className="modal-close" onClick={()=>setMessageOpen(false)} aria-label="Kapat"><X/></button><div><p className="eyebrow ink">BİR MERHABA YETER</p><h2>Bize Yazın.</h2><p>Mesajınız doğrudan ekibimizin gelen kutusuna ulaşır.</p></div><form onSubmit={async e=>{await send(e);setMessageOpen(false)}}><div className="form-row"><label>Adınız Soyadınız<input name="name" required autoFocus/></label><label>Telefon<input name="phone" required/></label></div><label>E-posta<input name="email" type="email"/></label><label>Konu<select name="subject" required defaultValue=""><option value="" disabled>Bir konu seçin</option><option>Eğitimler</option><option>Oyunlar ve bilet</option><option>Okul / kurum iş birliği</option><option>Basın ve iletişim</option><option>Diğer</option></select></label><label>Mesajınız<textarea name="message" rows={6} required/></label><button className="button form-button" disabled={sending}>{sending?'Gönderiliyor…':'Mesajı gönder'} <ArrowRight/></button></form></div>

  if(cardMode) return <>
    <SiteHeader variant="solid"/>
    <main className="card-page">
      <div className="card-intro"><p className="eyebrow ink">FOFORA TİYATRO</p><h1>{copy.sloganTitle}</h1><p>{copy.sloganText}</p></div>
      {contactBlock}
    </main>
    {testimonialsModal}
    {footerBlock}
    {legalModal}
    {messageModal}
  </>

  return <main className="site-shell">
    <SiteHeader variant="overlay"/>
    <section id="hero" className="hero-stage"><AnimatePresence mode="wait"><motion.div key={current.id} className="hero-media" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>{media?(video?<video src={media} autoPlay muted playsInline loop/>:<Image src={media} alt="" fill priority sizes="100vw"/>):<div className={`hero-placeholder h-${index%2}`}/>}</motion.div></AnimatePresence><div className="hero-scrim"/><AnimatePresence mode="wait"><motion.div key={'c'+current.id} className="hero-copy" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} onClick={()=>go(current.actionType,current.actionValue)}><p className="eyebrow">{current.subtitle}</p><h1>{current.title?.split('\n').map(x=><span key={x}>{x}</span>)}</h1><p>{current.description}</p><div className="hero-actions" onClick={e=>e.stopPropagation()}><button className="button acid" onClick={()=>go(current.actionType,current.actionValue)}>{current.actionLabel||'Keşfet'} <ArrowRight/></button>{current.secondaryActionLabel&&<button className="button outline" onClick={()=>go(current.secondaryActionType,current.secondaryActionValue)}>{current.secondaryActionLabel} <ArrowRight/></button>}</div></motion.div></AnimatePresence>
      <div className="hero-controls"><button onClick={()=>setIndex(i=>(i-1+slides.length)%slides.length)}><ChevronLeft/></button><span>{String(index+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span><button onClick={()=>setIndex(i=>(i+1)%slides.length)}><ChevronRight/></button><button onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</button></div>
      <a className="hero-whatsapp" href={`https://wa.me/${contact.phone.replace(/\D/g,'').replace(/^0/,'90')}?text=${encodeURIComponent(copy.whatsappText)}`} target="_blank" rel="noopener noreferrer" aria-label="Fofora Tiyatro’ya WhatsApp’tan yaz"><MessageCircle/><span>WhatsApp’tan<br/>yaz</span></a>
      <div className="hero-phone"><div className="phone-notch"/>{socialCurrent.type==='video'?<video key={socialCurrent.id} src={socialCurrent.url} autoPlay muted loop playsInline/>:<Image key={socialCurrent.id} src={socialCurrent.thumbnail||socialCurrent.url} alt="Sahne akışı" fill sizes="420px"/>}<div className="phone-caption"><small>ŞİMDİ FOFORA’DA</small><b>{socialCurrent.title||'Sahnenin perde arkası'}</b></div></div>
      <div className="hero-previews">{socialPreviews.map((item,i)=><button key={item.id} onClick={()=>setSocialIndex((socialIndex+i+1)%socialItems.length)} aria-label={`${item.title||'Sıradaki içerik'} önizlemesi`}>{item.type==='video'?<video src={item.url} muted playsInline/>:<Image src={item.thumbnail||item.url} alt={item.title||''} fill sizes="140px"/>}<span>{String((socialIndex+i+2)%socialItems.length||socialItems.length).padStart(2,'0')}</span></button>)}</div>
    </section>
    <section className="now-strip"><h2>{copy.nowTitle}</h2>{copy.nowItems.map((x:string[],i:number)=><div key={i}><small>{x[0]}</small><strong>{i===2&&posts[0]?.title?posts[0].title:x[1]}</strong></div>)}</section>
    <section id="oyunlar" className="section dark-section"><div className="stage-tabs"><div><button className={stageTab==='plays'?'active':''} onClick={()=>setStageTab('plays')}>{copy.playsTitle}</button><button className={stageTab==='calendar'?'active':''} onClick={()=>setStageTab('calendar')}>{copy.calendarTitle}</button></div><a href={`${base}/oyunlar`}>Tümünü gör <ArrowRight/></a></div>{stageTab==='plays'?<div className="poster-grid">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):(posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4).length?posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4):samplePosts)).map((p:any,i)=>p.skeleton?<div className={`poster p-${i} skeleton-block`} key={p.id}/>:<a className={`poster p-${i}`} key={p.id} href={`${base}/haberler/${p.slug}`} aria-label={`${p.title} detayını aç`}>{p.image&&<Image src={p.image} alt="" fill sizes="30vw"/>}<span>0{i+1}</span><div><small>{p.category}</small><h3>{p.title}</h3><p>{p.excerpt}</p></div></a>)}</div>:<div className="calendar-list">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):(calendar.length?calendar.slice(0,4):[['PZT 14','17:30','Çocuk Tiyatro Atölyesi'],['SALI 15','19:30','Yetişkin Oyunculuk'],['CMT 19','20:00','Fiyonk — Oyun'],['PAZ 20','13:00','Genç Grup Provası']])).map((x:any)=>x.skeleton?<article className="skeleton-block" key={x.id}/>:<article key={x.id||x[0]}><strong>{x.id?new Date(x.date).toLocaleDateString('tr-TR',{weekday:'short',day:'2-digit'}).toUpperCase():x[0]}</strong><b>{x.startTime||x[1]}</b><span>{x.title||x[2]}{x.location?` · ${x.location}`:''}</span></article>)}</div>}</section>
    <section id="egitimler" className="section paper-section"><Heading eyebrow="SAHNEYE ÇIK" title={copy.educationTitle} href={`${base}/egitimler`} light/><div className="education-grid">{services.slice(0,5).map((s,i)=><a className="education-card" key={s.id} href={`${base}/egitimler/${s.id}`}><div className={`education-visual e-${i}`}>{s.image&&<Image src={s.image} alt={s.title} fill sizes="20vw"/>}</div><small>{s.ageGroup}{s.duration&&` • ${s.duration}`}</small><h3>{s.title}</h3><p>{s.description}</p></a>)}</div><aside className="slogan-panel"><strong>{copy.sloganTitle}</strong><span>{copy.sloganText}</span></aside></section>
    <section id="neler-yaptik" className="impact-section"><div className="impact-intro"><p className="eyebrow">BİRLİKTE BÜYÜDÜK</p><h2>{impact.title}</h2><p>{impact.intro}</p></div><div className="impact-numbers">{impact.stats.map((s:string[],i:number)=><motion.div key={s[1]} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}><strong>{s[0]}</strong><span>{s[1]}</span></motion.div>)}</div><div className="impact-collage"><Image src={impact.image} alt="Fofora geçmişinden" fill sizes="30vw"/><b>2019</b><strong>PERDE<br/>AÇILDI</strong><b>2026</b><p>Sahnede büyüyen<br/>bir topluluk.</p></div></section>
    {(!loaded||reels.length>0)&&<section className="section reel-section"><Heading eyebrow="PERDENİN ARKASI" title={copy.reelsTitle} href={`${base}/bizden-kareler`} light/><div className="reel-track">{(!loaded?Array.from({length:6},(_,i)=>({id:`sk-${i}`,skeleton:true})):reels).map((r:any,i)=>r.skeleton?<div className="reel-card skeleton-block" key={r.id}/>:<button className={`reel-card r-${i}`} key={r.id} onClick={()=>setReelOpen(r)} aria-label={`${r.title||'Bizden bir kare'} — büyüt`}>{r.url&&(r.type==='video'?<video src={r.url} muted playsInline/>:<Image src={r.thumbnail||r.url} alt={r.title||''} fill sizes="220px"/>)}<h3>{r.title}</h3></button>)}</div></section>}
    <section id="haberler" className="section news-section"><Heading eyebrow="GÜNCEL" title={copy.newsTitle} href={`${base}/haberler`} light/><div className="news-grid">{(!loaded?Array.from({length:3},(_,i)=>({id:`sk-${i}`,skeleton:true})):(posts.slice(0,3).length?posts.slice(0,3):sampleNews)).map((p:any,i)=>p.skeleton?<article className="skeleton-block" key={p.id}/>:<article key={p.id}><div className={`news-image n-${i}`}>{p.image&&<Image src={p.image} alt={p.title} fill sizes="33vw"/>}</div><small>{p.category} • {new Date(p.createdAt).toLocaleDateString('tr-TR')}</small><h3>{p.title}</h3><p>{p.excerpt}</p><a href={`${base}/haberler/${p.slug}`}>Devamını oku <ArrowRight/></a></article>)}</div></section>
    {(!loaded||team.length>0)&&<section id="ekip" className="section team-section"><Heading eyebrow="BİRLİKTE ÜRETİYORUZ" title={copy.teamTitle} href={`${base}/ekibimiz`}/><div className="team-grid">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):team.slice(0,4)).map((m:any)=>m.skeleton?<article className="skeleton-block" key={m.id}/>:<article key={m.id}><div><Image src={m.image} alt={m.name} fill sizes="25vw"/></div><h3>{m.name}</h3><p>{m.title}</p></article>)}</div></section>}
    {contactBlock}
    {testimonialsModal}
    {reelModal}
    {footerBlock}
    {legalModal}
    {messageModal}
  </main>
}
function Heading({eyebrow,title,href,light=false}:{eyebrow:string;title:string;href?:string;light?:boolean}){return <div className="section-heading"><div><p className={`eyebrow ${light?'ink':''}`}>{eyebrow}</p><h2>{title}</h2></div>{href&&<a href={href}>Daha fazlası <ArrowRight/></a>}</div>}
