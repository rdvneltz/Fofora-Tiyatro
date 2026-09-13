# Fofora Tiyatro — Site Kullanım Kılavuzu ve Denetim Raporu

Bu belge iki şeyi bir arada anlatır:

1. **Kullanım kılavuzu:** Yönetim panelindeki (`/admin`) her bölümün ne işe yaradığı, girdiğiniz içeriğin herkese açık sitede **nerede ve nasıl** göründüğü.
2. **Denetim raporu:** Panelin baştan sona yapılan denetiminde bulunan hatalar, neyin düzeltildiği ve — dürüstçe — **neyin henüz siteye bağlı olmadığı**.

Site şu mantıkla çalışır: yönetim panelinde kaydettiğiniz her şey MongoDB'de saklanır; herkese açık sayfalar (anasayfa, `/oyunlar`, `/egitimler` vb.) açıldığında bu veriyi API üzerinden çeker ve ekrana basar. Yani **panelde yaptığınız değişiklik, sayfayı yeniden açtığınızda (F5) sitede görünür** — ayrıca bir "yayınla" adımı yoktur.

---

## 1. Genel Kontrol Modeli

- Panelde her bölümün kendi "Aktif" anahtarı vardır. **Pasif yaptığınız bir kayıt siteden kalkar** — bu artık panelin kendi listesinden de kalkmaz, düzeltildi (bkz. §7.1), yani istediğiniz zaman geri Aktif yapabilirsiniz.
- Fotoğraf/video yüklediğiniz her yerde, o dosyayı silip yeni bir tane yüklediğinizde veya kaydı tamamen sildiğinizde, **eski dosya artık Cloudflare depolama alanından da otomatik siliniyor** (bkz. §7.2) — böylece gereksiz yere yer kaplamıyor.
- Türkçe karakterli, uzun metinler her alanda güvenle kullanılabilir.

---

## 2. Bölüm Bölüm: Panel → Site Karşılığı

### Bugün (Dashboard)
Sadece özet ekranıdır (yeni mesaj sayısı vb.), kendi başına bir içerik üretmez.

### Hızlı Metin Düzenle (`/admin/content`)
Anasayfadaki sabit başlıkları/metinleri değiştirir: "Şu Anda Fofora'da", "Yaklaşan Oyunlar", "Takvim", "Eğitimler", "Bizden Kareler", "Bizden Haberler", "Ekibimiz", "Bize Yazın" başlığı ve açıklaması, slogan, footer alt yazısı, WhatsApp ön-yazılı mesajı. Hepsi anasayfada ilgili bölüm başlığı olarak **birebir** görünür. Sorunsuz çalışıyor.

### Takvim (`/admin/calendar`)
Anasayfanın "Oyunlar" sekmesindeki "Takvim" sekmesinde listelenir: tarih, saat, başlık ve — bu denetimde eklendi — **konum** bilgisi (varsa, başlığın yanında gösterilir). "Not", "Bitiş Saati" ve "Tür" alanları şu an hiçbir yerde gösterilmiyor (bkz. §7.4); "Öne Çıkar" anahtarının da bir etkisi yok, sıralama girdiğiniz sıraya göredir.

