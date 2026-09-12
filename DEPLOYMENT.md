# Fofora Tiyatro - Deployment Rehberi

## 🗄️ MongoDB Atlas Kurulumu

### 1. Hesap Oluştur
- https://www.mongodb.com/cloud/atlas/register adresine git
- Ücretsiz hesap oluştur veya giriş yap

### 2. Yeni Cluster Oluştur
- "Create" → "Deploy a cluster"
- **Shared (FREE)** seç
- Provider: AWS
- Region: Frankfurt (eu-central-1) veya Türkiye'ye yakın
- Cluster Name: `fofora-tiyatro`
- "Create Cluster" (2-3 dakika bekle)

### 3. Database User Oluştur
- Sol menü → **"Database Access"**
- "Add New Database User"
- Authentication: Password
- Username: `foforaadmin`
- Password: Güçlü bir şifre oluştur (KAYDET!)
- Privileges: "Read and write to any database"
- "Add User"

### 4. Network Access
- Sol menü → **"Network Access"**
- "Add IP Address"
- **"Allow Access from Anywhere"** (0.0.0.0/0)
- "Confirm"

### 5. Connection String Al
- "Database" → Cluster'ın yanında **"Connect"**
- "Connect your application"
- Driver: Node.js
- Connection string'i KOPYALA ve düzenle

**Örnek:**
```
mongodb+srv://foforaadmin:MyPassword123@cluster0.abc123.mongodb.net/foforatiyatro?retryWrites=true&w=majority
```

---

## 🚀 Vercel Deployment

### 1. GitHub Repository İzinleri
- https://github.com/settings/installations
- "Vercel" uygulamasını bul → "Configure"
- Repository access → `Fofora-Tiyatro` ekle → "Save"

### 2. Vercel'de Environment Variables
Deploy etmeden ÖNCE veya sonrasında ekle:

```
DATABASE_URL = mongodb+srv://foforaadmin:SİFREN@cluster0.xxxxx.mongodb.net/foforatiyatro?retryWrites=true&w=majority

NEXTAUTH_URL = https://your-project-name.vercel.app

NEXTAUTH_SECRET = NYppA9SXvEMtSZo+YXvxrHzvxl8oAk9Qwc61wSH6ieA=
```

### 3. Deploy & Seed
- Deploy tamamlandıktan sonra veritabanına veri yükle:
```bash
npm run seed
```

---

## Önizleme yayını (`/yeni`)

- Yeni ana sayfa: `https://www.foforatiyatro.com/yeni`
- Yönetim girişi: `https://www.foforatiyatro.com/yeni/admin`
- Eski ana site bu aşamada kaldırılmamalıdır.
- Vercel ortam değişkenlerine `.env.example` içindeki değerler eklenmelidir.
- İlk yayında `npx prisma db push` ve ardından `ADMIN_DEFAULT_PASSWORD` tanımlıyken `npm run seed` çalıştırılmalıdır.

## Admin güvenliği

Admin e-postası `admin@foforatiyatro.com` olarak oluşturulur. Sabit veya varsayılan şifre yoktur; güçlü `ADMIN_DEFAULT_PASSWORD` ortam değişkeni zorunludur. İlk girişten sonra Profil ekranından şifre değiştirilmelidir.
