import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncInstagramToDB } from '@/lib/instagram'

/**
 * Vercel Cron Job endpoint for automatic Instagram sync
 * This runs automatically every 24 hours to keep Instagram posts updated
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting Instagram sync...')

    // Fetch latest media from Instagram
    const result = await syncInstagramToDB()

    if (!result.success || !result.media) {
      console.error('[CRON] Failed to fetch Instagram media:', result.message)
      return NextResponse.json(
        { error: result.message || 'Failed to fetch Instagram media' },
        { status: 500 }
      )
    }

    // Delete all existing posts
    await prisma.instagramPost.deleteMany({})
    console.log('[CRON] Cleared existing Instagram posts')

    // Insert new posts
    const createdPosts = await Promise.all(
      result.media.map((post) =>
        prisma.instagramPost.create({
          data: post
        })
      )
    )

    console.log(`[CRON] ✅ Created ${createdPosts.length} new Instagram posts`)

    return NextResponse.json({
      success: true,
      count: createdPosts.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[CRON] Instagram sync error:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync Instagram posts',
        details: error.message
      },
      { status: 500 }
    )
  }
}
