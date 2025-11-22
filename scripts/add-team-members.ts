import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env.local file
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const teamMembers = [
    {
      name: 'Eğitmen Adı 1',
      title: 'Kurucu & Sanat Yönetmeni',
      bio: 'İstanbul Üniversitesi Devlet Konservatuvarı Tiyatro Bölümü mezunu. 15 yıldır tiyatro eğitimi veriyor. Çocuk ve gençlik tiyatrosu alanında uzman.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      email: 'egitmen1@foforatiyatro.com',
      phone: '+90 538 496 26 24',
      order: 1,
      active: true,
    },
    {
      name: 'Eğitmen Adı 2',
      title: 'Tiyatro Eğitmeni',
      bio: 'Ankara Üniversitesi DTCF Tiyatro Bölümü mezunu. Oyunculuk, diksiyon ve beden dili eğitimi alanlarında deneyimli.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      email: 'egitmen2@foforatiyatro.com',
      order: 2,
      active: true,
    },
    {
      name: 'Eğitmen Adı 3',
      title: 'Drama Eğitmeni',
      bio: 'Marmara Üniversitesi Güzel Sanatlar Fakültesi mezunu. Yaratıcı drama ve çocuk gelişimi alanında sertifikalı eğitmen.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      email: 'egitmen3@foforatiyatro.com',
      order: 3,
      active: true,
    },
  ]

  console.log('Ekip üyeleri ekleniyor...')

  for (const member of teamMembers) {
    const exists = await prisma.teamMember.findFirst({
      where: { name: member.name }
    })

    if (!exists) {
      await prisma.teamMember.create({
        data: member,
      })
      console.log(`✓ ${member.name} eklendi`)
    } else {
      console.log(`- ${member.name} zaten mevcut`)
    }
  }

  console.log('\nEkip üyeleri ekleme tamamlandı!')
  console.log('NOT: Admin panelden bu bilgileri gerçek eğitmen bilgileriyle güncelleyebilirsiniz.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
