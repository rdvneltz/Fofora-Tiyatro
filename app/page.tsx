'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Scale, Users, FileText, Phone, Mail, MapPin, Award, Shield, Clock, ChevronRight, Star, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const services = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Ticaret Hukuku",
      description: "Şirket kuruluşu, birleşme, devralma ve ticari dava süreçlerinde profesyonel danışmanlık"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Sözleşme Hukuku",
      description: "Her türlü sözleşmenin hazırlanması, incelenmesi ve müzakere süreçlerinde hukuki destek"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Ceza Hukuku",
      description: "Ceza davalarında savunma, suç mağdurları için hukuki destek ve müşteki vekâleti"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Aile Hukuku",
      description: "Boşanma, velayet, nafaka ve mal paylaşımı konularında uzman hukuki danışmanlık"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "İş ve Sosyal Güvenlik Hukuku",
      description: "İşçi ve işveren haklarının korunması, iş sözleşmeleri ve tazminat davaları"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Gayrimenkul Hukuku",
      description: "Tapu işlemleri, kira sözleşmeleri, tahliye ve gayrimenkul alım-satım süreçleri"
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
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
            MÜREKKEP HUKUK
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-2xl md:text-3xl text-white/90 mb-4"
          >
            Adaletin Kalemi
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-gold-300 mb-12 max-w-3xl mx-auto"
          >
            Hukuki haklarınız için güvenilir, profesyonel ve etkili çözümler sunuyoruz
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-gold-600 to-gold-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-gold-700 hover:to-gold-600 transition-all shadow-2xl flex items-center gap-2 mx-auto"
          >
            Ücretsiz Danışmanlık
            <ChevronRight className="w-5 h-5" />
          </motion.button>
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
      <section className="py-24 px-4 bg-gradient-to-b from-navy-900 to-navy-800">
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
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass rounded-2xl p-8 hover:bg-white/20 transition-all group"
              >
                <div className="text-gold-500 mb-6 transform group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-white/70 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-navy-800 to-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Image
                src="/assets/av-faruk-celep-foto.jpeg"
                alt="Av. Faruk Celep"
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
              <h2 className="text-5xl font-bold text-white mb-6">Av. Faruk Celep</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-600 to-gold-400 mb-8"></div>

              <div className="space-y-6 text-white/80 text-lg leading-relaxed">
                <p>
                  Mürekkep Hukuk Bürosu, yılların deneyimi ve uzmanlığıyla müvekkillerine
                  en kaliteli hukuki hizmeti sunma misyonuyla hareket eder.
                </p>
                <p>
                  Hukuk alanında edindiğimiz derin bilgi birikimi ve güncel yaklaşımlarımızla,
                  her davayı özenle ele alıyor ve müvekkillerimizin haklarını en iyi şekilde koruyoruz.
                </p>
                <p>
                  Dürüstlük, şeffaflık ve profesyonellik ilkelerimiz doğrultusunda,
                  sizlere güvenilir bir hukuki danışman olmaktan gurur duyuyoruz.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-500 mb-2">15+</div>
                  <div className="text-white/60">Yıl Tecrübe</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-500 mb-2">500+</div>
                  <div className="text-white/60">Başarılı Dava</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-500 mb-2">100%</div>
                  <div className="text-white/60">Memnuniyet</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
              <p className="text-white/70">+90 212 XXX XX XX</p>
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
              <p className="text-white/70">info@murekkephukuk.com</p>
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
              <p className="text-white/70">İstanbul, Türkiye</p>
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
