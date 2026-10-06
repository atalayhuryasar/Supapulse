# Supapulse — Supabase Keep-Alive Tool ⚡

Supapulse, Supabase ücretsiz katman projelerinizin **7 günlük inaktivite nedeniyle duraklatılmasını (pause)** otomatik olarak engelleyen açık kaynaklı bir SaaS & Keep-Alive aracıdır.

---

## 🎯 Özellikler

- **Günlük Otomatik Nabız (Daily Pings):** Her gün saat 04:00 UTC'de projelerinize otomatik ping atarak veritabanı motorunu kesintisiz canlı tutar.
- **Doğrudan PostgreSQL Sorgusu (PostgREST):** Sadece yüzeysel endpoint'ler değil; hedef tablolar üzerinden gerçek `SELECT ... LIMIT 1` sorgusu çalıştırarak Supabase'in 7 günlük duraklatma sayacını sıfırlar.
- **İsteğe Bağlı Özel Hedef Tablo (Target Table):** Projenizdeki özel bir tabloyu (`todos`, `products`, `profiles` vb.) belirtebilir veya Supapulse'ın popüler tabloları otomatik keşfetmesini sağlayabilirsiniz.
- **Çok Katmanlı Güvenlik Ağı (Fallback):** Hedef tablo bulunamasa bile REST Gateway (`OPTIONS /rest/v1/`), GraphQL (`POST /graphql/v1`) ve Auth motoru üzerinden API ağ geçidine resmi trafik kaydettirir.
- **Tek Tıkla Manuel Test ("Ping Now"):** Projenizin anlık durumunu, yanıt süresini ve HTTP kodunu panelden test edebilme.
- **Şeffaf ve Güvenli:** Sadece projenizin **Anon Public Key** bilgisi saklanır. Gizli `service_role` anahtarınız asla istenmez veya saklanmaz.
- **Supabase Auth:** GitHub OAuth ve E-posta (Magic Link) ile hızlı giriş.
- **Vercel Cron:** Ek sunucu maliyeti olmadan sıfır maliyetli altyapı (`vercel.json`).

---

## 🛠️ Nasıl Çalışır? (Çok Katmanlı Ping Stratejisi)

Supabase, ücretsiz projeleri uyku moduna alırken **veritabanı sorgularını (PostgreSQL)** ve **API Gateway trafiğini** inceler. Supapulse bu süreci 4 aşamalı kurşun geçirmez bir mimari ile garantiye alır:

### 🛡️ Katman 0: Özel Heartbeat RPC (Önerilen & Sıfır Veri İfşası)
Tablo adı paylaşmak istemiyor veya Row Level Security (RLS) kurallarıyla uğraşmak istemiyorsanız, Supabase Dashboard -> **SQL Editor** sekmesinde şu 1 satırlık fonksiyonu çalıştırın:

```sql
create or replace function public.supapulse_heartbeat()
returns text language sql security definer as $$ select 'pulse_ok'; $$;
grant execute on function public.supapulse_heartbeat() to anon, authenticated;
```

* **Neden En İdeal Yöntem?**
  * **Sıfır Tablo İfşası:** Hiçbir tablo adı veya kullanıcı verisi okunmaz.
  * **RLS Korumalı:** `SECURITY DEFINER` kullandığı için tablolardaki kilitli RLS politikalarından etkilenmez.
  * **Doğrudan PostgreSQL Çalıştırması:** PostgREST üzerinden `POST /rest/v1/rpc/supapulse_heartbeat` çağrısı yaparak PostgreSQL motorunun uyku sayacını %100 sıfırlar.

---

### 🤖 AI Agent İle Tek Tıkla Kurulum ve Canlıya Alma (Cursor, Windsurf, Claude)

Yapay zeka kodlama asistanlarıyla geliştirme yapıyor veya otonom bir ajanın sizin yerinize hiç kod yazmadan Supapulse'ı kurmasını istiyorsanız, detaylı istemlerin yer aldığı [AGENT_GUIDE.tr.md](AGENT_GUIDE.tr.md) rehberimizi inceleyin:
* **Hedef Proje Bağlantısı:** Heartbeat fonksiyonunu kurup public anahtarları otomatik listeler.
* **Sıfır Kodla Self-Host Kurulum:** Otonom agent'lara (Claude Code, Antigravity, Cursor Agent) Vercel + Supabase üzerinde sıfırdan canlı bir Supapulse örneği kurdurur.

> **Hızlı Proje Entegrasyon İstemi:**
> *"Supabase veritabanımı Supapulse keep-alive servisine hazırlamak için şu SQL'i çalıştır: `create or replace function public.supapulse_heartbeat() returns text language sql security definer as $$ select 'pulse_ok'; $$; grant execute on function public.supapulse_heartbeat() to anon, authenticated;` ve ardından bana proje URL ve Anon Public Key bilgilerimi ver."*

---

1. **Katman 1: Doğrudan Tablo Okuma (PostgREST):**
   * Kullanıcı bir tablo belirttiyse (örn. `profiles`), doğrudan o tabloya `GET /rest/v1/profiles?select=*&limit=1` isteği atılır.
   * Tablo belirtilmediyse en yaygın 15 tablo (`reservations`, `activities`, `profiles`, `users`, `todos`, `posts` vb.) paralel olarak taranır ve ilk yanıt veren tablo üzerinden gerçek SQL okuması gerçekleştirilir.
2. **Katman 2: API Gateway & GraphQL Yoklaması:**
   * Projede tablolar tamamen kilitliyse veya özel isimlere sahipse, Kong API Gateway'e `OPTIONS /rest/v1/` ve `POST /graphql/v1` çağrıları gönderilerek ağ geçidi seviyesinde meşru API trafiği kaydedilir.
3. **Katman 3: Kimlik Doğrulama Motoru (GoTrue):**
   * Son güvenlik katmanı olarak `/auth/v1/recover` ve `/auth/v1/health` uç noktaları tetiklenir.

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

Vercel'e deploy ederken projenize `CRON_SECRET` ortam değişkenini eklediğinizden emin olun. Vercel, `vercel.json` dosyasında tanımlanan schedule (`0 4 * * *`) uyarınca her gün `/api/cron/ping` endpoint'ini periyodik olarak güvenli bir şekilde tetikleyecektir.

---

## 🛡️ Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır.
