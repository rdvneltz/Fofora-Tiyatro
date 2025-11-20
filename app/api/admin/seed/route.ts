import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Güvenlik için secret key kontrolü
const SEED_SECRET = process.env.SEED_SECRET || 'murekkep-hukuk-seed-2025'

export async function POST(request: NextRequest) {
  try {
    // Secret key kontrolü
    const { secret } = await request.json()

    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    console.log('🗑️  Veritabanı temizleniyor...')

    // Clear all data
    await prisma.appointment.deleteMany({})
    await prisma.availableSlot.deleteMany({})
    await prisma.testimonial.deleteMany({})
    await prisma.blogPost.deleteMany({})
    await prisma.teamMember.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.heroVideo.deleteMany({})
    await prisma.contactInfo.deleteMany({})
    await prisma.aboutSection.deleteMany({})
    await prisma.heroSection.deleteMany({})
    await prisma.siteSettings.deleteMany({})

    // 1. SITE AYARLARI
    await prisma.siteSettings.create({
      data: {
        siteName: 'Mürekkep Hukuk',
        siteTitle: 'Mürekkep Hukuk - Adaletin Kalemi',
        description: 'İstanbul merkezli, ulusal ve uluslararası hukuki danışmanlık hizmetleri sunan köklü hukuk büromuz, müvekkillerimize en yüksek standartta profesyonel destek sağlamaktadır.',
        logo: '/assets/murekkep-logo-saydam.png',
        primaryColor: '#c19a6b',
        secondaryColor: '#243b53',
        footerText: '© 2025 Mürekkep Hukuk Bürosu. Tüm hakları saklıdır.',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/murekkep-hukuk',
          twitter: 'https://twitter.com/murekkephukuk',
          instagram: 'https://instagram.com/murekkephukuk'
        },
        sectionVisibility: {
          hero: true,
          services: true,
          about: true,
          team: true,
          testimonials: true,
          blog: true,
          contact: true
        }
      }
    })

    // 2. HERO SECTION
    await prisma.heroSection.create({
      data: {
        title: 'Adaletin Kalemi',
        subtitle: 'Mürekkep Hukuk Bürosu',
        description: 'Hukuki haklarınız için güvenilir, profesyonel ve etkili çözümler sunuyoruz. 25 yıllık tecrübemizle yanınızdayız.',
        buttonText: 'Randevu Al',
        buttonLink: '#appointment',
        logo: '/assets/murekkep-logo-saydam.png',
        logoWidth: 200,
        logoHeight: 200,
        showButton: true,
        active: true
      }
    })

    // 3. HERO VIDEOS (1-21.mp4)
    for (let i = 1; i <= 21; i++) {
      await prisma.heroVideo.create({
        data: {
          fileName: `${i}.mp4`,
          order: i - 1,
          active: true
        }
      })
    }

    // 4. HİZMETLER
    const services = [
      {
        title: 'Ticaret Hukuku',
        description: 'Şirket kuruluşu, birleşme ve devirler, ortaklık anlaşmazlıkları, ticari sözleşmeler ve ticari dava süreçlerinde kapsamlı hukuki danışmanlık ve temsil hizmetleri sunuyoruz.',
        details: 'Limited ve anonim şirket kuruluşları, şirket birleşme ve devir işlemleri, ortaklık yapısı değişiklikleri, pay devri işlemleri, genel kurul toplantıları, ticari sözleşme hazırlama ve müzakere, franchise sözleşmeleri, distribütörlük anlaşmaları, rekabet hukuku uygulamaları.',
        icon: 'Scale',
        order: 0
      },
      {
        title: 'Ceza Hukuku',
        description: 'Ceza davalarında müdafi ve vekil sıfatıyla temsil, soruşturma aşamasında hukuki destek, tutuklama itirazları ve tüm ceza hukuku süreçlerinde profesyonel savunma hizmeti.',
        details: 'Ağır ceza ve asliye ceza davalarında savunma, soruşturma aşamasında ifade ve savunma hazırlığı, tutuklama itirazları, adli kontrol tedbirleri, hükmün açıklanmasının geri bırakılması (HAGB), uzlaştırma süreçleri, ceza infaz işlemleri, koşullu salıverme başvuruları.',
        icon: 'Shield',
        order: 1
      },
      {
        title: 'Aile Hukuku',
        description: 'Boşanma davaları, velayet hukuku, nafaka, mal paylaşımı, nişan ve evlilik sözleşmeleri konularında hassas ve güvenilir hukuki danışmanlık ve temsil hizmeti.',
        details: 'Anlaşmalı ve çekişmeli boşanma davaları, velayet ve kişisel ilişki düzenleme, iştirak nafakası, yoksulluk nafakası, tedbir nafakası, boşanma sonrası mal paylaşımı ve tasfiyesi, mal rejimi sözleşmeleri, nişanın bozulması davaları, babalık ve soybağı davaları.',
        icon: 'Users',
        order: 2
      },
      {
        title: 'İş ve Sosyal Güvenlik Hukuku',
        description: 'İş sözleşmeleri, işçi-işveren uyuşmazlıkları, kıdem ve ihbar tazminatları, SGK işlemleri ve iş kazası tazminat davaları konusunda uzman hukuki destek.',
        details: 'İş sözleşmelerinin hazırlanması ve müzakeresi, işe iade davaları, kıdem ve ihbar tazminatı davaları, fazla mesai alacağı, yıllık izin ücreti, ulusal bayram ve genel tatil alacakları, iş kazası ve meslek hastalığı tazminat davaları, mobbing davaları, SGK işlemleri ve itirazları.',
        icon: 'Briefcase',
        order: 3
      },
      {
        title: 'Gayrimenkul Hukuku',
        description: 'Tapu işlemleri, gayrimenkul alım-satım sözleşmeleri, kira hukuku, tahliye davaları, imar hukuku ve inşaat hukuku konularında danışmanlık ve dava takibi.',
        details: 'Gayrimenkul alım satım sözleşmeleri, tapu devir işlemleri, satış vaadi sözleşmeleri, kira sözleşmeleri düzenleme, tahliye davaları, kiracı hakları, ecrimisil davaları, imar uygulamaları, kat karşılığı inşaat sözleşmeleri, kusurlu inşaat davaları, ayıplı inşaat tazminat talepleri.',
        icon: 'Building',
        order: 4
      },
      {
        title: 'Miras Hukuku',
        description: 'Miras paylaşımı, vasiyetname düzenleme, mirasçılık belgesi, mirastan feragat, tenkis ve miras reddi işlemlerinde profesyonel hukuki danışmanlık hizmeti.',
        details: 'Veraset ilamı (mirasçılık belgesi) çıkarma, miras paylaşım davaları, tenkis davaları, miras sözleşmeleri, vasiyetnamenin iptali davaları, mirastan feragat işlemleri, saklı pay hesaplamaları, murisin borçlarından sorumluluk, miras reddi işlemleri.',
        icon: 'FileText',
        order: 5
      },
      {
        title: 'Sigorta Hukuku',
        description: 'Sigorta sözleşmeleri, hasar ve tazminat talepleri, sigorta şirketleri ile uyuşmazlıklar ve tüm sigorta hukuku davalarında temsil ve danışmanlık hizmeti.',
        details: 'Zorunlu trafik sigortası (kasko) tazminat davaları, hayat sigortası uyuşmazlıkları, sağlık sigortası talepleri, işveren mali sorumluluk sigortası, yangın ve deprem sigortası hasarları, sigorta sözleşmelerinin feshi, ekspertiz raporlarına itiraz.',
        icon: 'Shield',
        order: 6
      },
      {
        title: 'Tüketici Hukuku',
        description: 'Tüketici hakları ihlalleri, ayıplı mal ve hizmet uyuşmazlıkları, tüketici mahkemesi davaları ve Tüketici Hakem Heyeti süreçlerinde hukuki destek.',
        details: 'Ayıplı mal ve hizmet şikayetleri, cayma hakkı kullanımı, garantiden yararlanma, Tüketici Hakem Heyeti başvuruları, sözleşme iptali talepleri, tüketici kredileri uyuşmazlıkları, mesafeli satış sözleşmeleri, kapıdan satış sözleşmeleri, ön ödemeli konut satış sözleşmeleri.',
        icon: 'Users',
        order: 7
      }
    ]

    for (const service of services) {
      await prisma.service.create({ data: service })
    }

    // 5. HAKKIMIZDA
    await prisma.aboutSection.create({
      data: {
        title: 'Mürekkep Hukuk Bürosu',
        content: 'Mürekkep Hukuk Bürosu, 2000 yılında İstanbul\'da kurulmuş olup, 25 yıllık köklü geçmişi ile Türkiye\'nin önde gelen hukuk bürolarından biridir. Büromuz, ticaret hukuku, ceza hukuku, aile hukuku, iş hukuku ve gayrimenkul hukuku başta olmak üzere geniş bir yelpazede hukuki danışmanlık ve dava takip hizmetleri sunmaktadır.\n\nDeneyimli avukat kadromuz ve uzman hukuk ekibimiz ile müvekkillerimize en kaliteli hukuki hizmeti sunmayı ilke edindik. Ulusal ve uluslararası alanda faaliyet gösteren bireysel ve kurumsal müvekkillerimize, hukuki sorunlarının çözümünde stratejik ve etkili destek sağlıyoruz.',
        mission: 'Adaleti, dürüstlüğü ve profesyonelliği ön planda tutarak müvekkillerimize en yüksek standartta hukuki hizmet sunmak, haklarını korumak ve hukuki süreçlerde en iyi sonucu elde etmelerini sağlamak.',
        vision: 'Türkiye\'nin en güvenilir ve tercih edilen hukuk bürolarından biri olmak, hukuki danışmanlık alanında öncü ve yenilikçi çözümler sunarak sektörde fark yaratmak.',
        values: [
          'Dürüstlük ve Şeffaflık',
          'Profesyonellik ve Uzmanlık',
          'Müvekkil Memnuniyeti',
          'Gizlilik ve Güven',
          'Sürekli Gelişim ve Yenilik',
          'Etik Değerlere Bağlılık'
        ],
        active: true
      }
    })

    // 6. EKİP ÜYELERİ
    const team = [
      {
        name: 'Av. Mehmet Yılmaz',
        title: 'Kurucu Ortak Avukat',
        bio: 'İstanbul Üniversitesi Hukuk Fakültesi mezunu. 25 yıllık deneyimi ile ticaret hukuku ve şirketler hukuku alanında uzmanlaşmıştır. Türkiye Barolar Birliği üyesi.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        email: 'mehmet.yilmaz@murekkephukuk.com',
        phone: '+90 212 555 01 01',
        order: 0
      },
      {
        name: 'Av. Ayşe Demir',
        title: 'Ortak Avukat - Ceza Hukuku Uzmanı',
        bio: 'Ankara Üniversitesi Hukuk Fakültesi mezunu. Ceza hukuku alanında 18 yıllık tecrübeye sahiptir. Yüzlerce ceza davasında başarılı savunmalar gerçekleştirmiştir.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        email: 'ayse.demir@murekkephukuk.com',
        phone: '+90 212 555 01 02',
        order: 1
      },
      {
        name: 'Av. Ahmet Kaya',
        title: 'Kıdemli Avukat - Aile Hukuku Uzmanı',
        bio: 'Marmara Üniversitesi Hukuk Fakültesi mezunu. Aile hukuku ve miras hukuku alanlarında 15 yıldır hizmet vermektedir. Boşanma ve velayet davalarında uzman.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        email: 'ahmet.kaya@murekkephukuk.com',
        phone: '+90 212 555 01 03',
        order: 2
      },
      {
        name: 'Av. Zeynep Arslan',
        title: 'Avukat - İş ve Sosyal Güvenlik Hukuku',
        bio: 'Galatasaray Üniversitesi Hukuk Fakültesi mezunu. İş hukuku ve sosyal güvenlik hukuku konularında 10 yıllık deneyime sahiptir. İşçi ve işveren davalarında uzman.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        email: 'zeynep.arslan@murekkephukuk.com',
        phone: '+90 212 555 01 04',
        order: 3
      },
      {
        name: 'Av. Can Özkan',
        title: 'Avukat - Gayrimenkul ve İnşaat Hukuku',
        bio: 'Koç Üniversitesi Hukuk Fakültesi mezunu. Gayrimenkul hukuku, imar hukuku ve inşaat hukuku alanlarında 8 yıldır çalışmaktadır. Tapu ve emlak davalarında deneyimli.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        email: 'can.ozkan@murekkephukuk.com',
        phone: '+90 212 555 01 05',
        order: 4
      },
      {
        name: 'Selin Yıldırım',
        title: 'Hukuk Müşaviri',
        bio: 'Bilgi Üniversitesi Hukuk Fakültesi mezunu. Sözleşme hukuku ve kurumsal danışmanlık alanlarında 6 yıllık tecrübeye sahiptir. Şirket kuruluş işlemlerinde uzman.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
        email: 'selin.yildirim@murekkephukuk.com',
        phone: '+90 212 555 01 06',
        order: 5
      },
      {
        name: 'Burak Şahin',
        title: 'Basın ve Halkla İlişkiler Danışmanı',
        bio: 'İstanbul Üniversitesi Halkla İlişkiler ve Tanıtım bölümü mezunu. 12 yıldır hukuk sektöründe kurumsal iletişim ve medya yönetimi alanında hizmet vermektedir.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        email: 'burak.sahin@murekkephukuk.com',
        phone: '+90 212 555 01 07',
        order: 6
      }
    ]

    for (const member of team) {
      await prisma.teamMember.create({ data: member })
    }

    // 7. BLOG YAZILARI
    const blogPosts = [
      {
        title: 'Yeni Ticaret Kanunu ile Şirket Kuruluşunda Değişiklikler',
        slug: 'yeni-ticaret-kanunu-ile-sirket-kurulusunda-degisiklikler',
        category: 'Ticaret Hukuku',
        excerpt: 'Yeni Türk Ticaret Kanunu ile birlikte şirket kuruluş süreçlerinde önemli değişiklikler yapıldı. Bu değişikliklerin şirket sahipleri ve yöneticileri için anlamını detaylı olarak inceliyoruz.',
        content: `# Yeni Ticaret Kanunu ile Şirket Kuruluşunda Değişiklikler\n\nTürk Ticaret Kanunu'nda yapılan son düzenlemeler, şirket kuruluş süreçlerini önemli ölçüde etkilemektedir. Bu yazımızda, yeni düzenlemelerin getirdiği değişiklikleri ve bu değişikliklerin girişimciler için anlamını detaylı olarak ele alacağız.\n\n## Minimum Sermaye Şartları\n\nYeni düzenlemelerle birlikte, limited şirket kuruluşunda minimum sermaye şartı değiştirilmiştir. Artık daha esnek bir yapı söz konusudur.\n\n## Elektronik Ortamda Şirket Kuruluşu\n\nE-devlet sistemi üzerinden şirket kuruluş işlemlerinin tamamlanabilmesi, süreçleri hızlandırmış ve maliyetleri düşürmüştür.\n\n## Sonuç\n\nYeni düzenlemeler, şirket kuruluşunu kolaylaştırırken, hukuki danışmanlık almak hala büyük önem taşımaktadır. Doğru ve eksiksiz bir kuruluş süreci için profesyonel destek almayı ihmal etmeyin.`,
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
        tags: ['Ticaret Hukuku', 'Şirket Kuruluşu', 'TTK'],
        published: true
      },
      {
        title: 'Boşanma Davalarında Velayet Hakkı Nasıl Belirlenir?',
        slug: 'bosanma-davalarinda-velayet-hakki-nasil-belirlenir',
        category: 'Aile Hukuku',
        excerpt: 'Boşanma sürecinde en hassas konulardan biri velayet hakkıdır. Mahkemenin velayet kararını hangi kriterlere göre verdiğini ve ebeveynlerin haklarını açıklıyoruz.',
        content: `# Boşanma Davalarında Velayet Hakkı\n\nBoşanma davalarında, çocukların üstün yararı her zaman ön planda tutulur. Velayet hakkının belirlenmesinde mahkeme çeşitli faktörleri değerlendirmektedir.\n\n## Mahkemenin Değerlendirdiği Kriterler\n\n- Çocuğun yaşı ve cinsiyeti\n- Ebeveynlerin ekonomik durumu\n- Çocuğun alıştığı ortam ve yaşam koşulları\n- Ebeveynlerin çocuğa ayıracak zamanı\n\n## Velayetin Değiştirilmesi\n\nVelayet kararları kesin değildir ve değişen koşullara göre yeniden değerlendirilebilir.\n\n## Sonuç\n\nVelayet davalarında profesyonel hukuki destek almak, hem sürecin sağlıklı ilerlemesi hem de çocuğun yararının korunması açısından önemlidir.`,
        image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&h=400&fit=crop',
        tags: ['Aile Hukuku', 'Boşanma', 'Velayet'],
        published: true
      },
      {
        title: 'İş Kazalarında Tazminat Hakları ve Başvuru Süreci',
        slug: 'is-kazalarinda-tazminat-haklari-ve-basvuru-sureci',
        category: 'İş Hukuku',
        excerpt: 'İş kazası geçiren çalışanların tazminat hakları ve bu hakları nasıl kullanabilecekleri hakkında detaylı bilgiler. SGK işlemleri ve dava süreçleri.',
        content: `# İş Kazalarında Tazminat Hakları\n\nİş kazası, işyerinde veya işin yapılması sırasında meydana gelen ve çalışanın bedensel veya ruhsal sağlığını etkileyen olaylardır.\n\n## Tazminat Türleri\n\n1. **Maddi Tazminat**: Tedavi giderleri, iş göremezlik tazminatı, gelir kaybı\n2. **Manevi Tazminat**: Psikolojik zarar\n\n## SGK ve İşveren Sorumluluğu\n\nSGK'dan alınan ödemeler, işveren sorumluluğunu ortadan kaldırmaz. İşçi, hem SGK'dan hem de işverenden tazminat talep edebilir.\n\n## Başvuru Süreci\n\nİş kazası sonrası 5 yıl içinde dava açma hakkı bulunmaktadır. Ancak erken başvuru, delillerin korunması açısından önemlidir.`,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
        tags: ['İş Hukuku', 'İş Kazası', 'Tazminat'],
        published: true
      },
      {
        title: 'Gayrimenkul Alım Satımında Dikkat Edilmesi Gerekenler',
        slug: 'gayrimenkul-alim-satiminda-dikkat-edilmesi-gerekenler',
        category: 'Gayrimenkul Hukuku',
        excerpt: 'Ev, arsa veya işyeri alırken nelere dikkat etmelisiniz? Tapu işlemleri, sözleşmeler ve yasal süreçler hakkında bilinmesi gerekenler.',
        content: `# Gayrimenkul Alım Satımında Dikkat Edilmesi Gerekenler\n\nGayrimenkul alım satımı, büyük yatırımlar gerektiren ve hukuki açıdan hassas bir süreçtir. Bu yazımızda, güvenli bir alım satım için dikkat edilmesi gereken noktaları ele alıyoruz.\n\n## Tapu İncelemesi\n\nGayrimenkul satın almadan önce mutlaka tapu kaydı detaylı incelenmelidir:\n- Malik bilgileri\n- Şerhler ve ipotekler\n- İmar durumu\n- Kat irtifakı ve kat mülkiyeti\n\n## Sözleşme Hazırlığı\n\nSatış vaadi sözleşmesi veya kat karşılığı inşaat sözleşmeleri mutlaka yazılı yapılmalı ve tüm şartlar açıkça belirtilmelidir.\n\n## Vergi ve Harçlar\n\nKDV, tapu harcı, emlak vergisi gibi mali yükümlülükler önceden hesaplanmalı ve taraflar arasında paylaşım konusunda anlaşma sağlanmalıdır.\n\n## Sonuç\n\nGayrimenkul alım satımında yaşanabilecek sorunları önlemek için mutlaka profesyonel hukuki danışmanlık alınmalıdır.`,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
        tags: ['Gayrimenkul Hukuku', 'Tapu', 'Alım Satım'],
        published: true
      }
    ]

    for (const post of blogPosts) {
      await prisma.blogPost.create({ data: post })
    }

    // 8. MÜVEKKİL GÖRÜŞLERİ
    const testimonials = [
      {
        name: 'Ahmet Özdemir',
        title: 'Özdemir İnşaat A.Ş. - Yönetim Kurulu Başkanı',
        content: 'Mürekkep Hukuk Bürosu ile 5 yıldır çalışıyoruz. Ticari davalarımızda gösterdikleri profesyonel yaklaşım ve başarılı sonuçlar sayesinde şirketimizin hukuki süreçleri güven içinde ilerliyor. Kesinlikle tavsiye ediyorum.',
        rating: 5,
        active: true
      },
      {
        name: 'Elif Yılmaz',
        title: 'Bireysel Müvekkil',
        content: 'Boşanma davamda Av. Ahmet Kaya\'nın desteğini aldım. Hem hukuki süreçte hem de duygusal olarak yanımda oldular. Profesyonellik, anlayış ve başarı bir arada. Teşekkür ederim.',
        rating: 5,
        active: true
      },
      {
        name: 'Mehmet Kara',
        title: 'Kara Otomotiv - Genel Müdür',
        content: 'İş kazası sonrası tazminat davamda Mürekkep Hukuk\'un desteğini aldım. Süreç boyunca her aşamada bilgilendirildiğim ve hakkettiğim tazminatı aldığım için çok memnunum. Herkese tavsiye ederim.',
        rating: 5,
        active: true
      },
      {
        name: 'Ayşe Demir',
        title: 'Demir Tekstil Ltd. - Kurucu Ortak',
        content: 'Şirket kuruluş sürecimizde ve sonrasında devam eden hukuki danışmanlık hizmetlerinde Mürekkep Hukuk\'un uzmanlığından faydalandık. Hızlı, etkili ve güvenilir bir ekip. Kesinlikle öneririm.',
        rating: 5,
        active: true
      },
      {
        name: 'Can Arslan',
        title: 'Bireysel Müvekkil',
        content: 'Miras paylaşımı davasında bize destek oldular. Karmaşık olan süreci anlaşılır hale getirdiler ve ailemiz için en iyi sonucu elde ettiler. Profesyonellikleri için teşekkür ederiz.',
        rating: 5,
        active: true
      }
    ]

    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: testimonial })
    }

    // 9. İLETİŞİM BİLGİLERİ
    await prisma.contactInfo.create({
      data: {
        address: 'Nispetiye Caddesi No: 12/5, Levent, Beşiktaş, İstanbul',
        phone: '+90 212 555 01 00',
        email: 'info@murekkephukuk.com',
        workingHours: 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 14:00 (Randevu ile)',
        mapUrl: 'https://maps.google.com/?q=Levent,Istanbul'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Veritabanı başarıyla dolduruldu!',
      data: {
        siteSettings: 1,
        heroSection: 1,
        heroVideos: 21,
        services: 8,
        aboutSection: 1,
        teamMembers: 7,
        blogPosts: 4,
        testimonials: 5,
        contactInfo: 1
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        error: 'Seed işlemi başarısız',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
