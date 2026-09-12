# Fofora Tiyatro

Fofora Tiyatro'nun oyunlarını, eğitimlerini, öğrenci gösterilerini ve güncel sahne akışını yayınlayan; içerikleri yönetim panelinden kontrol edilen web uygulaması.

## Özellikler

- Zamanlanabilir görsel/video hero ilan panosu
- Hero başına WhatsApp, mesaj formu, site içi veya harici bağlantı eylemleri
- Eğitim programları ve detay sayfaları
- Oyunlar ve Bizden Haberler
- Yönetilebilir “Neler Yaptık?” göstergeleri
- Fotoğraf/video galerisi ve dikey Sahne Akışı
- MongoDB tabanlı mesaj kutusu
- İsteğe bağlı e-posta bildirimleri
- Cloudflare R2 medya depolama
- NextAuth ile korunan yönetim paneli

## Teknoloji

Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Prisma, MongoDB, NextAuth ve Cloudflare R2.

## Yerel geliştirme

```bash
npm ci
npm run dev
```

Üretim doğrulaması için `npm run build` kullanılır.

## Yönetim paneli

`/admin/login` üzerinden giriş yapılır. Panelde vitrin ve duyurular, programlar, Neler Yaptık, mesaj kutusu, haberler, galeri, ekip ve site ayarları yönetilir.

E-posta bildirimleri için `RESEND_API_KEY` ve doğrulanmış gönderici adresini belirleyen `INQUIRY_EMAIL_FROM` gerekir. Bildirim alıcıları yönetim panelinden değiştirilebilir.

© Fofora Tiyatro
