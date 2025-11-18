# Mürekkep Hukuk Bürosu Web Sitesi

Modern, dinamik ve tamamen yönetilebilir bir hukuk bürosu web sitesi.

## 🚀 Özellikler

- **Sinematik Hero Section** - Etkileyici giriş sayfası animasyonları
- **Dinamik İçerik Yönetimi** - Tüm içerikler admin panelden kontrol edilebilir
- **Responsive Tasarım** - Tüm cihazlarda mükemmel görüntü
- **Modern Animasyonlar** - Framer Motion ile akıcı geçişler
- **Admin Paneli** - Güvenli ve kullanıcı dostu yönetim paneli
- **MongoDB Veritabanı** - Ölçeklenebilir veri yönetimi

## 📦 Teknolojiler

- Next.js 15
- TypeScript
- Tailwind CSS
- Framer Motion
- Prisma + MongoDB
- NextAuth.js
- React

## 🛠️ Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env.local` dosyasını düzenleyin:
- MongoDB connection string ekleyin
- NextAuth secret key ayarlayın

3. Prisma'yı ayarlayın:
```bash
npx prisma generate
```

4. İlk admin kullanıcısı oluşturun:
```bash
npx prisma db seed
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Site `http://localhost:3000` adresinde çalışacaktır.

## 📱 Admin Panel

Admin panele `http://localhost:3000/admin/login` adresinden erişebilirsiniz.

**Varsayılan Giriş Bilgileri:**
- Email: admin@murekkephukuk.com
- Şifre: admin123

⚠️ **Önemli:** Canlı ortama geçmeden önce admin şifresini değiştirin!

## 🎨 Özelleştirme

### Renkler
`tailwind.config.ts` dosyasından renkleri özelleştirebilirsiniz.

### Fontlar
Gotham fontları `public/assets/gotham font/` dizininde bulunmaktadır.

### Logo ve Görseller
- Logo: `public/assets/murekkep-logo-saydam.png`
- Avukat Fotoğrafı: `public/assets/av. faruk celep foto.jpeg`

## 📋 Admin Panel Modülleri

- **Hero Bölümü** - Ana sayfa hero içeriği
- **Hizmetler** - Hukuki hizmetler yönetimi
- **Ekip** - Ekip üyeleri
- **Hakkımızda** - Büro bilgileri
- **İletişim** - İletişim bilgileri
- **Yorumlar** - Müvekkil yorumları
- **Blog** - Blog yazıları
- **Site Ayarları** - Genel site ayarları

## 🔒 Güvenlik

- NextAuth.js ile güvenli kimlik doğrulama
- Middleware ile korumalı admin rotaları
- Bcrypt ile şifrelenmiş kullanıcı parolaları

## 📝 Lisans

© 2024 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır.
