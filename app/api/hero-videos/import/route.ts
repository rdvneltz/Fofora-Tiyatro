import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Clear existing videos
    await prisma.heroVideo.deleteMany({})

    // Import videos 1-21
    const videos = []
    for (let i = 1; i <= 21; i++) {
      videos.push({
        fileName: `${i}.mp4`,
        order: i - 1,
        active: true
      })
    }

    // Create all videos
    const created = await Promise.all(
      videos.map(video => prisma.heroVideo.create({ data: video }))
    )

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${created.length} videos`,
      videos: created
    })
  } catch (error) {
    console.error('Error importing videos:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
