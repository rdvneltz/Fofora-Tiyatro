'use client'
import { useEffect,useState } from 'react'
import { Save } from 'lucide-react'

const defaults={playsTitle:'Yaklaşan Oyunlar',calendarTitle:'Takvim',educationTitle:'Eğitimler',reelsTitle:'Bizden Kareler',newsTitle:'Bizden Haberler',teamTitle:'Ekibimiz',contactTitle:'Bize Yazın.',contactText:'Soru, fikir, iş birliği ya da eğitim bilgisi… Mesajınız doğrudan ekibimizin gelen kutusuna ulaşsın.',sloganTitle:'“Herkesin anlatacak bir hikâyesi var.”',sloganText:'Fofora Tiyatro Üsküdar’da, hayatın tam içinde.',footerTagline:'Üsküdar’da daha fazla sahne, daha fazla insan için.',whatsappText:'Merhaba, Fofora Tiyatro hakkında bilgi almak istiyorum.'}
export default function ContentStudio(){const [id,setId]=useState(''),[data,setData]=useState<any>(defaults),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false)
 useEffect(()=>{fetch('/api/settings').then(r=>r.json()).then(x=>{if(x?.id)setId(x.id);setData({...defaults,...(x?.homepageContent||{})})})},[])
 const set=(key:string,value:any)=>setData((d:any)=>({...d,[key]:value}))
 const save=async()=>{setSaving(true);setSaved(false);await fetch('/api/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({homepageContent:data})});setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2200)}
 const fields=[['playsTitle','Oyunlar başlığı'],['calendarTitle','Takvim sekmesi'],['educationTitle','Eğitimler başlığı'],['reelsTitle','Bizden Kareler başlığı'],['newsTitle','Haberler başlığı'],['teamTitle','Ekip başlığı'],['contactTitle','İletişim başlığı'],['contactText','İletişim açıklaması'],['sloganTitle','Slogan başlığı'],['sloganText','Slogan alt metni'],['footerTagline','Footer sloganı'],['whatsappText','Hazır WhatsApp mesajı']]
 return <div className="studio-page"><header className="studio-head"><div><small>İÇERİK STÜDYOSU</small><h1>Sayfa metinleri</h1><p>Ana sayfadaki sabit başlıkları, sloganları ve yönlendirme metinlerini yönet. "Şimdi Fofora'da" şeridi artık kendi sayfasından yönetiliyor.</p></div><button className="studio-primary" onClick={save} disabled={saving}><Save/>{saving?'Kaydediliyor…':saved?'Kaydedildi':'Değişiklikleri kaydet'}</button></header>
 <section className="studio-card"><h2>Bölümler ve iletişim</h2><div className="studio-grid">{fields.map(([key,label])=><label key={key}>{label}{key.endsWith('Text')||key==='whatsappText'?<textarea rows={3} value={data[key]} onChange={e=>set(key,e.target.value)}/>:<input value={data[key]} onChange={e=>set(key,e.target.value)}/>}</label>)}</div></section>
 </div>}
