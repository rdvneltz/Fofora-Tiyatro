import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const OLD_R2_PATTERN = /https?:\/\/pub-[a-z0-9]+\.r2\.dev/g
const NEW_CDN_URL = 'https://cdn.foforatiyatro.com'

function replaceR2Url(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  return url.replace(OLD_R2_PATTERN, NEW_CDN_URL)
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: string[] = []

    // 1. HeroVideo - fileName (required field)
    const heroVideos = await prisma.heroVideo.findMany()
    for (const video of heroVideos) {
      const newFileName = replaceR2Url(video.fileName)
      if (newFileName && newFileName !== video.fileName) {
        await prisma.heroVideo.update({ where: { id: video.id }, data: { fileName: newFileName } })
        results.push(`HeroVideo ${video.id}: ${video.fileName} → ${newFileName}`)
      }
    }

    // 2. HeroSection - backgroundImage, videoUrl, logo
    const heroSections = await prisma.heroSection.findMany()
    for (const hero of heroSections) {
      const data: any = {}
      const newBg = replaceR2Url(hero.backgroundImage)
      const newVideo = replaceR2Url(hero.videoUrl)
      const newLogo = replaceR2Url(hero.logo)
      if (newBg !== hero.backgroundImage) data.backgroundImage = newBg
      if (newVideo !== hero.videoUrl) data.videoUrl = newVideo
      if (newLogo !== hero.logo) data.logo = newLogo
      if (Object.keys(data).length > 0) {
        await prisma.heroSection.update({ where: { id: hero.id }, data })
        results.push(`HeroSection ${hero.id}: updated`)
      }
    }

    // 3. Service - image
    const services = await prisma.service.findMany()
    for (const svc of services) {
      const newImage = replaceR2Url(svc.image)
      if (newImage !== svc.image) {
        await prisma.service.update({ where: { id: svc.id }, data: { image: newImage } })
        results.push(`Service ${svc.id}: image updated`)
      }
    }

    // 4. TeamMember - image (required field)
    const team = await prisma.teamMember.findMany()
    for (const member of team) {
      const newImage = replaceR2Url(member.image)
      if (newImage && newImage !== member.image) {
        await prisma.teamMember.update({ where: { id: member.id }, data: { image: newImage } })
        results.push(`TeamMember ${member.id}: image updated`)
      }
    }

    // 5. AboutSection - image
    const aboutSections = await prisma.aboutSection.findMany()
    for (const about of aboutSections) {
      const newImage = replaceR2Url(about.image)
      if (newImage !== about.image) {
        await prisma.aboutSection.update({ where: { id: about.id }, data: { image: newImage } })
        results.push(`AboutSection ${about.id}: image updated`)
      }
    }

    // 6. Testimonial - image, videoUrl
    const testimonials = await prisma.testimonial.findMany()
    for (const t of testimonials) {
      const data: any = {}
      const newImage = replaceR2Url(t.image)
      const newVideo = replaceR2Url(t.videoUrl)
      if (newImage !== t.image) data.image = newImage
      if (newVideo !== t.videoUrl) data.videoUrl = newVideo
      if (Object.keys(data).length > 0) {
        await prisma.testimonial.update({ where: { id: t.id }, data })
        results.push(`Testimonial ${t.id}: updated`)
      }
    }

    // 7. BlogPost - image, videoUrl
    const blogs = await prisma.blogPost.findMany()
    for (const blog of blogs) {
      const data: any = {}
      const newImage = replaceR2Url(blog.image)
      const newVideo = replaceR2Url(blog.videoUrl)
      if (newImage !== blog.image) data.image = newImage
      if (newVideo !== blog.videoUrl) data.videoUrl = newVideo
      if (Object.keys(data).length > 0) {
        await prisma.blogPost.update({ where: { id: blog.id }, data })
        results.push(`BlogPost ${blog.id}: updated`)
      }
    }

    // 8. GalleryAlbum - coverImage
    const albums = await prisma.galleryAlbum.findMany()
    for (const album of albums) {
      const newCover = replaceR2Url(album.coverImage)
      if (newCover !== album.coverImage) {
        await prisma.galleryAlbum.update({ where: { id: album.id }, data: { coverImage: newCover } })
        results.push(`GalleryAlbum ${album.id}: coverImage updated`)
      }
    }

    // 9. GalleryItem - url (required), thumbnail
    const items = await prisma.galleryItem.findMany()
    for (const item of items) {
      const data: any = {}
      const newUrl = replaceR2Url(item.url)
      const newThumb = replaceR2Url(item.thumbnail)
      if (newUrl && newUrl !== item.url) data.url = newUrl
      if (newThumb !== item.thumbnail) data.thumbnail = newThumb
      if (Object.keys(data).length > 0) {
        await prisma.galleryItem.update({ where: { id: item.id }, data })
        results.push(`GalleryItem ${item.id}: updated`)
      }
    }

    // 10. SiteSettings - logo, favicon
    const settings = await prisma.siteSettings.findMany()
    for (const s of settings) {
      const data: any = {}
      const newLogo = replaceR2Url(s.logo)
      const newFavicon = replaceR2Url(s.favicon)
      if (newLogo !== s.logo) data.logo = newLogo
      if (newFavicon !== s.favicon) data.favicon = newFavicon
      if (Object.keys(data).length > 0) {
        await prisma.siteSettings.update({ where: { id: s.id }, data })
        results.push(`SiteSettings ${s.id}: updated`)
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      details: results
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
