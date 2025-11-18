import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@murekkephukuk.com' },
    update: {},
    create: {
      email: 'admin@murekkephukuk.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  // Hero section
  await prisma.heroSection.create({
    data: {
      title: 'MÜREKKEP HUKUK',
      subtitle: 'Adaletin Kalemi',
      description: 'Hukuki haklarınız için güvenilir, profesyonel ve etkili çözümler sunuyoruz',
      buttonText: 'Ücretsiz Danışmanlık',
      buttonLink: '#contact',
      active: true,
    },
  })

  // İletişim bilgileri
  await prisma.contactInfo.create({
    data: {
      address: 'İstanbul, Türkiye',
      phone: '+90 212 XXX XX XX',
      email: 'info@murekkephukuk.com',
      workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
    },
  })

  // Site ayarları
  await prisma.siteSettings.create({
    data: {
      siteName: 'Mürekkep Hukuk',
      siteTitle: 'Mürekkep Hukuk Bürosu | Profesyonel Hukuki Danışmanlık',
      description: 'İstanbul merkezli profesyonel hukuki danışmanlık ve avukatlık hizmetleri',
      logo: '/assets/murekkep-logo-saydam.png',
      footerText: '© 2024 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır.',
    },
  })

  console.log('Seed tamamlandı!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
