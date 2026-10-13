# 🏛️ Kamu İlan Merkezi

Türkiye'deki kamu personeli ve memur alım ilanlarını 6 resmi kaynaktan (Kariyer Kapısı, İlan.gov.tr, SBB Kamu İlan, İŞKUR, T.C. Resmî Gazete, Yerel Yönetimler) otomatik olarak toplayan, normalize eden, SHA-256 ile tekilleştiren ve sıfır maliyetli (0 TL) serverless mimaride yayınlayan modern kamu ilan takip platformu.

---

## 🏗️ Teknoloji Mimarisi

- **Veritabanı & API**: [Supabase](https://supabase.com) (PostgreSQL 15, PostgREST otomatik REST API, Row Level Security, GIN Türkçe metin indeksi).
- **Scraper Motoru**: Python 3.12+ (`httpx`, `beautifulsoup4`, `playwright`, `pdfplumber`, `supabase`).
- **Zamanlanmış Görevler**: GitHub Actions Cron iş akışları (Ücretsiz kota).
- **Frontend**: Next.js 14 (`output: 'export'`), TypeScript, Tailwind CSS, TanStack Query, Zustand, Lucide Icons.
- **Yayınlama**: GitHub Pages (Statik CDN, sıfır sunucu maliyeti).

---

## 📁 Proje Klasör Yapısı

```
kamu-ilan-merkezi/
├── .github/
│   └── workflows/
│       ├── scrape-kariyer-kapisi.yml   # 2 saatte bir
│       ├── scrape-ilan-gov.yml          # Saatte bir
│       ├── scrape-kamu-ilan-sbb.yml     # Saatte bir
│       ├── scrape-iskur.yml             # Günde 3 kez
│       ├── scrape-resmi-gazete.yml      # Her gün 08:30
│       ├── scrape-yerel-yonetimler.yml  # 3 saatte bir
│       └── deploy-pages.yml             # Frontend build & GitHub Pages deploy
│
├── scraper/                             # Python Scraper Modülleri
│   ├── base.py                         # Soyut BaseScraper & loglama
│   ├── deduplicator.py                 # SHA-256 url & content parmak izi
│   ├── normalizer.py                   # Şehir, tarih, kadro sayısı temizleyici
│   ├── categorizer.py                  # Kadro türü ve kategori sınıflandırıcı
│   ├── pdf_parser.py                   # PDF metin & tarih çıkarıcı
│   ├── kariyer_kapisi.py               # CBİKO Kariyer Kapısı
│   ├── ilan_gov.py                     # BİK İlan.gov.tr
│   ├── kamu_ilan_sbb.py                # SBB Kamu İlan Portalı
│   ├── iskur.py                        # İŞKUR Kamu İlanları
│   ├── resmi_gazete.py                 # Resmî Gazete Çeşitli İlanlar
│   ├── yerel_yonetimler.py             # Yerel Yönetimler ve Belediyeler
│   └── requirements.txt
│
├── frontend/                            # Next.js Statik Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Ana Sayfa (Feed, Filtreleme, Sayaçlar)
│   │   │   ├── jobs/[id]/page.tsx      # İlan Detay Sayfası (CSR)
│   │   │   └── admin/page.tsx          # Sistem & Scraper Log Paneli
│   │   ├── components/                 # Modüler UI Bileşenleri
│   │   ├── lib/                        # Supabase istemcisi & yardımcılar
│   │   └── hooks/                      # Zustand & TanStack Query hookları
│   ├── next.config.mjs                 # output: 'export' konfigürasyonu
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql      # Tablolar, indeksler, RLS ve tohum veriler
```

---

## 🚀 Kurulum Adımları

### 1. Supabase Veritabanı Kurulumu
1. [supabase.com](https://supabase.com) adresinde yeni bir proje oluşturun.
2. Sol menüden **SQL Editor** sekmesine gidin.
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini yapıştırıp **RUN** butonuna tıklayın.
4. **Project Settings -> API** bölümünden şu anahtarları alın:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### 2. GitHub Secrets Tanımlama
GitHub reponuzun **Settings -> Secrets and variables -> Actions** bölümüne gidin ve şu gizli anahtarları ekleyin:
- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_KEY`: Supabase service_role key

### 3. Frontend'i Yerelde Çalıştırma
```bash
cd frontend
npm install
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### 4. Scraper'ları Yerelde Test Etme
```bash
cd scraper
pip install -r requirements.txt
python test_core.py            # Çekirdek testleri çalıştırır
python kariyer_kapisi.py       # Kariyer Kapısı scraper'ını test eder
```

---

## 🔒 Güvenlik (Row Level Security - RLS)
- Ziyaretçiler ve frontend: Sadece `SELECT` (okuma) yapabilir.
- Scraper'lar ve GitHub Actions: Sadece gizli `service_role` anahtarı ile `INSERT/UPDATE` yapabilir.
- Kamu verileri hiçbir zaman yetkisiz kişilerce değiştirilemez.
