-- ==============================================================================
-- KAMU İLAN MERKEZİ - Supabase Complete Setup & Schema Script
-- PostgreSQL 15+ (Supabase Standard)
-- ==============================================================================

-- 0. SCHEMA AYARI (Varsayılan public şemasına zorlar)
SET search_path = public, pg_catalog;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. SOURCES (Kaynak Siteler)
CREATE TABLE IF NOT EXISTS public.sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    scraper_type TEXT NOT NULL CHECK (scraper_type IN ('http', 'playwright', 'pdf')),
    is_active BOOLEAN DEFAULT TRUE,
    scrape_interval_minutes INT DEFAULT 60,
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB POSTS (Normalize İlanlar)
CREATE TABLE IF NOT EXISTS public.job_posts (
    id BIGSERIAL PRIMARY KEY,
    source_id INT REFERENCES public.sources(id) ON DELETE SET NULL,
    -- Normalize Alanlar
    title TEXT NOT NULL,
    institution TEXT,
    city TEXT,
    district TEXT,
    post_type TEXT CHECK (post_type IN ('memur', 'isci', 'akademik', 'sozlesmeli', 'diger')),
    category TEXT CHECK (category IN ('bilisim', 'saglik', 'egitim', 'muhendislik', 'hukuk', 'maliye', 'diger')),
    position_count INT,
    published_at DATE,
    deadline_at DATE,
    -- Kaynak Veriler
    original_url TEXT NOT NULL,
    url_hash TEXT NOT NULL UNIQUE, -- sha256(original_url)
    content_hash TEXT,             -- sha256(title + institution + deadline)
    description TEXT,
    raw_content TEXT,
    -- Meta
    is_active BOOLEAN DEFAULT TRUE,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_job_posts_source ON public.job_posts (source_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_city ON public.job_posts (city);
CREATE INDEX IF NOT EXISTS idx_job_posts_type ON public.job_posts (post_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_category ON public.job_posts (category);
CREATE INDEX IF NOT EXISTS idx_job_posts_deadline ON public.job_posts (deadline_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_job_posts_published ON public.job_posts (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_job_posts_active ON public.job_posts (is_active);

-- Metin Arama İndeksi (GIN - 'simple' evrensel ve Türkçe karakter uyumludur)
CREATE INDEX IF NOT EXISTS idx_job_posts_search ON public.job_posts USING GIN (
    to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(institution, '') || ' ' || COALESCE(description, ''))
);

-- 4. SCRAPE LOGS (Tarama Kayıtları)
CREATE TABLE IF NOT EXISTS public.scrape_logs (
    id BIGSERIAL PRIMARY KEY,
    source_id INT REFERENCES public.sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('running', 'success', 'partial', 'failed')),
    posts_found INT DEFAULT 0,
    posts_new INT DEFAULT 0,
    posts_updated INT DEFAULT 0,
    error_message TEXT,
    github_run_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_scrape_logs_source ON public.scrape_logs (source_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_started ON public.scrape_logs (started_at DESC);

-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_logs ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (Public Read)
DROP POLICY IF EXISTS "Public read sources" ON public.sources;
CREATE POLICY "Public read sources" ON public.sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read job_posts" ON public.job_posts;
CREATE POLICY "Public read job_posts" ON public.job_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read scrape_logs" ON public.scrape_logs;
CREATE POLICY "Public read scrape_logs" ON public.scrape_logs FOR SELECT USING (true);

-- Service Role (GitHub Actions & Scraper Engine) yazabilir
DROP POLICY IF EXISTS "Service write sources" ON public.sources;
CREATE POLICY "Service write sources" ON public.sources FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service write job_posts" ON public.job_posts;
CREATE POLICY "Service write job_posts" ON public.job_posts FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service write scrape_logs" ON public.scrape_logs;
CREATE POLICY "Service write scrape_logs" ON public.scrape_logs FOR ALL USING (auth.role() = 'service_role');

-- 6. VARSAYILAN KAYNAKLAR (Seed Data)
INSERT INTO public.sources (id, name, slug, base_url, scraper_type, is_active, scrape_interval_minutes)
VALUES
    (1, 'Kariyer Kapısı (CBİKO)', 'kariyer-kapisi', 'https://kariyerkapisi.cbiko.gov.tr', 'playwright', TRUE, 120),
    (2, 'İlan.gov.tr (BİK)', 'ilan-gov', 'https://www.ilan.gov.tr', 'http', TRUE, 60),
    (3, 'Kamu İlan (SBB)', 'kamu-ilan-sbb', 'https://kamuilan.sbb.gov.tr', 'http', TRUE, 60),
    (4, 'İŞKUR Kamu İlanları', 'iskur', 'https://www.iskur.gov.tr', 'http', TRUE, 360),
    (5, 'T.C. Resmî Gazete', 'resmi-gazete', 'https://www.resmigazete.gov.tr', 'pdf', TRUE, 1440),
    (6, 'Yerel Yönetimler Portalı', 'yerel-yonetimler', 'https://yerelyonetimler.csb.gov.tr', 'playwright', TRUE, 180)
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name,
    base_url = EXCLUDED.base_url,
    scraper_type = EXCLUDED.scraper_type,
    scrape_interval_minutes = EXCLUDED.scrape_interval_minutes;

-- Sequence güncelleme (ID çakışmasını önlemek için)
SELECT setval(pg_get_serial_sequence('public.sources', 'id'), COALESCE((SELECT MAX(id) FROM public.sources), 1), true);
