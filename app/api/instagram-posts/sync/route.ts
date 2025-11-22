import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncInstagramToDB } from '@/lib/instagram'

/**
 * Sync Instagram posts from Instagram Graph API to database
 * This endpoint fetches the latest posts and updates the database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Starting Instagram sync...')

    // Fetch latest media from Instagram
    const result = await syncInstagramToDB()

    if (!result.success || !result.media) {
      return NextResponse.json(
        { error: result.message || 'Failed to fetch Instagram media' },
        { status: 500 }
      )
    }

    // Delete all existing posts
    await prisma.instagramPost.deleteMany({})
    console.log('Cleared existing Instagram posts')

    // Insert new posts
    const createdPosts = await Promise.all(
      result.media.map((post) =>
        prisma.instagramPost.create({
          data: post
        })
      )
    )

    console.log(`Created ${createdPosts.length} new Instagram posts`)

    return NextResponse.json({
      success: true,
      count: createdPosts.length,
      posts: createdPosts
    })
  } catch (error: any) {
    console.error('Instagram sync error:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync Instagram posts',
        details: error.message
      },
      { status: 500 }
    )
  }
}
