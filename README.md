# Supapulse — Supabase Keep-Alive Tool ⚡

Supapulse, Supabase ücretsiz katman projelerinizin **7 günlük inaktivite nedeniyle duraklatılmasını (pause)** otomatik olarak engelleyen açık kaynaklı bir SaaS & Keep-Alive aracıdır.

---

## 🎯 Özellikler

- **Otomatik Arka Plan Pingleri:** Her 3 günde bir projelerinizin PostgREST uç noktasına (`/rest/v1/`) hafif `GET` istekleri atarak veritabanı bağlantı havuzunu uyanık tutar.
- **Tek Tıkla Manuel Test ("Ping Now"):** Projenizin anlık durumunu, yanıt süresini ve HTTP kodunu panelden test edebilme.
- **Şeffaf ve Güvenli:** Sadece projenizin **Anon Public Key** bilgisi saklanır. Gizli `service_role` anahtarınız asla istenmez veya saklanmaz.
- **Supabase Auth:** GitHub OAuth ve E-posta (Magic Link) ile hızlı giriş.
- **Vercel Cron:** Ek sunucu maliyeti olmadan sıfır maliyetli altyapı (`vercel.json`).

---

## 🚀 Kurulum & Çalıştırma (Self-Hosting)

### 1. Depoyu Klonlayın ve Bağımlılıkları Kurun

```bash
git clone https://github.com/kullanici/supapulse.git
cd supapulse
npm install
```

### 2. Supabase Veritabanını Hazırlayın

1. Yeni bir Supabase projesi oluşturun.
2. Supabase Dashboard -> **SQL Editor** sekmesine gidin.
3. Kök dizindeki [supabase_schema.sql](file:///Users/atalayhuryasar/Desktop/Supapulse/supabase_schema.sql) dosyasının içeriğini yapıştırıp çalıştırın (`Run`). Bu işlem `projects` ve `ping_logs` tabloları ile RLS politikalarını oluşturur.

### 3. Çevre Değişkenlerini Tanımlayın

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.example .env.local
```

Aşağıdaki değişkenleri doldurun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

CRON_SECRET=your-random-cron-secret-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## ⏱️ Vercel Üzerinde Cron Job Kurulumu

Vercel'e deploy ederken projenize `CRON_SECRET` ortam değişkenini eklediğinizden emin olun. Vercel, `vercel.json` dosyasında tanımlanan schedule (`0 0 */3 * *`) uyarınca `/api/cron/ping` endpoint'ini periyodik olarak güvenli bir şekilde tetikleyecektir.

---

## 🛡️ Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır.
