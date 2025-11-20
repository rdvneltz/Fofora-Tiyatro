# Randevu Sistemi - Detaylı İşleyiş

## 📋 Sistem Özeti

Mürekkep Hukuk web sitesinde tam otomatik WhatsApp entegreli randevu yönetim sistemi.

## 🔄 İşleyiş Akışı

### 1. Müşteri Randevu Talebi Oluşturur

**Adımlar:**
1. Anasayfada "Randevu Al" butonuna tıklar
2. Modal açılır ve şu bilgileri girer:
   - Ad Soyad
   - Telefon (WhatsApp için)
   - E-posta (opsiyonel)
   - Tarih (sadece müsait günler gösterilir)
   - Saat (sadece müsait saatler gösterilir)
   - Görüşme platformu: WhatsApp / Telegram / Zoom / Site
   - Not (opsiyonel)

3. "Randevu Talebi Oluştur" butonuna tıklar
4. Sistem randevuyu `pending` (bekliyor) statüsüyle kaydeder

### 2. Admin Panelde Randevu Görünür

**Randevu Kartında Gösterilen Bilgiler:**
- ✅ Müşteri bilgileri (ad, telefon, email)
- 📅 Tarih ve saat
- 📱 Seçilen platform (WhatsApp/Telegram/Zoom/Site)
- 🔗 Meeting linki (Zoom/Telegram/Site için)
- 📝 Notlar
- ⚡ Durum rozeti (Bekliyor/Onaylandı/İptal/Tamamlandı)
- ✓ Bildirim durumu (Gönderildi mi?)
- ⏰ Hatırlatma durumu

### 3. Admin Randevuyu Onaylar

**Admin "Onayla" Butonuna Tıklar:**

1. **Sistem otomatik şunları yapar:**
   - Randevu durumunu `approved` olarak günceller
   - WhatsApp onay mesajı oluşturur
   - WhatsApp Web'i yeni sekmede açar (mesaj otomatik yazılmış)
   - Admin Enter'a basarak mesajı gönderir

2. **WhatsApp Onay Mesajı İçeriği:**
```
✅ Randevunuz Onaylandı

Sayın [Ad Soyad],

Mürekkep Hukuk Bürosu randevunuz onaylanmıştır.

📅 Tarih: [Gün, Tarih]
🕐 Saat: [Saat]
📹 Zoom üzerinden
🔗 Link: [Zoom Linki]

Randevunuzdan 30 dakika önce size hatırlatma mesajı göndereceğiz.

_Mürekkep Hukuk - Adaletin Kalemi_
```

3. **Meeting Link Yönetimi:**
   - Zoom/Telegram/Site seçildiyse, admin link ekleyebilir
   - Linki düzenle butonuyla güncelleme yapılabilir
   - Link mesajda otomatik gösterilir

### 4. Hatırlatma Sistemi

**Görüşmeden 30 Dakika Önce:**

Admin "Hatırlatma Gönder" butonuna tıklar:
1. Sistem hatırlatma mesajı oluşturur
2. WhatsApp Web açılır
3. Hatırlatma durumu `reminderSent: true` olur

**Hatırlatma Mesajı:**
```
⏰ Randevu Hatırlatması

Sayın [Ad Soyad],

30 dakika sonra randevunuz var!

🕐 Saat: [Saat]
📹 Zoom Bağlantısı:
[Link]

Görüşmek üzere!

_Mürekkep Hukuk - Adaletin Kalemi_
```

### 5. Randevu İptali

**Admin "İptal Et" Butonuna Tıklar:**

1. Randevu durumu `cancelled` olur
2. İptal bildirimi WhatsApp'tan gider:

```
❌ Randevu İptali

Sayın [Ad Soyad],

[Tarih] tarihli, saat [Saat] randevunuz iptal edilmiştir.

Yeni bir randevu oluşturmak için web sitemizi ziyaret edebilirsiniz:
🌐 https://murekkephukuk.vercel.app

_Mürekkep Hukuk - Adaletin Kalemi_
```

### 6. Tarih/Saat Değişikliği

**Admin Randevuyu Günceller:**

1. Sistem eski tarih/saati saklar (`previousDate`, `previousTime`)
2. Yeni tarih/saat güncellenir
3. Manuel olarak "Tekrar Bildir" butonu kullanılır
4. Değişiklik mesajı gider:

```
🔄 Randevu Değişikliği

Sayın [Ad Soyad],

Randevunuzda değişiklik yapılmıştır:

❌ Eski Randevu:
📅 [Eski Tarih]
🕐 [Eski Saat]

✅ Yeni Randevu:
📅 [Yeni Tarih]
🕐 [Yeni Saat]

_Mürekkep Hukuk - Adaletin Kalemi_
```

## 🔧 Admin Panel Özellikleri

### Randevu Kartında Butonlar:

**Bekliyor (Pending) Durumunda:**
- ✅ **Onayla ve WhatsApp Gönder** - Onaylar ve bildirim açar
- ❌ **İptal Et ve Bildir** - İptal eder ve bildirim açar
- 🗑️ **Sil** - Randevuyu siler

**Onaylandı (Approved) Durumunda:**
- ✓ **Tamamlandı İşaretle** - Completed statüsüne alır
- 🔔 **Hatırlatma Gönder** - 30 dakika öncesi hatırlatma (bir kez)
- 💬 **Onay Mesajını Tekrar Gönder** - Tekrar bildirim açar
- ✏️ **Linki Düzenle** - Meeting linkini güncelle
- 🗑️ **Sil** - Randevuyu siler

