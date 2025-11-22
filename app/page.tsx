'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Scale, Users, FileText, Phone, Mail, MapPin, Award, Shield, Clock, ChevronRight, Star, BookOpen, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import VideoCarousel from '@/components/VideoCarousel'
import AppointmentModal from '@/components/AppointmentModal'
import Footer from '@/components/Footer'

interface HeroData {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
  showButton?: boolean
}

interface Service {
  id: string
  title: string
  description: string
  icon: string
  details: string
  image?: string
  ageGroup?: string
  duration?: string
}

interface TeamMember {
  id: string
  name: string
  title: string
  bio: string
  image: string
  email?: string
  phone?: string
}

interface ContactInfo {
  id: string
  address: string
  phone: string
  email: string
  workingHours: string
  mapUrl?: string
}

interface AboutSection {
  id: string
  title: string
  content: string
  mission?: string
  vision?: string
  values: string[]
  image?: string
  active: boolean
}

interface Testimonial {
  id: string
  name: string
  company?: string
  content: string
  rating: number
  photo?: string
  active: boolean
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  category: string
  tags: string[]
  videoUrl?: string
  published: boolean
  createdAt: string
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const blur = useTransform(scrollYProgress, [0, 0.5], [0, 10])

  const [hero, setHero] = useState<HeroData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [about, setAbout] = useState<AboutSection | null>(null)
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null)
  const [heroVideos, setHeroVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sectionVisibility, setSectionVisibility] = useState({
    hero: true,
    services: true,
    about: true,
    team: true,
    testimonials: true,
    blog: true,
    contact: true
  })

  // Prevent body scroll when blog modal is open
  useEffect(() => {
    if (selectedBlogPost) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedBlogPost])

  // Prevent body scroll when appointment modal is open
  useEffect(() => {
    if (isAppointmentModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isAppointmentModalOpen])

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Tüm verileri paralel olarak çek
        const [heroRes, servicesRes, teamRes, contactRes, aboutRes, videosRes, settingsRes, testimonialsRes, blogRes] = await Promise.all([
          axios.get('/api/hero', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/services', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/team', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/contact', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/about', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/hero-videos', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/settings', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/testimonials', { headers: { 'Cache-Control': 'no-cache' } }),
          axios.get('/api/blog', { headers: { 'Cache-Control': 'no-cache' } })
        ])

        // Hero verilerini set et
        if (heroRes.data) setHero(heroRes.data)

        // Hizmetleri set et
        if (servicesRes.data && servicesRes.data.length > 0) {
          setServices(servicesRes.data)
        }

        // Ekip üyelerini set et
        if (teamRes.data && teamRes.data.length > 0) {
          setTeam(teamRes.data)
        }

        // İletişim bilgilerini set et
        if (contactRes.data) setContact(contactRes.data)

        // Hakkımızda bilgilerini set et
        if (aboutRes.data) setAbout(aboutRes.data)

        // Hero videoları set et
        console.log('Video data from API:', videosRes.data)
        if (videosRes.data && videosRes.data.length > 0) {
          const activeVideos = videosRes.data
            .filter((v: any) => v.active)
            .sort((a: any, b: any) => a.order - b.order)
            .map((v: any) => v.fileName)
          console.log('Active videos:', activeVideos)
          setHeroVideos(activeVideos)
        } else {
          console.log('No videos found or empty array')
        }

        // Testimonials set et
        if (testimonialsRes.data && testimonialsRes.data.length > 0) {
          const activeTestimonials = testimonialsRes.data.filter((t: any) => t.active)
          setTestimonials(activeTestimonials)
        }

        // Blog posts set et
        if (blogRes.data && blogRes.data.length > 0) {
          const publishedPosts = blogRes.data.filter((p: any) => p.published)
          setBlogPosts(publishedPosts)
        }

        // Section visibility ayarlarını set et
        if (settingsRes.data && settingsRes.data.sectionVisibility) {
          setSectionVisibility(settingsRes.data.sectionVisibility)
        }
      } catch (error) {
        console.error('Data fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const getIcon = (iconName: string) => {
    const icons: any = {
      Scale: <Scale className="w-8 h-8" />,
      FileText: <FileText className="w-8 h-8" />,
      Shield: <Shield className="w-8 h-8" />,
      Users: <Users className="w-8 h-8" />,
      Award: <Award className="w-8 h-8" />,
      BookOpen: <BookOpen className="w-8 h-8" />,
    }
    return icons[iconName] || <Scale className="w-8 h-8" />
  }

  if (loading || !hero) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-white/60">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-navy-900 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      {sectionVisibility.hero && (
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Full Screen Video Carousel Background */}
        <VideoCarousel videos={heroVideos} videoPath="/videos/optimized" fadeDuration={1500} />

        <motion.div
          style={{ opacity, scale }}
          className="relative z-20 text-center px-4 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-12"
          >
            <Image
              src={hero.logo || "/assets/fofora-logo.png"}
              alt="Fofora Tiyatro"
              width={hero.logoWidth || 200}
              height={hero.logoHeight || 200}
              className="mx-auto drop-shadow-2xl"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold mb-6 gradient-text"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-2xl md:text-3xl text-white/90 mb-4"
          >
            {hero.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-gold-300 mb-12 max-w-3xl mx-auto"
          >
            {hero.description}
          </motion.p>

          {hero.showButton !== false && (
            <motion.button
              onClick={() => setIsAppointmentModalOpen(true)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl inline-flex items-center gap-2 hover:from-gold-700 hover:to-gold-600 transition-all cursor-pointer"
            >
              {hero.buttonText}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold-400"
          >
            <ChevronRight className="w-8 h-8 rotate-90" />
          </motion.div>
        </div>
      </section>
      )}

      {/* Services Section */}
      {sectionVisibility.services && services.length > 0 && (
      <section id="services" className="py-24 px-4 bg-gradient-to-b from-navy-900 to-navy-800 relative overflow-hidden">
        {/* Background decoration */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: -20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-16"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2 className="text-5xl font-bold text-white mb-4">Eğitim Programlarımız</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Her yaş grubuna özel profesyonel tiyatro ve drama eğitimleri
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{
                  opacity: 0,
                  y: 100,
                  rotateY: -30,
                  scale: 0.8,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -20,
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 70px rgba(193, 154, 107, 0.4)",
                  borderColor: "rgba(193, 154, 107, 0.6)",
                }}
                className="glass rounded-2xl overflow-hidden transition-all group cursor-pointer border-2 border-transparent perspective-1000"
                style={{ transformStyle: "preserve-3d" }}
              >
                {service.image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent opacity-60"></div>
                  </div>
                )}

                <div className="p-8">
                  <motion.div
                    className="text-gold-500 mb-6"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    {getIcon(service.icon)}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold-400 transition-colors">
                    {service.title}
                  </h3>

                  {(service.ageGroup || service.duration) && (
                    <div className="flex gap-3 mb-4">
                      {service.ageGroup && (
                        <span className="text-xs px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full">
                          {service.ageGroup}
                        </span>
                      )}
                      {service.duration && (
                        <span className="text-xs px-3 py-1 bg-white/10 text-white/60 rounded-full">
                          {service.duration}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-white/70 leading-relaxed mb-4 group-hover:text-white/90 transition-colors">
                    {service.description}
                  </p>

                  {service.details && (
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                      {service.details}
                    </p>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center text-white/70">
                Henüz eğitim programı eklenmemiş. Admin panelden program ekleyebilirsiniz.
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* About Section */}
      {sectionVisibility.about && about && (
        <section id="about" className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
          {/* Animated background */}
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: -45 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center mb-16"
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            >
              <h2 className="text-5xl font-bold text-white mb-4">{about.title}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-8"></div>
              {about.content && (
                <p className="text-white/80 text-xl leading-relaxed max-w-4xl mx-auto">
                  {about.content}
                </p>
              )}
            </motion.div>

            {(about.mission || about.vision) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {about.mission && (
                  <motion.div
                    initial={{ opacity: 0, x: -80, scale: 0.8 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="glass rounded-2xl p-8"
                  >
                    <h3 className="text-3xl font-bold text-gold-400 mb-6 flex items-center gap-3">
                      <Award className="w-8 h-8" />
                      Misyonumuz
                    </h3>
                    <p className="text-white/80 text-lg leading-relaxed">{about.mission}</p>
                  </motion.div>
                )}

                {about.vision && (
                  <motion.div
                    initial={{ opacity: 0, x: 80, scale: 0.8 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    className="glass rounded-2xl p-8"
                  >
                    <h3 className="text-3xl font-bold text-gold-400 mb-6 flex items-center gap-3">
                      <Shield className="w-8 h-8" />
                      Vizyonumuz
                    </h3>
                    <p className="text-white/80 text-lg leading-relaxed">{about.vision}</p>
                  </motion.div>
                )}
              </div>
            )}

            {about.values && about.values.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-8"
              >
                <h3 className="text-3xl font-bold text-gold-400 mb-8 text-center flex items-center justify-center gap-3">
                  <Star className="w-8 h-8" />
                  Değerlerimiz
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {about.values.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <p className="text-white/80 text-lg">{value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Team Section */}
      {sectionVisibility.team && team.length > 0 && (
        <section id="team" className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gold-400/30 rounded-full"
              style={{
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 1,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-white mb-4">Ekibimiz</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  className="glass rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-gold-500/20 transition-all"
                >
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-transparent opacity-60"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-gold-400 text-lg mb-4">{member.title}</p>
                    <p className="text-white/70 leading-relaxed mb-6 line-clamp-4">{member.bio}</p>

                    {(member.email || member.phone) && (
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        {member.email && (
                          <p className="text-white/60 text-sm flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </p>
                        )}
                        {member.phone && (
                          <p className="text-white/60 text-sm flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {sectionVisibility.testimonials && testimonials.length > 0 && (
      <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Öğrenci Yorumları</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-gold-500 text-gold-500' : 'text-gray-400'}`} />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  {testimonial.photo ? (
                    <Image
                      src={testimonial.photo}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600"></div>
                  )}
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    {testimonial.company && (
                      <div className="text-white/60 text-sm">{testimonial.company}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Blog Section */}
      {sectionVisibility.blog && blogPosts.length > 0 && (
      <section id="blog" className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Tiyatro Blogu</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Tiyatro dünyasından haberler, etkinliklerimiz ve oyunlarımız
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(0, 6).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                onClick={() => setSelectedBlogPost(post)}
                className="glass rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                {post.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-gold-500/20 text-gold-400 rounded">
                      {post.category}
                    </span>
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gold-400">Devamını Oku →</span>
                    <span className="text-white/50">
                      {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Contact Section */}
      {sectionVisibility.contact && contact && (
      <section id="contact" className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900 relative overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-gold-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.9,
              type: "spring",
              stiffness: 80,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">İletişim</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
            <p className="text-xl text-white/70">
              Kurslarımız hakkında bilgi almak için bizimle iletişime geçin
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="glass rounded-2xl p-8 text-center"
            >
              <Phone className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Telefon</h3>
              <p className="text-white/70">{contact.phone}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="glass rounded-2xl p-8 text-center"
            >
              <Mail className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">E-posta</h3>
              <p className="text-white/70">{contact.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="glass rounded-2xl p-8 text-center"
            >
              <MapPin className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Adres</h3>
              <p className="text-white/70">{contact.address}</p>
              <p className="text-white/60 text-sm mt-2">{contact.workingHours}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass rounded-2xl p-12 mt-12"
          >
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Mesaj Gönderin</h3>
            <form className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <input
                  type="email"
                  placeholder="E-posta Adresiniz"
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <input
                type="text"
                placeholder="Konu"
                className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <textarea
                rows={6}
                placeholder="Mesajınız"
                className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-4 rounded-lg font-semibold hover:from-gold-700 hover:to-gold-600 transition-all transform hover:scale-[1.02]"
              >
                Gönder
              </button>
            </form>
          </motion.div>
        </div>
      </section>
      )}

      {/* Footer */}
      <Footer />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />

      {/* Blog Post Modal */}
      <AnimatePresence>
        {selectedBlogPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedBlogPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10 my-8"
            >
              {/* Modal Header with Video or Image */}
              {selectedBlogPost.videoUrl ? (
                // Header with Video
                <div className="relative w-full bg-black">
                  {selectedBlogPost.videoUrl.includes('youtube.com') || selectedBlogPost.videoUrl.includes('youtu.be') ? (
                    // YouTube embed
                    <div className="relative w-full pb-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${
                          selectedBlogPost.videoUrl.includes('youtu.be')
                            ? selectedBlogPost.videoUrl.split('youtu.be/')[1]?.split('?')[0]
                            : selectedBlogPost.videoUrl.split('v=')[1]?.split('&')[0]
                        }`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Native video player
                    <video
                      controls
                      className="w-full"
                      src={selectedBlogPost.videoUrl}
                    >
                      Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                  )}
                  <button
                    onClick={() => setSelectedBlogPost(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white z-10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : selectedBlogPost.image ? (
                // Header with Image
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={selectedBlogPost.image}
                    alt={selectedBlogPost.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-800 via-navy-800/50 to-transparent" />
                  <button
                    onClick={() => setSelectedBlogPost(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                // Header without media
                <div className="bg-navy-900/50 border-b border-white/10 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold-400" />
                    <span className="text-xs px-2 py-1 bg-gold-500/20 text-gold-400 rounded">
                      {selectedBlogPost.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBlogPost(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Modal Content */}
              <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-400px)]">
                {/* Tags and Category */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full font-semibold">
                    {selectedBlogPost.category}
                  </span>
                  {selectedBlogPost.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-white/10 text-white/60 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {selectedBlogPost.title}
                </h2>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-white/60 mb-6 pb-6 border-b border-white/10">
                  <span>
                    {new Date(selectedBlogPost.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-gold max-w-none">
                  <div
                    className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: selectedBlogPost.content.replace(/\n\n/g, '</p><p class="mb-4">').replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-navy-900/50 border-t border-white/10 px-8 py-4 flex justify-between items-center">
                <div className="text-sm text-white/60">
                  {selectedBlogPost.tags.length} etiket
                </div>
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
