import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.siteSettings.findFirst()
  console.log('Current logo:', settings?.logo)

  if (settings) {
    if (!settings.logo || settings.logo.includes('murekkep')) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { logo: '/assets/fofora-logo.png' }
      })
      console.log('✓ Logo updated to fofora-logo.png')
    } else {
      console.log('Logo already correct:', settings.logo)
    }
  }

  await prisma.$disconnect()
}

main()
