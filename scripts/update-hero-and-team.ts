import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function updateHeroAndTeam() {
  try {
    console.log('🔄 Updating hero section...')

    // Update hero section
    const heroSections = await prisma.heroSection.findMany()
    if (heroSections.length > 0) {
      await prisma.heroSection.update({
        where: { id: heroSections[0].id },
        data: {
          title: 'Hukukun Her Alanında Profesyonel Çözümler',
          subtitle: 'Güvenilir Danışmanlık, Etkili Savunma',
        }
      })
      console.log('✅ Hero section updated')
    }

    // Check if Faruk Celep exists
    console.log('🔄 Checking for Faruk Celep in team...')
    const farukExists = await prisma.teamMember.findFirst({
      where: { email: 'faruk.celep@murekkephukuk.com' }
    })

    if (!farukExists) {
      console.log('➕ Adding Faruk Celep to team...')

      // Increment order of all existing team members
      const existingMembers = await prisma.teamMember.findMany()
      for (const member of existingMembers) {
        await prisma.teamMember.update({
          where: { id: member.id },
          data: { order: member.order + 1 }
        })
      }

      // Add Faruk Celep as first member
      await prisma.teamMember.create({
        data: {
          name: 'Av. Faruk Celep',
          title: 'Kurucu Avukat',
          bio: 'Mürekkep Hukuk Bürosu\'nun kurucusu ve başkanı. 30 yıllık hukuk kariyerinde ticaret hukuku, ceza hukuku ve kurumsal hukuk alanlarında öncü başarılara imza atmıştır. İstanbul Barosu üyesi olup, çok sayıda ulusal ve uluslararası şirkete hukuki danışmanlık vermiştir. Karmaşık davaların çözümünde uzman strateji geliştirme ve müvekkil memnuniyeti odaklı çalışma prensibiyle tanınır.',
          image: '/assets/faruk-celep.jpg',
          email: 'faruk.celep@murekkephukuk.com',
          phone: '+90 212 555 01 00',
          order: 0
        }
      })
      console.log('✅ Faruk Celep added to team')
    } else {
      console.log('ℹ️  Faruk Celep already exists in team')
    }

    // Add example video blogs
    console.log('🔄 Adding example video blogs...')

    const videoBlog1 = await prisma.blogPost.findFirst({
      where: { slug: 'hukuki-haklariniz-ve-savunma-yontemleri' }
    })

    if (!videoBlog1) {
      await prisma.blogPost.create({
        data: {
          title: 'Hukuki Haklarınız ve Savunma Yöntemleri',
          slug: 'hukuki-haklariniz-ve-savunma-yontemleri',
          excerpt: 'Hukuki süreçlerde haklarınızı nasıl koruyacağınız ve etkili savunma stratejileri hakkında detaylı bilgi. Uzman avukatlarımızdan önemli ipuçları.',
          content: `Hukuki süreçler karmaşık ve stresli olabilir. Ancak haklarınızı bilmek ve doğru savunma stratejilerini uygulamak, başarı şansınızı önemli ölçüde artırır.

Bu videomuzda şunları öğreneceksiniz:

• Hukuki süreçlerde temel haklarınız
• Etkili savunma stratejileri
• Avukatınızla nasıl çalışmalısınız
• Delil toplama ve sunum teknikleri
• Mahkeme sürecinde dikkat edilmesi gerekenler

Deneyimli avukatlarımız, 25 yıllık tecrübelerini paylaşarak sizlere rehberlik ediyor. Hukuki haklarınızı en iyi şekilde kullanmanız için gereken tüm bilgilere bu videoda ulaşabilirsiniz.

Herhangi bir hukuki sorununuz varsa, uzman ekibimizle görüşmekten çekinmeyin.`,
          image: '/assets/blog/hukuki-haklar.jpg',
          category: 'Hukuk Rehberi',
          tags: ['hukuk', 'savunma', 'haklar', 'mahkeme', 'avukat'],
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          published: true
        }
      })
      console.log('✅ Video blog 1 added')
    } else {
      console.log('ℹ️  Video blog 1 already exists')
    }

    const videoBlog2 = await prisma.blogPost.findFirst({
      where: { slug: 'ticaret-hukuku-ve-sirket-kurulus-rehberi' }
    })

    if (!videoBlog2) {
      await prisma.blogPost.create({
        data: {
          title: 'Ticaret Hukuku ve Şirket Kuruluş Rehberi',
          slug: 'ticaret-hukuku-ve-sirket-kurulus-rehberi',
          excerpt: 'Türkiye\'de şirket kurarken dikkat etmeniz gereken hukuki süreçler, gerekli belgeler ve yasal yükümlülükler hakkında kapsamlı video rehberimiz.',
          content: `Bir şirket kurmak, karmaşık hukuki süreçler içerir. Doğru adımları atmak, gelecekte karşılaşabileceğiniz sorunları önler ve işinizi sağlam temeller üzerine kurmanızı sağlar.

Bu video rehberimizde:

• Farklı şirket türleri ve özellikleri (Limited, Anonim, Komandit)
• Şirket kuruluş aşamaları ve gerekli belgeler
• Ticaret sicil işlemleri
• Vergi mevzuatı ve yükümlülükler
• Sermaye gereksinimleri
• Ortaklık sözleşmesi hazırlama
• Ticari unvan seçimi ve marka tescili

Ticaret hukuku uzmanlarımız, şirket kuruluşu sürecinde size adım adım rehberlik ediyor. Yasal yükümlülüklerinizi eksiksiz yerine getirerek, işinizi güvenle büyütebilirsiniz.

Şirket kuruluşu ve ticaret hukuku konusunda danışmanlık almak için bizimle iletişime geçebilirsiniz.`,
          image: '/assets/blog/ticaret-hukuku.jpg',
          category: 'Ticaret Hukuku',
          tags: ['ticaret', 'şirket', 'kuruluş', 'limited', 'anonim'],
          videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          published: true
        }
      })
      console.log('✅ Video blog 2 added')
    } else {
      console.log('ℹ️  Video blog 2 already exists')
    }

    console.log('🎉 Update completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHeroAndTeam()
