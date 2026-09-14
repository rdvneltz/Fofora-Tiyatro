'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Mail, MapPin, MessageCircle, Pause, Play, Quote, Sparkles, Star, Volume2, VolumeX, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import SiteHeader from '../components/SiteHeader'

type Slide = { id:string; fileName:string; title?:string|null; subtitle?:string|null; description?:string|null; actionType?:string|null; actionValue?:string|null; actionLabel?:string|null; secondaryActionType?:string|null; secondaryActionValue?:string|null; secondaryActionLabel?:string|null; playDuration?:number|null; playCount?:number|null; featured?:boolean; featuredWeight?:number|null; useCustomContent?:boolean; startsAt?:string|null; endsAt?:string|null; active:boolean; order:number }
type Service = { id:string; title:string; description:string; image?:string; ageGroup?:string; duration?:string }
type Post = { id:string; title:string; slug:string; excerpt:string; image?:string; category:string; createdAt:string }
type Team = { id:string; name:string; title:string; image:string }
type Album = { id:string; active:boolean; items:{ id:string; type:string; url:string; thumbnail?:string; title?:string; description?:string; active:boolean; featured:boolean }[] }
type ReelItem = { id:string; type:string; url:string; thumbnail?:string; title?:string; description?:string }
type CalendarItem = { id:string; title:string; type:string; date:string; startTime:string }
type TestimonialItem = { id:string; name:string; title:string; content:string; rating:number }
type StripItem = { id:string; label?:string|null; text:string; order:number; active:boolean; clickAction:string; linkUrl?:string|null; sectionId?:string|null; modalMediaType?:string|null; modalMediaUrl?:string|null; modalTitle?:string|null; modalBody?:string|null; ctaLabel?:string|null }
type StripBlock = { id:string; type:string; heading?:string|null; order:number; active:boolean; durationSeconds:number; marqueeSpeed:number; items:StripItem[] }

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
const ytId=(url:string)=>{if(!url)return '';if(url.includes('youtu.be'))return url.split('youtu.be/')[1]?.split('?')[0]||'';const m=url.split('v=')[1];return m?m.split('&')[0]:url}
const defaultContent={playsTitle:'Yaklaşan Oyunlar',calendarTitle:'Takvim',educationTitle:'Eğitimler',reelsTitle:'Bizden Kareler',newsTitle:'Bizden Haberler',teamTitle:'Ekibimiz',contactTitle:'Bize Yazın.',contactText:'Soru, fikir, iş birliği ya da eğitim bilgisi… Mesajınız doğrudan ekibimizin gelen kutusuna ulaşsın.',sloganTitle:'“Herkesin anlatacak bir hikâyesi var.”',sloganText:'Fofora Tiyatro Üsküdar’da, hayatın tam içinde.',footerTagline:'Üsküdar’da daha fazla sahne, daha fazla insan için.',whatsappText:'Merhaba, Fofora Tiyatro hakkında bilgi almak istiyorum.'}
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
  const [nowBlocks,setNowBlocks]=useState<StripBlock[]>([])
  const [nowBlockIndex,setNowBlockIndex]=useState(0)
  const [nowModalItem,setNowModalItem]=useState<StripItem|null>(null)
  const [nowExpandId,setNowExpandId]=useState<string|null>(null)
  const nowStripRef=useRef<HTMLElement>(null)
  const [expandPos,setExpandPos]=useState<{top:number;left:number;width:number}|null>(null)
  const heroPhoneRef=useRef<HTMLDivElement>(null)
  const [stripReserve,setStripReserve]=useState<number|undefined>(undefined)
  const [testimonials,setTestimonials]=useState<TestimonialItem[]>([]),[testimonialsOpen,setTestimonialsOpen]=useState(false)
  const [testimonialIndex,setTestimonialIndex]=useState(0)
  const testimonialCountRef=useRef(0),testimonialTimerRef=useRef<ReturnType<typeof setTimeout>>()
  const [cardMode,setCardMode]=useState(false)
  const {status:authStatus}=useSession()
  const isAdminPreview=cardMode&&authStatus==='authenticated'
  const [testimonialsLoaded,setTestimonialsLoaded]=useState(false),[instagramLoaded,setInstagramLoaded]=useState(false)
  const ready=loaded&&testimonialsLoaded&&instagramLoaded&&authStatus!=='loading'
  const [overlayVisible,setOverlayVisible]=useState(true)
  useEffect(()=>{if(!ready)return;const t=setTimeout(()=>setOverlayVisible(false),600);return()=>clearTimeout(t)},[ready])
  useEffect(()=>{fetch('/api/testimonials').then(r=>r.ok?r.json():[]).then(data=>{if(Array.isArray(data))setTestimonials(data)}).catch(()=>undefined).finally(()=>setTestimonialsLoaded(true))},[])
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
  const [phoneMuted,setPhoneMuted]=useState(true)
  const [phoneModalOpen,setPhoneModalOpen]=useState(false)
  const [instagramPosts,setInstagramPosts]=useState<{id:string;mediaUrl:string;mediaType:string;caption?:string|null}[]>([])
  useEffect(()=>{fetch('/api/instagram-posts').then(r=>r.ok?r.json():[]).then(data=>{if(Array.isArray(data))setInstagramPosts(data.filter((p:any)=>p.active&&p.mediaUrl))}).catch(()=>undefined).finally(()=>setInstagramLoaded(true))},[])
  useEffect(()=>{
    Promise.allSettled(['/api/hero-videos','/api/services','/api/blog','/api/team','/api/gallery','/api/contact','/api/settings','/api/calendar','/api/now-strip'].map(u=>fetch(u).then(r=>r.json()))).then(r=>{
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
      if(Array.isArray(value(8))&&value(8).length)setNowBlocks(value(8))
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
  const current=slides[index]||fallbackSlides[0],media=path(current),video=/\.(mp4|webm|mov)(\?|$)/i.test(media)
  // Bizden Kareler section: gallery only (featured first) - Instagram never mixes in here.
  const reels=useMemo(()=>{const galleryItems=gallery.filter(a=>a.active).flatMap(a=>(a.items||[]).filter(it=>it.active));const featured=galleryItems.filter(it=>it.featured),rest=galleryItems.filter(it=>!it.featured);return [...featured,...rest].slice(0,8)},[gallery])
  // Hero phone mockup: Instagram only, no filler when empty - gallery never mixes in here.
  const socialItems=useMemo(()=>instagramPosts.map(p=>({id:`ig-${p.id}`,type:p.mediaType==='VIDEO'?'video':p.mediaType==='YOUTUBE'?'youtube':'image',url:p.mediaUrl,thumbnail:p.mediaType==='YOUTUBE'?`https://img.youtube.com/vi/${p.mediaUrl}/hqdefault.jpg`:p.mediaUrl,title:p.caption?p.caption.slice(0,40):'Instagram’dan',description:p.caption&&p.caption.length>40?p.caption:undefined})),[instagramPosts])
  const socialCurrent=socialItems.length?socialItems[socialIndex%socialItems.length]:null,socialPreviews=socialItems.length>1?Array.from({length:Math.min(4,socialItems.length-1)},(_,i)=>socialItems[(socialIndex+i+1)%socialItems.length]):[]
  const advanceSocial=useCallback(()=>{setSocialIndex(i=>socialItems.length?(i+1)%socialItems.length:i)},[socialItems.length])
  // Photos get a fixed dwell time; videos/YouTube advance on their own instead (see onEnded / YT player effect below)
  useEffect(()=>{
    if(paused||phoneModalOpen||socialItems.length<2||!socialCurrent||socialCurrent.type!=='image')return
    const t=setTimeout(advanceSocial,7000)
    return()=>clearTimeout(t)
  },[paused,phoneModalOpen,socialIndex,socialItems.length,socialCurrent,advanceSocial])
  // YouTube has no native onEnded on the iframe - bind the IFrame Player API to detect the end of playback.
  // Best-effort: if the API never loads/binds, a safety timeout still advances so nothing gets stuck.
  useEffect(()=>{
    if(phoneModalOpen||!socialCurrent||socialCurrent.type!=='youtube'||socialItems.length<2)return
    let destroyed=false,player:any=null
    const ensureScript=()=>new Promise<void>(resolve=>{
      const w=window as any
      if(w.YT&&w.YT.Player)return resolve()
      const prev=w.onYouTubeIframeAPIReady
      w.onYouTubeIframeAPIReady=()=>{prev&&prev();resolve()}
      if(!document.getElementById('youtube-iframe-api')){
        const tag=document.createElement('script')
        tag.id='youtube-iframe-api'
        tag.src='https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    })
    ensureScript().then(()=>{
      if(destroyed)return
      try{
        player=new (window as any).YT.Player('hero-phone-yt-frame',{
          events:{onStateChange:(e:any)=>{if(e.data===(window as any).YT.PlayerState.ENDED)advanceSocial()}}
        })
      }catch{}
    })
    const safety=setTimeout(advanceSocial,60000)
    return()=>{destroyed=true;clearTimeout(safety);try{player&&player.destroy&&player.destroy()}catch{}}
  },[phoneModalOpen,socialCurrent,socialItems.length,advanceSocial])
  useEffect(()=>{
    if(!phoneModalOpen)return
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape')setPhoneModalOpen(false)
      else if(e.key==='ArrowLeft')setSocialIndex(i=>(i-1+socialItems.length)%socialItems.length)
      else if(e.key==='ArrowRight')setSocialIndex(i=>(i+1)%socialItems.length)
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[phoneModalOpen,socialItems.length])
  useEffect(()=>{const t=setInterval(()=>setStageTab(v=>v==='plays'?'calendar':'plays'),10000);return()=>clearInterval(t)},[])
  const activeNowBlocks=useMemo(()=>nowBlocks.filter(b=>b.active&&b.items.some(i=>i.active)).map(b=>({...b,items:b.items.filter(i=>i.active)})),[nowBlocks])
  const activeNowBlock=activeNowBlocks.length?activeNowBlocks[nowBlockIndex%activeNowBlocks.length]:null
  useEffect(()=>{
    // Don't switch designs out from under someone who has an item's modal or expand panel open.
    if(activeNowBlocks.length<2||nowExpandId||nowModalItem)return
    const t=setTimeout(()=>setNowBlockIndex(i=>(i+1)%activeNowBlocks.length),(activeNowBlock?.durationSeconds||8)*1000)
    return()=>clearTimeout(t)
  },[nowBlockIndex,activeNowBlocks,activeNowBlock,nowExpandId,nowModalItem])
  useEffect(()=>{setNowExpandId(null)},[nowBlockIndex])
  // The expand panel needs to sit outside the strip's own scroll/overflow box (it clips absolutely-positioned
  // overflow on the one-screen desktop breakpoint), so it's position:fixed and measured off the strip's own rect instead.
  useEffect(()=>{
    if(!nowExpandId){setExpandPos(null);return}
    const update=()=>{const r=nowStripRef.current?.getBoundingClientRect();if(r)setExpandPos({top:r.bottom,left:r.left,width:r.width})}
    update()
    window.addEventListener('resize',update)
    window.addEventListener('scroll',update,true)
    return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)}
  },[nowExpandId])
  const handleStripClick=(item:StripItem)=>{
    if(item.clickAction==='modal')return setNowModalItem(item)
    if(item.clickAction==='expand')return setNowExpandId(id=>id===item.id?null:item.id)
    if(item.clickAction==='section')return document.getElementById(item.sectionId||'')?.scrollIntoView({behavior:'smooth'})
    if(item.clickAction==='link'&&item.linkUrl){
      if(/^https?:\/\//.test(item.linkUrl))open(item.linkUrl,'_blank')
      else location.href=base&&item.linkUrl.startsWith('/')&&!item.linkUrl.startsWith('/yeni')?`${base}${item.linkUrl}`:item.linkUrl
    }
  }
  const nowExpandItem=activeNowBlock?.items.find(i=>i.id===nowExpandId)||null
  // The hero phone sits absolutely positioned over the hero, and on wide desktop breakpoints its bottom
  // edge overlaps the strip's row - reserve space up to the phone's left edge only when they actually overlap
  // (on mobile/narrow layouts the phone sits above the strip in normal flow, so no reservation is needed there).
  useEffect(()=>{
    const update=()=>{
      const phone=heroPhoneRef.current,strip=nowStripRef.current
      if(!phone||!strip)return setStripReserve(undefined)
      const p=phone.getBoundingClientRect(),s=strip.getBoundingClientRect()
      if(p.bottom>s.top&&p.left<s.right&&p.right>s.left)setStripReserve(Math.max(0,window.innerWidth-p.left))
      else setStripReserve(undefined)
    }
    update()
    window.addEventListener('resize',update)
    return()=>window.removeEventListener('resize',update)
  },[socialCurrent,activeNowBlock])
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
  const reelModal=reelOpen&&<div className="reel-modal" role="dialog" aria-modal="true" aria-label={reelOpen.title||'Sahne akışı'} onClick={()=>setReelOpen(null)}><button className="modal-close" onClick={()=>setReelOpen(null)} aria-label="Kapat"><X/></button><div className="reel-modal-inner" onClick={e=>e.stopPropagation()}><div className="reel-modal-media">{reelOpen.type==='video'?<video src={reelOpen.url} controls autoPlay playsInline/>:reelOpen.type==='youtube'?<iframe src={`https://www.youtube.com/embed/${reelOpen.url}?autoplay=1&playsinline=1`} allow="autoplay; encrypted-media" allowFullScreen title={reelOpen.title||'YouTube video'} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/>:<Image src={reelOpen.thumbnail||reelOpen.url} alt={reelOpen.title||''} fill sizes="60vw"/>}</div>{(reelOpen.title||reelOpen.description)&&<div className="reel-modal-copy">{reelOpen.title&&<h3>{reelOpen.title}</h3>}{reelOpen.description&&<p>{reelOpen.description}</p>}</div>}</div></div>
  const phoneModal=<AnimatePresence>{phoneModalOpen&&socialCurrent&&<motion.div className="reel-modal" role="dialog" aria-modal="true" aria-label={socialCurrent.title||'İçerik'} onClick={()=>setPhoneModalOpen(false)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><button className="modal-close" onClick={()=>setPhoneModalOpen(false)} aria-label="Kapat"><X/></button><div className="phone-modal-wrap" onClick={e=>e.stopPropagation()}>{socialItems.length>1&&<button className="phone-modal-nav prev" onClick={()=>setSocialIndex(i=>(i-1+socialItems.length)%socialItems.length)} aria-label="Önceki içerik"><ChevronLeft/></button>}<motion.div className="phone-modal-frame" initial={{scale:.35,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.35,opacity:0}} transition={{type:'spring',stiffness:260,damping:24}}><div className="phone-notch"/><div className="phone-modal-media">{socialCurrent.type==='video'?<video key={socialCurrent.id} src={socialCurrent.url} controls autoPlay playsInline onEnded={advanceSocial}/>:socialCurrent.type==='youtube'?<iframe key={socialCurrent.id} src={`https://www.youtube.com/embed/${socialCurrent.url}?autoplay=1&playsinline=1`} allow="autoplay; encrypted-media" allowFullScreen title={socialCurrent.title||'YouTube video'} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/>:<Image key={socialCurrent.id} src={socialCurrent.thumbnail||socialCurrent.url} alt={socialCurrent.title||''} fill sizes="90vw"/>}</div><div className="phone-modal-copy"><small>ŞİMDİ FOFORA’DA</small><b>{socialCurrent.title||'Sahnenin perde arkası'}</b></div></motion.div>{socialItems.length>1&&<button className="phone-modal-nav next" onClick={()=>setSocialIndex(i=>(i+1)%socialItems.length)} aria-label="Sonraki içerik"><ChevronRight/></button>}</div></motion.div>}</AnimatePresence>
  const socialArr=Array.isArray(footerSettings.socialMedia)?footerSettings.socialMedia:(footerSettings.socialMedia&&typeof footerSettings.socialMedia==='object'?Object.entries(footerSettings.socialMedia as any).map(([platform,url])=>({platform,url:String(url),active:true})):[])
  const igLink=socialArr.find(s=>s.platform==='instagram'&&s.active&&s.url)?.url||'https://instagram.com/foforatiyatro'
  const legalActive=(footerSettings.legalLinks||[]).filter(l=>l.active).sort((a,b)=>a.order-b.order)
  const footerBlock=<footer><a className="brand"><span>Fofora</span><small>TIYATRO</small></a><p>{copy.footerTagline}</p><div><a href={igLink} target="_blank" rel="noopener noreferrer"><Instagram/></a><a href={`mailto:${contact.email}`}><Mail/></a></div>{legalActive.length>0&&<nav className="footer-legal">{legalActive.map(l=><button key={l.title} onClick={()=>setLegalOpen(l)}>{l.title}</button>)}</nav>}<small>{footerSettings.copyrightText||`© ${new Date().getFullYear()} Fofora Tiyatro`}</small></footer>
  const legalModal=legalOpen&&<div className="reel-modal" role="dialog" aria-modal="true" aria-label={legalOpen.title} onClick={()=>setLegalOpen(null)}><button className="modal-close" onClick={()=>setLegalOpen(null)} aria-label="Kapat"><X/></button><div className="reel-modal-inner legal-modal-inner" onClick={e=>e.stopPropagation()}><h3>{legalOpen.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{legalOpen.content}</p></div></div>
  const nowStripModal=nowModalItem&&<div className="reel-modal" role="dialog" aria-modal="true" aria-label={nowModalItem.modalTitle||nowModalItem.text} onClick={()=>setNowModalItem(null)}><button className="modal-close" onClick={()=>setNowModalItem(null)} aria-label="Kapat"><X/></button><div className="reel-modal-inner" onClick={e=>e.stopPropagation()}>{nowModalItem.modalMediaType&&nowModalItem.modalMediaUrl&&<div className="reel-modal-media">{nowModalItem.modalMediaType==='video'?<video src={nowModalItem.modalMediaUrl} controls autoPlay playsInline/>:nowModalItem.modalMediaType==='youtube'?<iframe src={`https://www.youtube.com/embed/${ytId(nowModalItem.modalMediaUrl)}?autoplay=1&playsinline=1`} allow="autoplay; encrypted-media" allowFullScreen title={nowModalItem.modalTitle||nowModalItem.text} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/>:<Image src={nowModalItem.modalMediaUrl} alt={nowModalItem.modalTitle||''} fill sizes="60vw"/>}</div>}<div className="reel-modal-copy"><h3>{nowModalItem.modalTitle||nowModalItem.text}</h3>{nowModalItem.modalBody&&<p>{nowModalItem.modalBody}</p>}{nowModalItem.linkUrl&&<a className="button acid" href={nowModalItem.linkUrl} target={/^https?:\/\//.test(nowModalItem.linkUrl)?'_blank':undefined} rel="noopener noreferrer">{nowModalItem.ctaLabel||'Devamını gör'} <ArrowRight/></a>}</div></div></div>
  const siteLoader=overlayVisible&&<div className={ready?'site-loader hide':'site-loader'} aria-hidden={ready}><div className="site-loader-inner"><div className="site-loader-brand"><span>Fofora</span><small>TİYATRO</small></div><div className="site-loader-bar"><span/></div></div></div>
  const messageModal=messageOpen&&<div className="message-modal" role="dialog" aria-modal="true" aria-label="Fofora’ya mesaj gönder"><button className="modal-close" onClick={()=>setMessageOpen(false)} aria-label="Kapat"><X/></button><div><p className="eyebrow ink">BİR MERHABA YETER</p><h2>Bize Yazın.</h2><p>Mesajınız doğrudan ekibimizin gelen kutusuna ulaşır.</p></div><form onSubmit={async e=>{await send(e);setMessageOpen(false)}}><div className="form-row"><label>Adınız Soyadınız<input name="name" required autoFocus/></label><label>Telefon<input name="phone" required/></label></div><label>E-posta<input name="email" type="email"/></label><label>Konu<select name="subject" required defaultValue=""><option value="" disabled>Bir konu seçin</option><option>Eğitimler</option><option>Oyunlar ve bilet</option><option>Okul / kurum iş birliği</option><option>Basın ve iletişim</option><option>Diğer</option></select></label><label>Mesajınız<textarea name="message" rows={6} required/></label><button className="button form-button" disabled={sending}>{sending?'Gönderiliyor…':'Mesajı gönder'} <ArrowRight/></button></form></div>

  if(cardMode&&!isAdminPreview) return <>
    {siteLoader}
    <SiteHeader variant="solid" minimal/>
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
    {siteLoader}
    {isAdminPreview&&<div className="admin-preview-banner">Kartvizit modu aktif — bu tam görünümü sadece giriş yapmış admin olarak siz görüyorsunuz. Ziyaretçiler sadece kartvizit ekranını görür.</div>}
    <SiteHeader variant="overlay"/>
    <section id="hero" className="hero-stage"><AnimatePresence mode="wait"><motion.div key={current.id} className="hero-media" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>{media?(video?<video src={media} autoPlay muted playsInline loop/>:<Image src={media} alt="" fill priority sizes="100vw"/>):<div className={`hero-placeholder h-${index%2}`}/>}</motion.div></AnimatePresence><div className="hero-scrim"/><AnimatePresence mode="wait"><motion.div key={'c'+current.id} className="hero-copy" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} onClick={()=>go(current.actionType,current.actionValue)}><p className="eyebrow">{current.subtitle}</p><h1>{current.title?.split('\n').map(x=><span key={x}>{x}</span>)}</h1><p>{current.description}</p><div className="hero-actions" onClick={e=>e.stopPropagation()}><button className="button acid" onClick={()=>go(current.actionType,current.actionValue)}>{current.actionLabel||'Keşfet'} <ArrowRight/></button>{current.secondaryActionLabel&&<button className="button outline" onClick={()=>go(current.secondaryActionType,current.secondaryActionValue)}>{current.secondaryActionLabel} <ArrowRight/></button>}</div></motion.div></AnimatePresence>
      <div className="hero-controls"><button onClick={()=>setIndex(i=>(i-1+slides.length)%slides.length)}><ChevronLeft/></button><span>{String(index+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span><button onClick={()=>setIndex(i=>(i+1)%slides.length)}><ChevronRight/></button><button onClick={()=>setPaused(!paused)}>{paused?<Play/>:<Pause/>}</button></div>
      <a className="hero-whatsapp" href={`https://wa.me/${contact.phone.replace(/\D/g,'').replace(/^0/,'90')}?text=${encodeURIComponent(copy.whatsappText)}`} target="_blank" rel="noopener noreferrer" aria-label="Fofora Tiyatro’ya WhatsApp’tan yaz"><MessageCircle/><span>WhatsApp’tan<br/>yaz</span></a>
      {socialCurrent&&<div ref={heroPhoneRef} className="hero-phone" onClick={()=>setPhoneModalOpen(true)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setPhoneModalOpen(true)}}} role="button" tabIndex={0} aria-label={`${socialCurrent.title||'İçerik'} — büyüt`}><div className="phone-notch"/>{!phoneModalOpen&&(socialCurrent.type==='video'?<video key={socialCurrent.id} src={socialCurrent.url} autoPlay muted={phoneMuted} playsInline onEnded={advanceSocial} onError={advanceSocial}/>:socialCurrent.type==='youtube'?<iframe id="hero-phone-yt-frame" key={socialCurrent.id} src={`https://www.youtube.com/embed/${socialCurrent.url}?autoplay=1&mute=${phoneMuted?1:0}&controls=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window!=='undefined'?encodeURIComponent(window.location.origin):''}`} allow="autoplay; encrypted-media" title={socialCurrent.title||'YouTube video'} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/>:<Image key={socialCurrent.id} src={socialCurrent.thumbnail||socialCurrent.url} alt="Sahne akışı" fill sizes="420px"/>)}{!phoneModalOpen&&(socialCurrent.type==='video'||socialCurrent.type==='youtube')&&<button className="phone-mute" onClick={e=>{e.stopPropagation();setPhoneMuted(m=>!m)}} aria-label={phoneMuted?'Sesi aç':'Sesi kapat'}>{phoneMuted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button>}<div className="phone-caption"><small>ŞİMDİ FOFORA’DA</small><b>{socialCurrent.title||'Sahnenin perde arkası'}</b></div></div>}
      {socialPreviews.length>0&&<div className="hero-previews">{socialPreviews.map((item,i)=><button key={item.id} onClick={()=>setSocialIndex((socialIndex+i+1)%socialItems.length)} aria-label={`${item.title||'Sıradaki içerik'} önizlemesi`}>{item.type==='video'?<video src={item.url} muted playsInline/>:<Image src={item.thumbnail||item.url} alt={item.title||''} fill sizes="140px"/>}<span>{String((socialIndex+i+2)%socialItems.length||socialItems.length).padStart(2,'0')}</span></button>)}</div>}
    </section>
    <AnimatePresence mode="wait">{activeNowBlock&&<motion.section ref={nowStripRef} key={activeNowBlock.id} className={`now-strip mode-${activeNowBlock.type}`} style={stripReserve!==undefined?{paddingRight:stripReserve}:undefined} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.4}}>{activeNowBlock.type==='marquee'?<>{activeNowBlock.heading&&<h2>{activeNowBlock.heading}</h2>}<div className="now-strip-marquee"><div className="now-strip-marquee-track" style={{'--now-marquee-duration':`${activeNowBlock.marqueeSpeed}s`} as any}>{[0,1].map(dup=>activeNowBlock.items.map(item=><span key={`${dup}-${item.id}`} className={item.clickAction!=='none'?'now-strip-marquee-item clickable':'now-strip-marquee-item'} {...(item.clickAction!=='none'?{onClick:()=>handleStripClick(item),role:'button',tabIndex:0,onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleStripClick(item)}}}:{})}>{item.label&&<b>{item.label} — </b>}{item.text}</span>))}</div></div></>:activeNowBlock.type==='spotlight'?(activeNowBlock.items[0]?<div className={activeNowBlock.items[0].clickAction!=='none'?'now-strip-spotlight clickable':'now-strip-spotlight'} {...(activeNowBlock.items[0].clickAction!=='none'?{onClick:()=>handleStripClick(activeNowBlock.items[0]),role:'button',tabIndex:0,onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleStripClick(activeNowBlock.items[0])}}}:{})}>{activeNowBlock.heading&&<small className="now-strip-spotlight-eyebrow">{activeNowBlock.heading}</small>}<div className="now-strip-spotlight-copy">{activeNowBlock.items[0].label&&<span className="now-strip-spotlight-label">{activeNowBlock.items[0].label}</span>}<strong>{activeNowBlock.items[0].text}</strong></div>{activeNowBlock.items[0].clickAction!=='none'&&<span className="now-strip-spotlight-cta">{activeNowBlock.items[0].ctaLabel||'Devamını gör'} <ArrowRight/></span>}</div>:null):<>{activeNowBlock.heading&&<h2>{activeNowBlock.heading}</h2>}{activeNowBlock.items.map(item=><div key={item.id} className={item.clickAction!=='none'?'now-strip-cell clickable':'now-strip-cell'} {...(item.clickAction!=='none'?{onClick:()=>handleStripClick(item),role:'button',tabIndex:0,onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleStripClick(item)}}}:{})}>{item.label&&<small>{item.label}</small>}<strong>{item.text}</strong></div>)}</>}<AnimatePresence>{nowExpandItem&&expandPos&&<motion.div className="now-strip-expand" style={{top:expandPos.top,left:expandPos.left,width:expandPos.width}} initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}><button className="now-strip-expand-close" onClick={()=>setNowExpandId(null)} aria-label="Kapat"><X size={16}/></button>{nowExpandItem.modalMediaType&&nowExpandItem.modalMediaUrl&&<div className="now-strip-expand-media">{nowExpandItem.modalMediaType==='video'?<video src={nowExpandItem.modalMediaUrl} controls autoPlay playsInline/>:nowExpandItem.modalMediaType==='youtube'?<iframe src={`https://www.youtube.com/embed/${ytId(nowExpandItem.modalMediaUrl)}`} allow="autoplay; encrypted-media" allowFullScreen title={nowExpandItem.modalTitle||nowExpandItem.text}/>:<Image src={nowExpandItem.modalMediaUrl} alt={nowExpandItem.modalTitle||''} fill sizes="90vw"/>}</div>}<div className="now-strip-expand-copy">{(nowExpandItem.modalTitle||nowExpandItem.text)&&<h4>{nowExpandItem.modalTitle||nowExpandItem.text}</h4>}{nowExpandItem.modalBody&&<p>{nowExpandItem.modalBody}</p>}{nowExpandItem.linkUrl&&<a className="button outline" href={nowExpandItem.linkUrl} target={/^https?:\/\//.test(nowExpandItem.linkUrl)?'_blank':undefined} rel="noopener noreferrer">{nowExpandItem.ctaLabel||'Devamını gör'} <ArrowRight/></a>}</div></motion.div>}</AnimatePresence></motion.section>}</AnimatePresence>
    <section id="oyunlar" className="section dark-section"><div className="stage-tabs"><div><button className={stageTab==='plays'?'active':''} onClick={()=>setStageTab('plays')}>{copy.playsTitle}</button><button className={stageTab==='calendar'?'active':''} onClick={()=>setStageTab('calendar')}>{copy.calendarTitle}</button></div><a href={`${base}/oyunlar`}>Tümünü gör <ArrowRight/></a></div>{stageTab==='plays'?<div className="poster-grid">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):(posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4).length?posts.filter(p=>/oyun|etkinlik/i.test(p.category)).slice(0,4):samplePosts)).map((p:any,i)=>p.skeleton?<div className={`poster p-${i} skeleton-block`} key={p.id}/>:<a className={`poster p-${i}`} key={p.id} href={`${base}/haberler/${p.slug}`} aria-label={`${p.title} detayını aç`}>{p.image&&<Image src={p.image} alt="" fill sizes="30vw"/>}<span>0{i+1}</span><div><small>{p.category}</small><h3>{p.title}</h3><p>{p.excerpt}</p></div></a>)}</div>:<div className="calendar-list">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):(calendar.length?calendar.slice(0,4):[['PZT 14','17:30','Çocuk Tiyatro Atölyesi'],['SALI 15','19:30','Yetişkin Oyunculuk'],['CMT 19','20:00','Fiyonk — Oyun'],['PAZ 20','13:00','Genç Grup Provası']])).map((x:any)=>x.skeleton?<article className="skeleton-block" key={x.id}/>:<article key={x.id||x[0]}><strong>{x.id?new Date(x.date).toLocaleDateString('tr-TR',{weekday:'short',day:'2-digit'}).toUpperCase():x[0]}</strong><b>{x.startTime||x[1]}</b><span>{x.title||x[2]}{x.location?` · ${x.location}`:''}</span></article>)}</div>}</section>
    <section id="egitimler" className="section paper-section"><Heading eyebrow="SAHNEYE ÇIK" title={copy.educationTitle} href={`${base}/egitimler`} light/><div className="education-grid">{services.slice(0,5).map((s,i)=><a className="education-card" key={s.id} href={`${base}/egitimler/${s.id}`}><div className={`education-visual e-${i}`}>{s.image&&<Image src={s.image} alt={s.title} fill sizes="20vw"/>}</div><small>{s.ageGroup}{s.duration&&` • ${s.duration}`}</small><h3>{s.title}</h3><p>{s.description}</p></a>)}</div><aside className="slogan-panel"><strong>{copy.sloganTitle}</strong><span>{copy.sloganText}</span></aside></section>
    <section id="neler-yaptik" className="impact-section"><div className="impact-intro"><p className="eyebrow">BİRLİKTE BÜYÜDÜK</p><h2>{impact.title}</h2><p>{impact.intro}</p></div><div className="impact-numbers">{impact.stats.map((s:string[],i:number)=><motion.div key={s[1]} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}}><strong>{s[0]}</strong><span>{s[1]}</span></motion.div>)}</div><div className="impact-collage"><Image src={impact.image} alt="Fofora geçmişinden" fill sizes="30vw"/><b>2019</b><strong>PERDE<br/>AÇILDI</strong><b>2026</b><p>Sahnede büyüyen<br/>bir topluluk.</p></div></section>
    {(!loaded||reels.length>0)&&<section className="section reel-section"><Heading eyebrow="PERDENİN ARKASI" title={copy.reelsTitle} href={`${base}/bizden-kareler`} light/><div className="reel-track">{(!loaded?Array.from({length:6},(_,i)=>({id:`sk-${i}`,skeleton:true})):reels).map((r:any,i)=>r.skeleton?<div className="reel-card skeleton-block" key={r.id}/>:<button className={`reel-card r-${i}`} key={r.id} onClick={()=>setReelOpen(r)} aria-label={`${r.title||'Bizden bir kare'} — büyüt`}>{r.url&&(r.type==='video'?<video src={r.url} muted playsInline/>:<Image src={r.thumbnail||r.url} alt={r.title||''} fill sizes="220px"/>)}<h3>{r.title}</h3></button>)}</div></section>}
    <section id="haberler" className="section news-section"><Heading eyebrow="GÜNCEL" title={copy.newsTitle} href={`${base}/haberler`} light/><div className="news-grid">{(!loaded?Array.from({length:3},(_,i)=>({id:`sk-${i}`,skeleton:true})):(posts.slice(0,3).length?posts.slice(0,3):sampleNews)).map((p:any,i)=>p.skeleton?<article className="skeleton-block" key={p.id}/>:<article key={p.id}><div className={`news-image n-${i}`}>{p.image&&<Image src={p.image} alt={p.title} fill sizes="33vw"/>}</div><small>{p.category} • {new Date(p.createdAt).toLocaleDateString('tr-TR')}</small><h3>{p.title}</h3><p>{p.excerpt}</p><a href={`${base}/haberler/${p.slug}`}>Devamını oku <ArrowRight/></a></article>)}</div></section>
    {(!loaded||team.length>0)&&<section id="ekip" className="section team-section"><Heading eyebrow="BİRLİKTE ÜRETİYORUZ" title={copy.teamTitle} href={`${base}/ekibimiz`}/><div className="team-grid">{(!loaded?Array.from({length:4},(_,i)=>({id:`sk-${i}`,skeleton:true})):team.slice(0,4)).map((m:any)=>m.skeleton?<article className="skeleton-block" key={m.id}/>:<article key={m.id}><div><Image src={m.image} alt={m.name} fill sizes="25vw"/></div><h3>{m.name}</h3><p>{m.title}</p></article>)}</div></section>}
    {contactBlock}
    {testimonialsModal}
    {reelModal}
    {phoneModal}
    {nowStripModal}
    {footerBlock}
    {legalModal}
    {messageModal}
  </main>
}
function Heading({eyebrow,title,href,light=false}:{eyebrow:string;title:string;href?:string;light?:boolean}){return <div className="section-heading"><div><p className={`eyebrow ${light?'ink':''}`}>{eyebrow}</p><h2>{title}</h2></div>{href&&<a href={href}>Daha fazlası <ArrowRight/></a>}</div>}
