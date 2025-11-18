'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Scale, Users, FileText, Phone, Mail, MapPin, Award, Shield, Clock, ChevronRight, Star, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'

interface HeroData {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
}

interface Service {
  id: string
  title: string
  description: string
  icon: string
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

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [hero, setHero] = useState<HeroData>({
    title: 'MÜREKKEP HUKUK',
    subtitle: 'Adaletin Kalemi',
    description: 'Hukuki haklarınız için güvenilir, profesyonel ve etkili çözümler sunuyoruz',
    buttonText: 'Ücretsiz Danışmanlık',
    buttonLink: '#contact'
  })

  const [services, setServices] = useState<Service[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [contact, setContact] = useState<ContactInfo>({
    id: '',
    address: 'İstanbul, Türkiye',
    phone: '+90 212 XXX XX XX',
    email: 'info@murekkephukuk.com',
    workingHours: 'Pazartesi - Cuma: 09:00 - 18:00'
  })

  useEffect(() => {
    // Hero verilerini çek
    axios.get('/api/hero', {
      headers: { 'Cache-Control': 'no-cache' }
    }).then(({ data }) => {
      if (data) setHero(data)
    }).catch((err) => console.error('Hero error:', err))

    // Hizmetleri çek
    axios.get('/api/services', {
      headers: { 'Cache-Control': 'no-cache' }
    }).then(({ data }) => {
      console.log('Services data:', data)
      if (data && data.length > 0) setServices(data)
    }).catch((err) => console.error('Services error:', err))

    // Ekip üyelerini çek
    axios.get('/api/team', {
      headers: { 'Cache-Control': 'no-cache' }
    }).then(({ data }) => {
      console.log('Team data:', data)
      if (data && data.length > 0) setTeam(data)
    }).catch((err) => console.error('Team error:', err))

    // İletişim bilgilerini çek
    axios.get('/api/contact', {
      headers: { 'Cache-Control': 'no-cache' }
    }).then(({ data }) => {
      console.log('Contact data:', data)
      if (data) setContact(data)
    }).catch((err) => console.error('Contact error:', err))
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

  return (
    <div ref={containerRef} className="min-h-screen bg-navy-900">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Full Screen Video Background */}
        <div className="absolute inset-0">
          <iframe
            src="https://www.youtube.com/embed/nIl0V9p5Y08?autoplay=1&mute=1&loop=1&playlist=nIl0V9p5Y08&controls=0&showinfo=0&rel=0&modestbranding=1"
            className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80"></div>
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-12"
          >
            <Image
              src="/assets/murekkep-logo-saydam.png"
              alt="Mürekkep Hukuk"
              width={200}
              height={200}
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

          <motion.a
            href={hero.buttonLink}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl inline-flex items-center gap-2 hover:from-gold-700 hover:to-gold-600 transition-all"
          >
            {hero.buttonText}
            <ChevronRight className="w-5 h-5" />
          </motion.a>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold-400"
          >
            <ChevronRight className="w-8 h-8 rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Hukuki Hizmetlerimiz</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Her türlü hukuki ihtiyacınız için kapsamlı ve profesyonel çözümler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{
                  y: -15,
                  scale: 1.05,
                  boxShadow: "0 20px 60px rgba(193, 154, 107, 0.3)",
                  borderColor: "rgba(193, 154, 107, 0.5)",
                }}
                className="glass rounded-2xl p-8 transition-all group cursor-pointer border-2 border-transparent"
              >
                <motion.div
                  className="text-gold-500 mb-6"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  {getIcon(service.icon)}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold-400 transition-colors">{service.title}</h3>
                <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{service.description}</p>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center text-white/70">
                Henüz hizmet eklenmemiş. Admin panelden hizmet ekleyebilirsiniz.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section id="team" className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-white mb-4">Ekibimiz</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Image
                  src={team[0].image}
                  alt={team[0].name}
                  width={600}
                  height={800}
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-white mb-6">{team[0].name}</h3>
                <p className="text-gold-400 text-xl mb-6">{team[0].title}</p>

                <div className="space-y-6 text-white/80 text-lg leading-relaxed">
                  <p>{team[0].bio}</p>
                </div>

                {(team[0].email || team[0].phone) && (
                  <div className="mt-8 space-y-2">
                    {team[0].email && (
                      <p className="text-white/70">
                        <Mail className="w-5 h-5 inline mr-2" />
                        {team[0].email}
                      </p>
                    )}
                    {team[0].phone && (
                      <p className="text-white/70">
                        <Phone className="w-5 h-5 inline mr-2" />
                        {team[0].phone}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Müvekkil Görüşleri</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">
                  "Mürekkep Hukuk Bürosu ile çalışmak gerçekten harika bir deneyimdi.
                  Profesyonellikleri ve işlerine olan hakimiyetleri takdire şayan."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600"></div>
                  <div>
                    <div className="text-white font-semibold">Müvekkil {item}</div>
                    <div className="text-white/60 text-sm">Ticaret Hukuku</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">İletişim</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mx-auto mb-6"></div>
            <p className="text-xl text-white/70">
              Hukuki danışmanlık için bizimle iletişime geçin
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 text-center"
            >
              <Phone className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Telefon</h3>
              <p className="text-white/70">{contact.phone}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <Mail className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">E-posta</h3>
              <p className="text-white/70">{contact.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <MapPin className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Adres</h3>
              <p className="text-white/70">{contact.address}</p>
              <p className="text-white/60 text-sm mt-2">{contact.workingHours}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src="/assets/murekkep-logo-saydam.png"
            alt="Mürekkep Hukuk"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <p className="text-white/60 mb-4">
            © 2024 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır.
          </p>
          <div className="flex justify-center gap-6 text-white/60">
            <a href="#" className="hover:text-gold-500 transition">Gizlilik Politikası</a>
            <span>|</span>
            <a href="#" className="hover:text-gold-500 transition">Kullanım Koşulları</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
