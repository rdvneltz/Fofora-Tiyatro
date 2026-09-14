import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'

const FETCH_UA = 'Mozilla/5.0 (compatible; FoforaTiyatroBot/1.0; +https://foforatiyatro.com)'
const MAX_BYTES = 50 * 1024 * 1024 // 50MB cap

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function isSafeUrl(input: string): boolean {
  try {
    const u = new URL(input)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    const host = u.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) return false
    if (/^10\.|^172\.(1[6-9]|2\d|3[0-1])\.|^192\.168\.|^169\.254\./.test(host)) return false
    return true
  } catch {
    return false
  }
}

function isInstagramUrl(url: string): boolean {
  try {
    return /(^|\.)instagram\.com$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

// Instagram blocks plain server-to-server requests (see the og:image fallback below),
// so a real post's media is resolved through a subscribed RapidAPI Instagram downloader instead.
async function fetchInstagramViaRapidApi(postUrl: string): Promise<{ url: string; isVideo: boolean } | null> {
  const apiKey = process.env.RAPIDAPI_KEY
  const apiHost = process.env.RAPIDAPI_INSTAGRAM_HOST
  if (!apiKey || !apiHost) return null

  const res = await fetch(`https://${apiHost}/convert?url=${encodeURIComponent(postUrl)}`, {
    headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost },
  })
  if (!res.ok) return null
  const data = await res.json()
  const first = Array.isArray(data?.media) ? data.media[0] : null
  const resolvedUrl = first?.url || first?.thumbnail
  if (!resolvedUrl) return null

  return downloadAndUpload(resolvedUrl)
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function extractMetaContent(html: string, property: string): string | null {
  const tags = html.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of tags) {
    const propMatch = tag.match(/(?:property|name)=["']([^"']+)["']/i)
    if (propMatch && propMatch[1].toLowerCase() === property) {
      const contentMatch = tag.match(/content=["']([^"']*)["']/i)
      if (contentMatch) return decodeEntities(contentMatch[1])
    }
  }
  return null
}

async function downloadAndUpload(mediaUrl: string): Promise<{ url: string; isVideo: boolean }> {
  const res = await fetch(mediaUrl, { headers: { 'User-Agent': FETCH_UA } })
  if (!res.ok) throw new Error(`Medya indirilemedi (${res.status})`)
  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim()
  const contentLength = Number(res.headers.get('content-length') || 0)
  if (contentLength && contentLength > MAX_BYTES) throw new Error('Dosya çok büyük (50MB üzeri)')
  const isVideo = contentType.startsWith('video/')
  if (!contentType.startsWith('image/') && !isVideo) throw new Error('Bağlantı bir görsel/video dosyası değil')
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) throw new Error('Dosya çok büyük (50MB üzeri)')
  const ext = contentType.split('/')[1] || (isVideo ? 'mp4' : 'jpg')
  const fileName = `instagram/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const url = await uploadToR2(buffer, fileName, contentType)
  return { url, isVideo }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = await request.json()
    if (!url || typeof url !== 'string' || !isSafeUrl(url)) {
      return NextResponse.json({ error: 'Geçerli bir bağlantı girin' }, { status: 400 })
    }

    // YouTube: never download the video (against YouTube's terms) - embed it instead via the official oEmbed API
    const youtubeId = extractYouTubeId(url)
    if (youtubeId) {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (!oembedRes.ok) {
        return NextResponse.json({ error: 'YouTube videosu bulunamadı, linki kontrol edin' }, { status: 400 })
      }
      const oembed = await oembedRes.json()
      return NextResponse.json({ mediaUrl: youtubeId, mediaType: 'YOUTUBE', caption: oembed.title || null })
    }

    // Instagram: try the RapidAPI downloader first (og:image scraping below reliably gets blocked by Instagram)
    if (isInstagramUrl(url)) {
      try {
        const viaApi = await fetchInstagramViaRapidApi(url)
        if (viaApi) {
          return NextResponse.json({ mediaUrl: viaApi.url, mediaType: viaApi.isVideo ? 'VIDEO' : 'IMAGE' })
        }
      } catch (e: any) {
        console.error('RapidAPI Instagram fetch error:', e)
      }
      return NextResponse.json(
        { error: 'Instagram\'dan medya çekilemedi. Fotoğrafı/videoyu indirip "Dosya Seç" ile manuel yükleyin.' },
        { status: 422 }
      )
    }

    const pageRes = await fetch(url, { headers: { 'User-Agent': FETCH_UA } })
    if (!pageRes.ok) {
      return NextResponse.json({ error: `Bağlantıya ulaşılamadı (${pageRes.status})` }, { status: 400 })
    }
    const contentType = (pageRes.headers.get('content-type') || '').split(';')[0].trim()

    // Direct image/video link
    if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
      const contentLength = Number(pageRes.headers.get('content-length') || 0)
      if (contentLength && contentLength > MAX_BYTES) {
        return NextResponse.json({ error: 'Dosya çok büyük (50MB üzeri)' }, { status: 400 })
      }
      const buffer = Buffer.from(await pageRes.arrayBuffer())
      if (buffer.byteLength > MAX_BYTES) {
        return NextResponse.json({ error: 'Dosya çok büyük (50MB üzeri)' }, { status: 400 })
      }
      const isVideo = contentType.startsWith('video/')
      const ext = contentType.split('/')[1] || (isVideo ? 'mp4' : 'jpg')
      const fileName = `instagram/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const uploaded = await uploadToR2(buffer, fileName, contentType)
      return NextResponse.json({ mediaUrl: uploaded, mediaType: isVideo ? 'VIDEO' : 'IMAGE' })
    }

    // A regular web page: read its Open Graph tags (the same tags every link-preview/unfurl tool reads)
    if (contentType.includes('text/html')) {
      const html = await pageRes.text()
      const ogTarget = extractMetaContent(html, 'og:video:secure_url') || extractMetaContent(html, 'og:video') || extractMetaContent(html, 'og:image')
      const ogTitle = extractMetaContent(html, 'og:title')
      if (!ogTarget) {
        return NextResponse.json(
          { error: 'Bu sayfadan otomatik medya bulunamadı. Instagram gibi bazı siteler bunu engelliyor — dosyayı indirip "Dosya Seç" ile manuel yükleyin.' },
          { status: 422 }
        )
      }
      try {
        const resolved = new URL(ogTarget, url).toString()
        const { url: uploaded, isVideo } = await downloadAndUpload(resolved)
        return NextResponse.json({ mediaUrl: uploaded, mediaType: isVideo ? 'VIDEO' : 'IMAGE', caption: ogTitle || null })
      } catch (e: any) {
        return NextResponse.json(
          { error: 'Bu sayfadan medya indirilemedi. Instagram gibi bazı siteler bunu engelliyor — dosyayı indirip "Dosya Seç" ile manuel yükleyin.' },
          { status: 422 }
        )
      }
    }

    return NextResponse.json({ error: 'Bu bağlantı türü desteklenmiyor' }, { status: 400 })
  } catch (error: any) {
    console.error('fetch-media error:', error)
    return NextResponse.json({ error: error.message || 'Medya çekilemedi' }, { status: 500 })
  }
}
