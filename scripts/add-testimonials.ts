import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env.local file
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const testimonials = [
    {
      name: 'Ayşe Yılmaz',
      title: 'Çocuk Drama Atölyesi Velisi',
      content: 'Kızım 6 yaşında ve 3 aydır bu atölyeye katılıyor. İnanılmaz bir gelişim gösterdi. Özgüveni arttı, kendini çok daha iyi ifade edebiliyor. Eğitmenler gerçekten çok profesyonel ve sevgi dolu.',
      rating: 5,
      active: true,
      order: 1,
    },
    {
      name: 'Mehmet Kaya',
      title: 'Gençlik Tiyatro Atölyesi Öğrencisi',
      content: 'Tiyatro sayesinde kendimi keşfettim. Burada aldığım eğitim sadece sahne sanatlarıyla kalmadı, hayatın her alanında daha özgüvenli olmamı sağladı. Konservatuvar sınavlarına hazırlanırken de çok büyük katkısı oldu.',
      rating: 5,
      active: true,
      order: 2,
    },
    {
      name: 'Zeynep Demir',
      title: 'Yetişkin Oyun Oluşturma Atölyesi',
      content: 'İş hayatının stresinden uzaklaşmak ve kendime zaman ayırmak için katıldım. Grup dinamikleri, yaratıcı süreçler ve oyun oluşturma deneyimi bana çok şey kattı. Hem eğlendim hem de çok şey öğrendim.',
      rating: 5,
      active: true,
      order: 3,
    },
    {
      name: 'Ali Öztürk',
      title: 'Diksiyon Eğitimi Öğrencisi',
      content: 'Konuşma problemlerim vardı ve diksiyon eğitimi almaya karar verdim. Kısa sürede büyük gelişme gösterdim. Artık topluluk önünde rahatça konuşabiliyorum. Eğitmenimize çok teşekkür ederim.',
      rating: 5,
      active: true,
      order: 4,
    },
    {
      name: 'Deniz Arslan',
      title: 'Konservatuvar Hazırlık Öğrencisi',
      content: 'Konservatuvar sınavlarına hazırlanırken aldığım eğitim sayesinde ilk tercihim olan bölüme yerleştim. Monolog çalışmaları, sahne deneyimi ve teknik bilgiler konusunda çok iyi bir eğitim aldım.',
      rating: 5,
      active: true,
      order: 5,
    },
    {
      name: 'Selin Yıldız',
      title: 'Çocuk Drama Atölyesi Velisi',
      content: 'Oğlum çok utangaçtı, okuldaki gösterilere katılmaktan bile çekiniyordu. Fofora Tiyatro\'da 6 ay eğitim aldıktan sonra okul gösterisinde ana rol aldı. Bu değişimi görmek bizim için muhteşemdi.',
      rating: 5,
      active: true,
      order: 6,
    },
  ]

  console.log('Testimonials ekleniyor...')

  for (const testimonial of testimonials) {
    const exists = await prisma.testimonial.findFirst({
      where: {
        name: testimonial.name,
        content: testimonial.content
      }
    })

    if (!exists) {
      await prisma.testimonial.create({
        data: testimonial,
      })
      console.log(`✓ ${testimonial.name} yorumu eklendi`)
    } else {
      console.log(`- ${testimonial.name} yorumu zaten mevcut`)
    }
  }

  console.log('\nTestimonials ekleme tamamlandı!')
  console.log('NOT: Admin panelden bu yorumları düzenleyebilir veya yeni ekleyebilirsiniz.')
  console.log('NOT: Video desteği için admin panelden videoUrl alanını kullanabilirsiniz (YouTube veya yerel video).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
