import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// Get R2 client - lazy initialization to ensure env vars are loaded
function getR2Client() {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '4ad9a16037171b6689602b13bbbe6be8'
  const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
  const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials not found in environment variables')
  }

  return new S3Client({
    region: 'us-east-1', // Cloudflare R2 requires a valid AWS region for SDK, but it's ignored
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  })
}

function getBucketName() {
  const BUCKET_NAME = process.env.R2_BUCKET_NAME
  if (!BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME not found in environment variables')
  }
  return BUCKET_NAME
}

function getPublicURL() {
  const PUBLIC_URL = process.env.R2_PUBLIC_URL
  if (!PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL not found in environment variables')
  }
  return PUBLIC_URL
}

/**
 * Upload a file to Cloudflare R2
 * @param file - File buffer
 * @param fileName - Name of the file (e.g., "videos/1.mp4")
 * @param contentType - MIME type (e.g., "video/mp4")
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const r2Client = getR2Client()
    const bucketName = getBucketName()
    const publicURL = getPublicURL()

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    })

    await r2Client.send(command)

    // Return public URL
    const publicUrl = `${publicURL}/${fileName}`
    console.log('✅ File uploaded to R2:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('❌ R2 upload error:', error)
    throw new Error('Failed to upload file to R2')
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param fileName - Name of the file to delete (e.g., "videos/1.mp4")
 */
export async function deleteFromR2(fileName: string): Promise<void> {
  try {
    const r2Client = getR2Client()
    const bucketName = getBucketName()

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    })

    await r2Client.send(command)
    console.log('✅ File deleted from R2:', fileName)
  } catch (error) {
    console.error('❌ R2 delete error:', error)
    throw new Error('Failed to delete file from R2')
  }
}

/**
 * Extract file name from R2 public URL
 * @param url - Full R2 URL (e.g., "https://pub-xxxx.r2.dev/videos/1.mp4")
 * @returns File name (e.g., "videos/1.mp4")
 */
export function extractFileNameFromR2Url(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Remove leading slash
    return urlObj.pathname.substring(1)
  } catch {
    return null
  }
}

/**
 * Check if a URL is an R2 URL
 */
export function isR2Url(url: string): boolean {
  const publicURL = process.env.R2_PUBLIC_URL || ''
  return url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com') || (publicURL && url.includes(publicURL))
}
