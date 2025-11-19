import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function cleanupHeroes() {
  try {
    console.log('Cleaning up hero sections...')

    // Get all active heroes
    const activeHeroes = await prisma.heroSection.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    })

    console.log(`Found ${activeHeroes.length} active hero sections`)

    if (activeHeroes.length > 1) {
      // Keep the most recent one, deactivate others
      const mostRecent = activeHeroes[0]
      const toDeactivate = activeHeroes.slice(1)

      console.log(`Keeping hero: ${mostRecent.title}`)
      console.log(`Deactivating ${toDeactivate.length} old heroes...`)

      for (const hero of toDeactivate) {
        await prisma.heroSection.update({
          where: { id: hero.id },
          data: { active: false }
        })
        console.log(`  - Deactivated: ${hero.title}`)
      }
    }

    // Do the same for about sections
    const activeAbouts = await prisma.aboutSection.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' }
    })

    console.log(`\nFound ${activeAbouts.length} active about sections`)

    if (activeAbouts.length > 1) {
      const mostRecent = activeAbouts[0]
      const toDeactivate = activeAbouts.slice(1)

      console.log(`Keeping about: ${mostRecent.title}`)
      console.log(`Deactivating ${toDeactivate.length} old abouts...`)

      for (const about of toDeactivate) {
        await prisma.aboutSection.update({
          where: { id: about.id },
          data: { active: false }
        })
        console.log(`  - Deactivated: ${about.title}`)
      }
    }

    console.log('\n✅ Cleanup completed!')
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupHeroes()
