import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { uploadToR2 } from '../lib/r2'

config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
  console.log('\n🚀 Starting video migration to Cloudflare R2...\n')

  // 1. Get all videos from public/videos directory
  const videosDir = path.join(process.cwd(), 'public', 'videos')
  let videoFiles: string[] = []

  try {
    videoFiles = await readdir(videosDir)
    videoFiles = videoFiles.filter(file => file.endsWith('.mp4'))
    console.log(`📁 Found ${videoFiles.length} videos in /public/videos/\n`)
  } catch (error) {
    console.error('❌ Error reading videos directory:', error)
    return
  }

  if (videoFiles.length === 0) {
    console.log('ℹ️  No videos found to migrate.')
    return
  }

  // 2. Upload each video to R2
  let successCount = 0
  let failCount = 0

  for (const fileName of videoFiles) {
    try {
      console.log(`⏳ Uploading: ${fileName}`)

      // Read the video file
      const filePath = path.join(videosDir, fileName)
      const fileBuffer = await readFile(filePath)

      // Upload to R2
      const r2Key = `videos/${fileName}`
      const publicUrl = await uploadToR2(fileBuffer, r2Key, 'video/mp4')

      console.log(`✅ Uploaded: ${fileName} → ${publicUrl}`)

      // Update database records that reference this video
      const updatedCount = await prisma.heroVideo.updateMany({
        where: {
          fileName: fileName // Old: just "1.mp4"
        },
        data: {
          fileName: publicUrl // New: full R2 URL
        }
      })

      if (updatedCount.count > 0) {
        console.log(`   📝 Updated ${updatedCount.count} database record(s)`)
      }

      successCount++
      console.log('')
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error)
      failCount++
      console.log('')
    }
  }

  console.log('━'.repeat(60))
  console.log(`\n✅ Migration complete!`)
  console.log(`   Success: ${successCount}/${videoFiles.length}`)
  console.log(`   Failed: ${failCount}/${videoFiles.length}`)

  if (successCount > 0) {
    console.log('\n📌 Next steps:')
    console.log('   1. Test video playback on your site')
    console.log('   2. If everything works, you can delete /public/videos/')
    console.log('   3. Add R2 environment variables to Vercel:')
    console.log('      - R2_ACCESS_KEY_ID')
    console.log('      - R2_SECRET_ACCESS_KEY')
    console.log('      - R2_BUCKET_NAME')
    console.log('      - R2_ENDPOINT')
    console.log('      - R2_PUBLIC_URL')
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
