import { config } from 'dotenv'

config({ path: '.env.local' })

console.log('\n🔍 Testing R2 Credentials...\n')

console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? `${process.env.R2_ACCESS_KEY_ID.substring(0, 10)}... (length: ${process.env.R2_ACCESS_KEY_ID.length})` : 'NOT SET')
console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? `${process.env.R2_SECRET_ACCESS_KEY.substring(0, 10)}... (length: ${process.env.R2_SECRET_ACCESS_KEY.length})` : 'NOT SET')
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || 'NOT SET')
console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT || 'NOT SET')
console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL || 'NOT SET')

console.log('\n✅ Environment variables loaded successfully')
