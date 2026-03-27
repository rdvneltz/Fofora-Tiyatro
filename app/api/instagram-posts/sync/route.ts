import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncInstagramToDB } from '@/lib/instagram'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Sync Instagram posts from Instagram Graph API to database
 * This endpoint fetches the latest posts and updates the database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    // Insert new posts
    const createdPosts = await Promise.all(
      result.media.map((post) =>
        prisma.instagramPost.create({
          data: post
        })
      )
    )

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
