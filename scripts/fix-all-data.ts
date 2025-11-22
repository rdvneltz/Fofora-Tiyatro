import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== FIXING DATA ===\n')

  // 1. Delete duplicate blog posts (keep only the first ones)
  console.log('🗑️  Deleting duplicate blog posts...')
  const blogs = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'asc' }
  })

  const seenSlugs = new Set()
  for (const blog of blogs) {
    if (seenSlugs.has(blog.slug)) {
      await prisma.blogPost.delete({ where: { id: blog.id } })
      console.log(`  ✓ Deleted duplicate: ${blog.title}`)
    } else {
      seenSlugs.add(blog.slug)
    }
  }

  // 2. Update blog images to Unsplash
  console.log('\n📸 Updating blog images...')
  await prisma.blogPost.updateMany({
    where: { slug: 'tiyatro-egitimi-neden-onemli' },
    data: { image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop' }
  })
  console.log('  ✓ Updated: Tiyatro Eğitimi Neden Önemli')

  await prisma.blogPost.updateMany({
    where: { slug: 'sen-kimsin-cocuk-oyunu' },
    data: { image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop' }
  })
  console.log('  ✓ Updated: Sen Kimsin? - Çocuk Oyunumuz')

  // 3. Add images to services
  console.log('\n🎓 Adding images to services...')
  const serviceImages: Record<string, string> = {
    'Çocuk Drama ve Oyun Atölyesi': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop',
    'Gençlik Tiyatro Atölyesi': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop',
    'Yetişkin Oyun Oluşturma Atölyesi': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
    'Konservatuvar Hazırlık Eğitimi': 'https://images.unsplash.com/photo-1519163219899-21d2bb723b3e?w=800&auto=format&fit=crop',
    'Diksiyon Eğitimi': 'https://images.unsplash.com/photo-1478737270239-2f02b77fc678?w=800&auto=format&fit=crop'
  }

  for (const [title, image] of Object.entries(serviceImages)) {
    await prisma.service.updateMany({
      where: { title },
      data: { image }
    })
    console.log(`  ✓ Updated: ${title}`)
  }

  console.log('\n✅ All data fixed!')

  // Show final counts
  const blogCount = await prisma.blogPost.count()
  const serviceCount = await prisma.service.count()
  console.log(`\nFinal counts:`)
  console.log(`  📝 Blog posts: ${blogCount}`)
  console.log(`  🎓 Services: ${serviceCount}`)

  await prisma.$disconnect()
}

main()
