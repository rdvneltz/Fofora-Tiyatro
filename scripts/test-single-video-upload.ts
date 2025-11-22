import { config } from 'dotenv'
import { readFile } from 'fs/promises'
import path from 'path'
import { uploadToR2 } from '../lib/r2'

config({ path: '.env.local' })

async function main() {
  console.log('\n🧪 Testing single video upload to R2...\n')

  try {
    // Upload just 1.mp4 (smallest file)
    const videoPath = path.join(process.cwd(), 'public', 'videos', '1.mp4')
    console.log('📁 Reading file:', videoPath)

    const fileBuffer = await readFile(videoPath)
    console.log(`📦 File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    const r2Key = 'videos/1.mp4'
    console.log('⏳ Uploading to R2...')

    const publicUrl = await uploadToR2(fileBuffer, r2Key, 'video/mp4')

    console.log('✅ Upload successful!')
    console.log('🔗 Public URL:', publicUrl)
  } catch (error) {
    console.error('❌ Upload failed:', error)
    process.exit(1)
  }
}

main()
