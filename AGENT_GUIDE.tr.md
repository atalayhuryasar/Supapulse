# 🤖 Supapulse Yapay Zeka (AI Agent) Kurulum ve Entegrasyon Rehberi

> **Yapay Zeka ile Geliştirme Yapanlar İçin:** Aşağıdaki hazır istemleri (prompt) çalıştığınız AI asistanına (**Cursor, Windsurf, Claude Code, GitHub Copilot, Antigravity, v0, Bolt**) yapıştırarak hem projenizi Supapulse'a bağlayabilir hem de hiç kod yazmadan Supapulse'ı kendi sunucunuza kurabilirsiniz.

---

## ⚡ İstem 1: Mevcut Projenizi Supapulse'a Bağlayın

Mevcut projenizin kod tabanında bu istemi çalıştırarak AI asistanınızın güvenlikli heartbeat RPC fonksiyonunu kurmasını ve bağlantı bilgilerini getirmesini sağlayın.

### 📋 Cursor / Claude / Windsurf İçin Kopyala-Yapıştır İstem:

```text
Sen uzman bir full-stack mühendisi ve Supabase uzmanısın.
Görevin, bu depoyu Supapulse (açık kaynaklı Supabase keep-alive motoru) tarafından 7/24 izlenebilecek ve hiçbir zaman uyku moduna girmeyecek şekilde hazırlamaktır.

Şu adımları eksiksiz uygula:

1. Supabase veritabanında (Supabase CLI, migration dosyası veya SQL editörü ile) şu izole, sıfır veri yetkili heartbeat RPC fonksiyonunu oluştur:

CREATE OR REPLACE FUNCTION public.supapulse_heartbeat()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'pulse_ok';
$$;

GRANT EXECUTE ON FUNCTION public.supapulse_heartbeat() TO anon, authenticated;

2. Projedeki yerel ortam değişkenlerini (`.env`, `.env.local`, `.env.development` veya Supabase konfigürasyonunu) incele:
   - Proje URL'ini bul (`NEXT_PUBLIC_SUPABASE_URL` vb.).
   - Anon Public Key bilgisini bul (`NEXT_PUBLIC_SUPABASE_ANON_KEY` veya `sb_publishable_...`).
   - ASLA `SUPABASE_SERVICE_ROLE_KEY` gizli anahtarını paylaşma veya dokunma (bu anahtar her zaman gizli kalmalıdır).

3. Bana şu formatta temiz bir özet sun:
   - Supapulse Durumu: Bağlantıya hazır
   - Proje Adı: [Proje Adı]
   - Supabase URL: [Bulunan URL]
   - Anon Public Key: [Bulunan Anon Key]
   - Sonraki Adım: Bu değerleri kopyalayıp Supapulse paneline (https://supapulse.huryasar.com) yapıştırarak günlük otomatik nabız takibini başlatabilirsiniz!
```

---

## 🚀 İstem 2: Sıfır Kod Bilgisiyle Supapulse'ı Kendi Hesabınıza Kurun (Self-Host)

Otonom terminal veya kodlama agent'larına (**Claude Code, Antigravity, Cursor Agent, Terminal Agent'ları**) bu istemi vererek Vercel ve Supabase üzerinde sıfırdan çalışan bir Supapulse örneği kurdurabilirsiniz.

### 📋 Otonom Agent'lar İçin Kopyala-Yapıştır İstem:

```text
Sen otonom bir DevOps ve bulut dağıtım mühendisisi.
Görevin, benim için Vercel ve Supabase üzerinde açık kaynaklı Supapulse (Supabase keep-alive aracı) projesini sıfırdan kurup canlıya almaktır.

Şu uygulama planını sırayla gerçekleştir:

1. Depo Kurulumu:
   - Eğer depoda değilsen klonla: `git clone https://github.com/atalayhuryasar/Supapulse.git` ve klasöre gir: `cd Supapulse`.
   - Bağımlılıkları yükle: `npm install`.

2. Supabase Veritabanı Kurulumu:
   - Benim Supabase projeme eriş (Supabase CLI, Management API veya SQL Editor ile).
   - `supabase_schema.sql` dosyasındaki tüm şemayı çalıştır.
   - `projects` ve `ping_logs` tablolarının, RLS politikalarının, tetikleyicilerin ve `GRANT ... TO service_role, authenticated` yetkilerinin uygulandığından emin ol.

3. Çevre Değişkenleri & Güvenlik:
   - `CRON_SECRET` için rastgele güvenli bir anahtar üret (örn. `openssl rand -hex 24`).
   - `.env.local` ve Vercel Proje Değişkenlerini tanımla:
     - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Proje URL'im
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Anahtarım
     - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Gizli Anahtarım (Arka plan cron işçisi için zorunludur)
     - `CRON_SECRET`: Üretilen gizli anahtar
     - `NEXT_PUBLIC_SITE_URL`: Canlı alan adı (veya yerel test için localhost)

4. Doğrulama ve Canlıya Alma:
   - Derleme testini çalıştır: `npm run build`.
   - Vercel CLI ile canlıya deploy et: `vercel --prod` (ortam değişkenlerinin Production ortamına eklendiğinden emin ol).
   - Vercel Cron işinin (`/api/cron/ping` - günlük `0 4 * * *`) aktif olduğunu doğrula.

5. Bana şu bilgilerle rapor ver:
   - Canlı Yayınlanan URL
   - Veritabanı ve Cron İşçisinin Durumu
   - Panele gidip ilk projemi nasıl ekleyeceğime dair kısa yönlendirme!
```