### Filtreleme:
- Tümü
- Bekliyor
- Onaylandı
- İptal Edildi
- Tamamlandı

## 📱 Platform Bazlı Özellikler

### WhatsApp:
- Arama üzerinden görüşme
- Link gerekmez
- Bildirimler WhatsApp Web üzerinden

### Telegram:
- Kullanıcı adı veya grup linki eklenir
- Admin panelde görünür

### Zoom:
- Admin Zoom meeting oluşturur
- Linki randevuya ekler
- Link WhatsApp mesajında paylaşılır

### Site Üzerinden:
- Özel görüşme linki oluşturulur
- Link WhatsApp'ta paylaşılır

## 🔔 Bildirim Sistemi

### WhatsApp Entegrasyonu

**Mevcut Çözüm (Manuel):**
- Sistem WhatsApp Web linki oluşturur
- Link tıklandığında WhatsApp Web açılır
- Mesaj otomatik yazılmış olur
- Admin Enter'a basarak gönderir

**Gelecek Geliştirme (Otomatik):**
- WhatsApp Business API entegrasyonu
- Twilio WhatsApp API
- Tam otomatik mesaj gönderimi
- Toplu bildirim sistemi

### Bildirim Durumu Takibi

- `notificationSent`: Onay/iptal bildirimi gönderildi mi?
- `reminderSent`: Hatırlatma gönderildi mi?
- UI'da yeşil/sarı rozetlerle gösterilir

## 🎨 UI/UX İyileştirmeleri

### Dropdown Menü Fix:
- **Sorun:** Tarih dropdown'u beyaz yazı + beyaz arka plan
- **Çözüm:** Navy arka plan ve beyaz yazı

### Responsive Tasarım:
- Mobil uyumlu kartlar
- Grid layout (1-2-3 sütun)
- Touch-friendly butonlar

### Durum Renkleri:
- 🟡 Bekliyor: Sarı
- 🟢 Onaylandı: Yeşil
- 🔴 İptal: Kırmızı
- 🔵 Tamamlandı: Mavi

## 📊 Veritabanı Şeması

```prisma
model Appointment {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  phone           String
  email           String?
  date            DateTime
  time            String
  meetingPlatform String   // whatsapp, telegram, zoom, site
  meetingLink     String?  // Generated Zoom/Telegram/Site meeting link
  status          String   @default("pending") // pending, approved, cancelled, completed
  notes           String?
  notificationSent Boolean @default(false) // Status change notification sent
  reminderSent    Boolean @default(false) // 30-min reminder sent
  previousDate    DateTime? // For tracking changes
  previousTime    String?   // For tracking changes
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🚀 Kullanım Senaryoları

### Senaryo 1: Normal Randevu İşleyişi
1. Müşteri randevu talebi oluşturur (WhatsApp, 15 Ocak 14:00)
2. Admin panelde gösterilir
3. Admin Zoom meeting oluşturur: https://zoom.us/j/123456789
4. Linki randevuya ekler
5. "Onayla" butonuna tıklar
6. WhatsApp Web açılır, onay mesajı Zoom linki ile hazır
7. Admin Enter'a basarak gönderir
8. 14 Ocak 13:30'da hatırlatma gönderir
9. Görüşme gerçekleşir
10. "Tamamlandı" işaretler

### Senaryo 2: Randevu Değişikliği
1. Müşteri 15 Ocak 14:00'a randevu aldı
2. Admin onayladı, bildirim gitti
3. Müşteri 16 Ocak 10:00'a almak istedi
4. Admin randevuyu düzenler (tarih/saat değişir)
5. "Tekrar Bildir" butonuna tıklar
6. Değişiklik mesajı WhatsApp'ta açılır (eski-yeni karşılaştırmalı)
7. Admin gönderir

### Senaryo 3: İptal
1. Müşteri randevuyu iptal etmek istedi
2. Admin "İptal Et" butonuna tıklar
3. İptal mesajı WhatsApp'ta açılır
4. Admin gönderir
5. Randevu "İptal Edildi" statüsüne geçer

## 📝 Notlar

- Tüm tarihler Türkçe formatında gösterilir
- WhatsApp numaraları otomatik formatlanır (0555 → 90555)
- Meeting linkleri canlı tıklanabilir
- Bildirim durumu görsel olarak takip edilebilir
- Hatırlatma butonu bir kez kullanıldıktan sonra kaybolur

## 🔮 Gelecek Geliştirmeler

1. **Otomatik Hatırlatma:**
   - Cron job ile 30 dakika öncesi kontrol
   - Vercel Cron Jobs kullanımı

2. **WhatsApp Business API:**
   - Tam otomatik mesaj gönderimi
   - Toplu bildirimler
   - Template mesajlar

3. **Zoom API Entegrasyonu:**
   - Otomatik meeting oluşturma
   - Randevu onayında otomatik link

4. **Calendar Sync:**
   - Google Calendar entegrasyonu
   - iCal export/import

5. **Email Bildirimleri:**
   - Email adresi varsa alternatif bildirim

6. **SMS Bildirimleri:**
   - Twilio SMS API
   - Yedek bildirim kanalı
