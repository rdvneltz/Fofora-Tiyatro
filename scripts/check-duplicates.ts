import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== CHECKING DUPLICATES ===\n')

  // Blog posts
  const blogs = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'asc' }
  })
  console.log(`📝 Blog Posts: ${blogs.length} total`)
  blogs.forEach((blog, i) => {
    console.log(`  ${i + 1}. ${blog.title} - Image: ${blog.image || 'NO IMAGE'} - Created: ${blog.createdAt.toISOString()}`)
  })

  // Services
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'asc' }
  })
  console.log(`\n🎓 Services: ${services.length} total`)
  services.forEach((service, i) => {
    console.log(`  ${i + 1}. ${service.title} - Image: ${service.image || 'NO IMAGE'} - Created: ${service.createdAt.toISOString()}`)
  })

  // Team members
  const team = await prisma.teamMember.findMany({
    orderBy: { createdAt: 'asc' }
  })
  console.log(`\n👥 Team Members: ${team.length} total`)
  team.forEach((member, i) => {
    console.log(`  ${i + 1}. ${member.name} - Created: ${member.createdAt.toISOString()}`)
  })

  // Check for duplicate titles
  const serviceTitles = services.map(s => s.title)
  const duplicateServices = serviceTitles.filter((title, index) => serviceTitles.indexOf(title) !== index)
  if (duplicateServices.length > 0) {
    console.log(`\n⚠️  Duplicate service titles found: ${[...new Set(duplicateServices)].join(', ')}`)
  }

  const blogSlugs = blogs.map(b => b.slug)
  const duplicateBlogs = blogSlugs.filter((slug, index) => blogSlugs.indexOf(slug) !== index)
  if (duplicateBlogs.length > 0) {
    console.log(`\n⚠️  Duplicate blog slugs found: ${[...new Set(duplicateBlogs)].join(', ')}`)
  }

  await prisma.$disconnect()
}

main()
