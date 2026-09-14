type InquiryMail = { name:string; phone:string; email?:string|null; subject:string; message?:string|null }
type SendResult = { success:true } | { success:false; error:string }

export async function sendInquiryEmail(inquiry:InquiryMail, recipients:string[]):Promise<SendResult> {
  const apiKey=process.env.RESEND_API_KEY
  const from=process.env.INQUIRY_EMAIL_FROM
  if(!apiKey) return { success:false, error:'RESEND_API_KEY ortam değişkeni tanımlı değil (Vercel proje ayarlarında eklenmeli).' }
  if(!from) return { success:false, error:'INQUIRY_EMAIL_FROM ortam değişkeni tanımlı değil (Vercel proje ayarlarında eklenmeli).' }
  if(!recipients.length) return { success:false, error:'Site Ayarları\'nda alıcı e-posta adresi girilmemiş.' }
  const safe=(value?:string|null)=>String(value||'').replace(/[<>&"']/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#039;' }[c]||c))
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:recipients,subject:`Fofora: Yeni mesaj — ${inquiry.subject}`,html:`<h2>Yeni web sitesi mesajı</h2><p><b>Ad:</b> ${safe(inquiry.name)}</p><p><b>Telefon:</b> ${safe(inquiry.phone)}</p><p><b>E-posta:</b> ${safe(inquiry.email)}</p><p><b>Konu:</b> ${safe(inquiry.subject)}</p><p><b>Mesaj:</b><br>${safe(inquiry.message).replace(/\n/g,'<br>')}</p>`})})
    if(response.ok) return { success:true }
    const body=await response.text().catch(()=>'')
    return { success:false, error:`Resend API hata döndürdü (HTTP ${response.status}): ${body.slice(0,400)||'detay yok'}` }
  }catch(err:any){
    return { success:false, error:`Resend isteği başarısız: ${err?.message||String(err)}` }
  }
}