### Vitrin ve Duyurular (`/admin/videos`)
Anasayfanın en üstündeki büyük görsel/video alanını (hero) besler. Bu bölüm en çok soru işareti içeren yerdi, tek tek:
- **Aktif / Pasif, Sıra:** Çalışıyor.
- **Yayın Planı (Başlangıç/Bitiş tarihi):** Çalışıyor — belirttiğiniz tarih aralığı dışındaki videolar otomatik gösterilmiyor.
- **Oynatma Süresi / Kaç Kez Oynatılacak:** Bu denetimde **düzeltildi**. Daha önce "kaç kez oynatılacak" alanı hiç okunmuyordu; artık bir video, ayarladığınız sayı kadar döngü tamamlamadan bir sonrakine geçilmiyor.
- **Öne Çıkar + Gösterim Sıklığı:** Bu denetimde **düzeltildi**. Daha önce bu iki alan kaydediliyordu ama anasayfa bunları hiç okumuyordu (eski bir bileşen bu mantığı doğru yapıyordu ama artık kullanılmıyordu). Artık öne çıkardığınız bir video, belirttiğiniz sıklıkta ("her 3 videoda 1" gibi) gerçekten daha sık gösteriliyor.
- **Özel İçerik Kullan + Başlık/Alt Başlık/Açıklama:** Bu denetimde **düzeltildi**. Anahtar kapalıyken artık video kendi başlığını göstermiyor, anahtarı açtığınızda gösteriyor (önceden anahtarın hiçbir etkisi yoktu).
- **İlan Tıklama Davranışı (buton, ikincil buton):** Çalışıyor — hero'daki "Keşfet" / ikinci buton metni ve tıklanınca gidilecek yer (bölüme kaydır, sayfa aç, WhatsApp aç, mesaj formunu aç) doğru işliyor.
- **Silme:** Hem veritabanından hem Cloudflare'den siliniyor, doğrulandı — depolama alanı boşa harcanmıyor.
- **Rastgele Sırala (Site Ayarları'ndaki "Hero Video Ayarları"):** Bu denetimde **düzeltildi**, artık gerçekten karıştırıyor.
- **"Tıklayarak Sonraki Video":** Henüz siteye bağlı değil (panelde açıkça uyarı var) — anasayfada video alanına tıklamak zaten o videonun kendi butonunu tetikliyor, bu ayarı bağlamak o davranışla çakışacağından bilinçli olarak eklenmedi. İleri/geri okları anasayfada zaten mevcut.

### Programlar (`/admin/services`)
`/egitimler` listesini ve anasayfadaki "Eğitimler" bölümünü besler: başlık, açıklama, görsel, yaş grubu, süre — hepsi görünüyor. **İkon** alanı bu denetimde `/egitimler` kartlarına eklendi (önceden kaydediliyor ama hiç gösterilmiyordu). Pasif yapılan bir program artık panelin kendi listesinden kaybolmuyor (§7.1).

### Neler Yaptık? (`/admin/impact`)
Anasayfadaki "Neler Yaptık?" bölümünü besler: başlık, giriş metni, görsel ve sayaçlar (12 Oyun, 350+ Öğrenci gibi). Bu denetimde, sayaç rakamlarının panelde **okunaksız (açık yeşil, neredeyse görünmez)** göründüğü bulundu ve düzeltildi.

### Mesaj Kutusu (`/admin/appointments`)
Site içindeki "Bize Yazın" formundan (`Inquiry` kaydı) gelen talepleri listeler — İletişim/randevu sistemi değil, sadece mesaj kutusu (isim eski bir özellikten kalma). Bu denetimde **mobilde bir mesaja dokunduğunuzda hiçbir şey açılmıyordu** hatası bulundu ve düzeltildi: artık mobilde mesaj detayı tam ekran açılıyor, geri okuyla listeye dönülüyor. WhatsApp'tan onay/yanıt gönderme, durum değiştirme, not ekleme hepsi çalışıyor.

### Bizden Haberler (`/admin/blog`)
`/haberler` listesini, detay sayfasını ve anasayfadaki "Bizden Haberler" ile "Yaklaşan Oyunlar" (kategori adında "oyun/etkinlik" geçen yazılar) bölümlerini besler. Bu denetimde **video** ve **etiketler** alanları eklendi: artık haber detay sayfasında YouTube veya yüklenen video gösteriliyor, listelerde etiketler küçük rozet olarak görünüyor (önceden ikisi de kaydediliyor ama hiç gösterilmiyordu).

### Galeri ve Bizden Kareler (`/admin/gallery`)
Anasayfadaki "Bizden Kareler" bölümünü ve `/bizden-kareler` sayfasını besler — **üçü de aynı veriyi okur**, yani panelde gördüğünüz albüm/fotoğraf listesi, sitede gösterilenle her zaman birebir aynıdır. Bir öğeyi "öne çıkar" yaparsanız anasayfada daha sık görünür. Eğer panel boşsa ama sitede hâlâ eski fotoğraflar görünüyorsa, tarayıcı önbelleğini temizleyip yeniden deneyin; kod tarafında bir tutarsızlık kalmadı.

### Ekip (`/admin/team`)
`/ekibimiz` sayfasını ve anasayfadaki "Ekibimiz" bölümünü besler. Bu denetimde **biyografi, e-posta, telefon** alanları eklendi: `/ekibimiz`'de artık her kişinin kartında biyografi "devamını oku" ile açılıyor, e-posta/telefon tıklanabilir link olarak görünüyor (önceden üçü de kaydediliyor ama hiç gösterilmiyordu).

### İletişim Bilgileri (`/admin/contact`)
Telefon, e-posta, adres — anasayfa ve `/iletisim`'de görünür; adres tıklanınca haritayı açar. **Harita URL'si** girerseniz o linki kullanır (Google'ın otomatik arama linki yerine). Bu denetimde **çalışma saatleri** alanı `/iletisim` sayfasına eklendi (önceden kaydediliyor ama hiç gösterilmiyordu).

### Hakkımızda (`/admin/about`)
`/hakkimizda` sayfasını besler: başlık, metin, misyon, vizyon, değerler. Bu denetimde, sayfada görünen **görseli değiştirebileceğiniz bir alan panelde hiç yoktu** — eklendi.

### Yorumlar (`/admin/testimonials`)
Anasayfanın alt kısmındaki dönen alıntı kutusunu ve tüm yorumlar modalını besler: isim, unvan, yorum metni, yıldız. **Fotoğraf** ve **video URL'si** alanları kaydediliyor ama hiçbir yerde gösterilmiyor — bilinçli olarak öyle bırakıldı (mevcut tasarım sade bir alıntı kutusu; foto/video eklemek ayrı bir tasarım kararı gerektirir, bu denetimin kapsamı dışında tutuldu).

### Instagram (`/admin/instagram`)
"Instagram'dan Çek" ile son gönderileri çeker, anasayfadaki telefon önizleme akışına ("Bizden Kareler" karışımına) dahil eder. Çalışıyor.

### Footer Ayarları (`/admin/footer`)
**Bu denetimde tamamen sitesiz kaldığı bulunup düzeltildi.** Panelde "Telif Hakkı Metni" ve "Yasal Linkler" (Gizlilik Politikası vb.) alanları vardı ama bunları okuyan hazır bir footer bileşeni hiçbir sayfaya bağlanmamıştı — site kendi footer'ını sabit metinle basıyordu. Artık site footer'ı gerçekten bu ayarları okuyor: telif metniniz alt bilgide görünüyor, eklediğiniz her "Yasal Link" footer'da bir buton olarak çıkıyor ve tıklanınca içeriği bir pencerede açıyor.

### Site Ayarları (`/admin/settings`)
Bu sayfa birçok farklı şeyi bir arada topluyor, tek tek:
- **Logo:** Çalışıyor, tüm sitede görünür.
- **Kartvizit Modu:** Çalışıyor — açtığınızda anasayfa yerine tek sayfalık basit bir kartvizit gösterilir.
- **Site Adı / Başlığı / Açıklaması / Footer Metni:** **Henüz siteye bağlı değil** (panelde artık bunu belirten bir not var). Tarayıcı sekmesi başlığı ve arama motoru açıklaması kasıtlı olarak site kodunda sabit tutuluyor — güvenilirlik için. Footer Metni ise "Footer Ayarları" sayfasındaki "Telif Hakkı Metni" ile aynı işi yapan, artık kullanılmayan eski bir alan; alt bilgiyi değiştirmek için **Footer Ayarları**'nı kullanın.
- **Renk Ayarları (Ana Renk/İkincil Renk):** **Sadece bu panelin kendi gold/navy tonlarını değiştirir**, ziyaretçilerin gördüğü site kendi sabit renk paletini kullanır (panelde artık bunu belirten bir not var).
- **Sosyal Medya Linkleri (Instagram/YouTube):** Instagram linki artık footer'daki Instagram ikonuna bağlı. YouTube alanı şu an hiçbir yerde kullanılmıyor.
- **Sayfa Bölümleri Yönetimi (görünürlük/sıra):** **Henüz siteye bağlı değil** (panelde artık bunu belirten bir uyarı var). Anasayfa tek ekrana sığacak özel bir tasarımla (sabit CSS grid) kodlandığından, bölüm gizleme/sıralama güvenle eklenmeden önce o tasarımın ayrıca uyarlanması gerekiyor — ileride ayrı bir iş olarak ele alınmalı.
- **Hero Video Ayarları → Rastgele Sırala:** Düzeltildi, çalışıyor (yukarıya bakın). **Tıklayarak Sonraki Video:** Bilinçli olarak bağlanmadı (yukarıya bakın).
- **E-posta Bildirimleri:** Çalışıyor.

### Profil (`/admin/profile`)
Ad ve şifre değişikliği — sorunsuz çalışıyor, siteyle ilgisi yok (sadece giriş bilgileriniz).

---

## 3. Bu Denetimde Bulunup Düzeltilen Hatalar (Özet Liste)

1. **Sayfa ilk açıldığında yanlış/örnek içerik anlık görünmesi** ("Bir Nefes Dede Korkut" gibi) — artık gerçek veri gelene kadar boş/soluk bir yer tutucu gösteriliyor, hazır içerik hiç görünmüyor.
2. **Vitrin ve Duyurular düzenleme penceresinde yazıların okunamaması** (koyu lacivert zemin üzerinde koyu yazı) — düzeltildi, aynı hata panelin başka 11 sayfasındaki silme onay pencerelerinde de vardı (Mesaj Kutusu, Instagram dahil), hepsi tek bir CSS düzeltmesiyle birlikte çözüldü.
3. **Öne Çıkar / Gösinim Sıklığı / Özel İçerik Kullan / Kaç Kez Oynatılacak / Rastgele Sırala** hero video ayarları — hiçbiri anasayfaya bağlı değildi, hepsi düzeltildi.
4. **Silme işlemleri Cloudflare depolamayı boşaltmıyor muydu?** — Programlar, Ekip, Yorumlar, Bizden Haberler ve Site Ayarları'ndaki (logo/favicon/Neler Yaptık görseli) tüm görsel/video silme ve değiştirme işlemleri artık eski dosyayı Cloudflare'den de siliyor. Galeri ve Vitrin zaten doğru yapıyordu.
5. **Pasif yapılan kayıtlar panelden kayboluyordu** (Programlar, Ekip, Yorumlar, Hakkımızda) — artık pasif kayıtlar panelde görünmeye devam ediyor, istediğinizde tekrar aktif yapabiliyorsunuz.
6. **Mobilde Mesaj Kutusu'nda mesaja dokununca hiçbir şey açılmıyordu** — düzeltildi.
7. **Footer Ayarları sayfası tamamen etkisizdi** — artık gerçek site footer'ına bağlı.
8. **Hakkımızda sayfasının görseli panelden değiştirilemiyordu** — eklendi.
9. **Kaydedilip hiç gösterilmeyen alanlar** (Programlar: ikon; Ekip: biyografi/e-posta/telefon; Bizden Haberler: video/etiketler; İletişim: çalışma saatleri; Takvim: konum) — sitede gösterilecek şekilde bağlandı.
10. **Neler Yaptık panelindeki sayaç rakamlarının okunamaması** (açık yeşil/beyaz üstünde) — düzeltildi.

## 4. Bilinçli Olarak Dokunulmayanlar / İleride Yapılabilecekler

- **Sayfa Bölümleri Yönetimi (görünürlük/sıra):** Anasayfanın "tek ekrana sığan" özel tasarımı yüzünden riskli; ayrı bir iş olarak ele alınmalı.
- **Site Adı/Başlığı/Açıklaması → SEO meta bilgileri:** Şu an kodda sabit ve iyi durumda; panelden değiştirilebilir hale getirmek istenirse, boş/zayıf içerik girildiğinde SEO'nun bozulmaması için ayrı bir güvenlik önlemi (varsayılana geri dönme) ile yapılmalı.
- **Yorumlar'daki fotoğraf/video alanları:** Şu an sade tasarım tercih edildiği için gösterilmiyor; istenirse eklenebilir.
- **`components/Footer.tsx`, `components/Navbar.tsx`, `components/VideoCarousel.tsx` dosyaları:** Kod tabanında duruyor ama hiçbir sayfa tarafından kullanılmıyor (eski tasarımlardan kalma). Karışıklığı önlemek için silinmeleri önerilir; bu oturumda güvenlik izinleri nedeniyle silinemedi, isterseniz elle silinebilir veya bir sonraki oturumda benden isteyebilirsiniz.

---

*Bu kılavuz `KULLANIM_KILAVUZU.md` olarak proje kök dizinine eklendi; içerik değiştikçe güncellenmesi önerilir.*
