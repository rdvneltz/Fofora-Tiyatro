import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Get R2 client
function getR2Client() {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '4ad9a16037171b6689602b13bbbe6be8'
  const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
  const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials not found')
  }

  return new S3Client({
    region: 'us-east-1',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, folder } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      )
    }

    const r2Client = getR2Client()
    const bucketName = process.env.R2_BUCKET_NAME
    const publicURL = process.env.R2_PUBLIC_URL

    if (!bucketName || !publicURL) {
      throw new Error('R2 bucket configuration missing')
    }

    // Determine folder based on content type or explicit folder parameter
    let folderName = folder || 'uploads'
    if (!folder) {
      if (contentType.startsWith('video/')) {
        folderName = 'videos'
      } else if (contentType.startsWith('image/')) {
        folderName = 'images'
      }
    }

    // Generate unique key
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/\s/g, '-')
    const key = `${folderName}/${timestamp}-${sanitizedFileName}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    })

    const publicUrl = `${publicURL}/${key}`

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
