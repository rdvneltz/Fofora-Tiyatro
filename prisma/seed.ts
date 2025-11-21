import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@foforatiyatro.com' },
    update: {},
    create: {
      email: 'admin@foforatiyatro.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  // Hero section
  await prisma.heroSection.create({
    data: {
      title: 'FOFORA TİYATRO',
      subtitle: 'Sahnenin Büyüsüyle Kendini Yeniden Keşfet',
      description: 'Boşluk sanatın sahnesidir - Her yaştan bireylere tiyatro eğitimi ile yaratıcılığını keşfet',
      buttonText: 'Hemen Kayıt Ol',
      buttonLink: '#contact',
      logo: '/assets/fofora-logo.png',
      logoWidth: 250,
      logoHeight: 250,
      active: true,
    },
  })

  // Eğitim Programları
  const programs = [
    {
      title: 'Çocuk Drama ve Oyun Atölyesi',
      description: '4-6, 7-9 ve 10-12 yaş grupları için özel drama eğitimi',
      icon: 'Users',
      details: 'Çocukların hayal gücünü geliştiren, özgüven kazandıran ve takım çalışması becerilerini güçlendiren drama atölyesi. Her yaş grubuna özel içerik ve metodlarla çocukların sanatsal gelişimini destekliyoruz.',
      ageGroup: '4-12 yaş',
      duration: '3 ay',
      order: 1,
      active: true,
    },
    {
      title: 'Gençlik Tiyatro Atölyesi',
      description: '13-17 yaş arası gençler için sahne sanatları eğitimi',
      icon: 'Award',
      details: 'Gençlerin kendini ifade etmesini sağlayan, sanat terapisi unsurları içeren tiyatro atölyesi. Sahne sanatları, doğaçlama, diksiyon ve karakter çalışmaları ile kapsamlı bir eğitim.',
      ageGroup: '13-17 yaş',
      duration: '6 ay',
      order: 2,
      active: true,
    },
    {
      title: 'Yetişkin Oyun Oluşturma Atölyesi',
      description: '18+ yetişkinler için performans ve kişisel gelişim',
      icon: 'Star',
      details: 'Yetişkinlerin kendini yeniden keşfetmesini sağlayan, sanat terapisi ve performans becerileri geliştiren atölye. Oyun oluşturma sürecinde aktif rol alarak yaratıcılığınızı ortaya çıkarın.',
      ageGroup: '18+ Yetişkin',
      duration: '6 ay',
      order: 3,
      active: true,
    },
    {
      title: 'Konservatuvar Hazırlık Eğitimi',
      description: 'Konservatuvar sınavlarına özel hazırlık programı',
      icon: 'BookOpen',
      details: 'Konservatuvar tiyatro bölümlerine hazırlanan öğrenciler için kapsamlı eğitim programı. Monolog çalışması, sahne performansı, diksiyon ve sınav teknikleri.',
      order: 4,
      active: true,
    },
    {
      title: 'Diksiyon Eğitimi',
      description: 'Doğru ve etkili konuşma sanatı',
      icon: 'FileText',
      details: 'Ses teknikleri, nefes çalışması, telaffuz ve doğru konuşma eğitimi. Günlük hayatta ve sahne performanslarında etkili iletişim becerileri kazanın.',
      order: 5,
      active: true,
    },
  ]

  for (const program of programs) {
    await prisma.service.create({
      data: program,
    })
  }

  // Hakkımızda
  await prisma.aboutSection.create({
    data: {
      title: 'Fofora Tiyatro Hakkında',
      content: 'Fofora Tiyatro olarak, 4 yaşından yetişkinlere kadar her yaş grubuna özel tiyatro eğitimi sunuyoruz. Sanatın dönüştürücü gücüne inanarak, her bireyin içindeki yaratıcılığı ve özgüveni ortaya çıkarmayı hedefliyoruz. İcadiye, Üsküdar\'daki modern atölye mekanımızda profesyonel eğitmenlerimiz eşliğinde tiyatro yolculuğunuza başlayın.',
      mission: 'Her yaştan bireye tiyatro sanatı aracılığıyla kendini ifade etme, yaratıcılığını keşfetme ve özgüven kazanma fırsatı sunmak.',
      vision: 'Türkiye\'nin önde gelen tiyatro eğitim kurumlarından biri olmak ve tiyatro sanatını toplumun her kesimine ulaştırmak.',
      values: [
        'Yaratıcılık ve İfade Özgürlüğü',
        'Sanatsal Mükemmellik',
        'Kişisel Gelişim ve Özgüven',
        'Takım Çalışması ve İşbirliği',
        'Sürekli Öğrenme',
        'Sanatla Dönüşüm'
      ],
      active: true,
    },
  })

  // İletişim bilgileri
  await prisma.contactInfo.create({
    data: {
      address: 'İcadiye mh. Haşacıraf sk. şirin apt. no:26 kapı:2, Üsküdar/İstanbul',
      phone: '+90 538 496 26 24',
      email: 'foforatiyatro@gmail.com',
      workingHours: 'Pazartesi - Cumartesi: 10:00 - 20:00',
    },
  })

  // Site ayarları
  await prisma.siteSettings.create({
    data: {
      siteName: 'Fofora Tiyatro',
      siteTitle: 'Fofora Tiyatro | Sahnenin Büyüsüyle Kendini Yeniden Keşfet',
      description: 'Fofora Tiyatro - İstanbul Üsküdar merkezli tiyatro eğitimi, drama atölyeleri ve oyunculuk kursları. 4 yaşından yetişkinlere kadar tiyatro eğitimi.',
      logo: '/assets/fofora-logo.png',
      primaryColor: '#c19a6b',
      secondaryColor: '#243b53',
      footerText: '© 2024 Fofora Tiyatro. Tüm hakları saklıdır.',
      socialMedia: {
        instagram: 'https://instagram.com/foforatiyatro',
        whatsapp: 'https://wa.me/905384962624',
      },
      sectionVisibility: {
        hero: true,
        services: true,
        about: true,
        team: true,
        testimonials: true,
        blog: true,
        contact: true,
      },
      copyrightText: '© 2024 Fofora Tiyatro. Sahnenin büyüsüyle hayatınızı dönüştürün.',
      appointmentFormSettings: {
        consultationTypes: [
          'Çocuk Drama Atölyesi (4-6 yaş)',
          'Çocuk Drama Atölyesi (7-9 yaş)',
          'Çocuk Drama Atölyesi (10-12 yaş)',
          'Gençlik Tiyatro Atölyesi (13-17 yaş)',
          'Yetişkin Oyun Oluşturma',
          'Konservatuvar Hazırlık',
          'Diksiyon Eğitimi',
          'Genel Bilgi'
        ],
        showLawyerSelection: true,
        descriptionLabel: 'Mesajınız veya özel talepleriniz'
      }
    },
  })

  // Örnek blog yazısı
  await prisma.blogPost.create({
    data: {
      title: 'Tiyatro Eğitimi Neden Önemli?',
      slug: 'tiyatro-egitimi-neden-onemli',
      excerpt: 'Tiyatro eğitiminin çocukların ve yetişkinlerin gelişimine katkıları hakkında bilmeniz gerekenler.',
      content: `Tiyatro eğitimi, sadece sahne performansı yapmayı öğrenmek değildir. Aynı zamanda kişisel gelişim, özgüven kazanma ve yaratıcılığı keşfetme yolculuğudur.

Tiyatro eğitiminin faydaları:

1. Özgüven Gelişimi: Sahne deneyimi, bireylerin kendilerini ifade etme becerisini güçlendirir.

2. Yaratıcılık: İmprovizasyon ve oyun oluşturma süreçleri yaratıcı düşünmeyi destekler.

3. İletişim Becerileri: Diksiyon, beden dili ve etkili iletişim teknikleri öğrenilir.

4. Takım Çalışması: Tiyatro doğası gereği işbirliği gerektirir ve sosyal becerileri geliştirir.

5. Empati: Farklı karakterleri canlandırmak, başkalarının duygularını anlamayı kolaylaştırır.

Fofora Tiyatro olarak, her yaş grubuna özel programlarımızla bu becerileri kazandırıyoruz.`,
      image: '/assets/blog/tiyatro-egitimi.jpg',
      category: 'Eğitim',
      tags: ['Tiyatro', 'Eğitim', 'Çocuk Gelişimi', 'Sanat'],
      published: true,
    },
  })

  // Örnek oyunlar/etkinlikler blog yazısı
  await prisma.blogPost.create({
    data: {
      title: 'Sen Kimsin? - Çocuk Oyunumuz Sahnede',
      slug: 'sen-kimsin-cocuk-oyunu',
      excerpt: 'Çocuk Drama Atölyesi öğrencilerimizin hazırladığı "Sen Kimsin?" oyunumuz seyirciyle buluştu.',
      content: `Çocuk Drama Atölyesi öğrencilerimiz, aylardır üzerinde çalıştıkları "Sen Kimsin?" oyununu başarıyla sergilediler.

Oyun, kimlik arayışı ve kendini keşfetme temalarını çocukların dünyasından yansıtıyor. Her bir öğrencimiz, bu süreçte büyük bir gelişim gösterdi.

Prova sürecinde öğrencilerimiz:
- Karakter analizi yaptılar
- Beden dili ve mimiklerini geliştirdiler
- Diksiyon çalışmaları gerçekleştirdiler
- Takım çalışması deneyimi yaşadılar

Velilerimiz ve seyircilerimizin yoğun ilgisiyle karşılanan oyun, tüm ekibimiz için unutulmaz bir deneyim oldu.`,
      category: 'Etkinlikler',
      tags: ['Oyun', 'Çocuk Tiyatrosu', 'Performans'],
      published: true,
    },
  })

  console.log('Seed tamamlandı! Fofora Tiyatro veritabanı hazır.')
  console.log('Admin bilgileri:')
  console.log('Email: admin@foforatiyatro.com')
  console.log('Şifre: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
