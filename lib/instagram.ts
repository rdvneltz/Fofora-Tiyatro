import axios from 'axios'

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
}

/**
 * Fetch Instagram user's recent media using Instagram Graph API
 * Requires Instagram Business account and valid access token
 */
export async function fetchInstagramMedia(): Promise<InstagramMedia[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    console.error('Instagram API credentials not found in environment variables')
    return []
  }

  try {
    // Fetch user's media
    const response = await axios.get(
      `https://graph.instagram.com/${userId}/media`,
      {
        params: {
          fields: 'id,media_type,media_url,permalink,caption,timestamp',
          access_token: accessToken,
          limit: 15 // Fetch 15 recent posts
        }
      }
    )

    return response.data.data || []
  } catch (error: any) {
    console.error('Instagram API error:', error.response?.data || error.message)
    return []
  }
}

/**
 * Separate media by type (posts, reels, stories)
 */
export function categorizeMedia(media: InstagramMedia[]) {
  const posts: InstagramMedia[] = []
  const reels: InstagramMedia[] = []

  media.forEach(item => {
    // Instagram Graph API doesn't distinguish between reels and regular videos easily
    // We'll treat all VIDEO types as potential reels
    if (item.media_type === 'VIDEO') {
      reels.push(item)
    } else {
      posts.push(item)
    }
  })

  return {
    posts: posts.slice(0, 5),
    reels: reels.slice(0, 5),
    // Note: Instagram Graph API doesn't provide stories unless you have specific permissions
    stories: [] as InstagramMedia[]
  }
}

/**
 * Sync Instagram media to database
 */
export async function syncInstagramToDB() {
  try {
    const media = await fetchInstagramMedia()

    if (media.length === 0) {
      console.log('No Instagram media fetched')
      return { success: false, message: 'No media found' }
    }

    const { posts, reels } = categorizeMedia(media)
    const allMedia = [...posts, ...reels]

    console.log(`Fetched ${posts.length} posts and ${reels.length} reels from Instagram`)

    // Return media for API to save to database
    return {
      success: true,
      media: allMedia.map((item, index) => ({
        postUrl: item.permalink,
        order: index,
        active: true
      }))
    }
  } catch (error) {
    console.error('Instagram sync error:', error)
    return { success: false, message: 'Sync failed' }
  }
}
