type InquiryMail = { name:string; phone:string; email?:string|null; subject:string; message?:string|null }

export async function sendInquiryEmail(inquiry:InquiryMail, recipients:string[]) {
  const apiKey=process.env.RESEND_API_KEY
  const from=process.env.INQUIRY_EMAIL_FROM
  if(!apiKey||!from||!recipients.length) return false
  const safe=(value?:string|null)=>String(value||'').replace(/[<>&"']/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#039;' }[c]||c))
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:recipients,subject:`Fofora: Yeni mesaj — ${inquiry.subject}`,html:`<h2>Yeni web sitesi mesajı</h2><p><b>Ad:</b> ${safe(inquiry.name)}</p><p><b>Telefon:</b> ${safe(inquiry.phone)}</p><p><b>E-posta:</b> ${safe(inquiry.email)}</p><p><b>Konu:</b> ${safe(inquiry.subject)}</p><p><b>Mesaj:</b><br>${safe(inquiry.message).replace(/\n/g,'<br>')}</p>`})})
  return response.ok
}
