-- ==============================================================================
-- KAMU İLAN MERKEZİ - 004 Structured Fields & Full-Text Search RPC
-- ==============================================================================

-- 1. Structured KPSS, Yaş, Öğrenim Alanları
ALTER TABLE public.job_posts ADD COLUMN IF NOT EXISTS min_kpss_score NUMERIC(5,2);
ALTER TABLE public.job_posts ADD COLUMN IF NOT EXISTS kpss_score_type TEXT;
ALTER TABLE public.job_posts ADD COLUMN IF NOT EXISTS max_age INT;
ALTER TABLE public.job_posts ADD COLUMN IF NOT EXISTS education_levels TEXT[];

-- 2. Full-Text Search Vector Generated Column
ALTER TABLE public.job_posts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(institution, '') || ' ' || coalesce(city, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_job_posts_search_vector ON public.job_posts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_job_posts_title_trgm ON public.job_posts USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_job_posts_inst_trgm ON public.job_posts USING GIN (institution gin_trgm_ops);

-- 3. search_jobs RPC Function (FTS + Trigram + Filter + Pagination)
CREATE OR REPLACE FUNCTION public.search_jobs(
    query_text TEXT DEFAULT '',
    filter_post_type TEXT DEFAULT NULL,
    filter_city TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    source_id INT,
    title TEXT,
    institution TEXT,
    city TEXT,
    post_type TEXT,
    category TEXT,
    position_count INT,
    published_at DATE,
    deadline_at DATE,
    original_url TEXT,
    description TEXT,
    is_active BOOLEAN,
    min_kpss_score NUMERIC(5,2),
    kpss_score_type TEXT,
    max_age INT,
    education_levels TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.source_id,
        j.title,
        j.institution,
        j.city,
        j.post_type,
        j.category,
        j.position_count,
        j.published_at,
        j.deadline_at,
        j.original_url,
        j.description,
        j.is_active,
        j.min_kpss_score,
        j.kpss_score_type,
        j.max_age,
        j.education_levels,
        CASE 
            WHEN query_text IS NOT NULL AND query_text <> '' 
            THEN ts_rank(j.search_vector, websearch_to_tsquery('simple', query_text))
            ELSE 1.0::REAL
        END AS rank
    FROM public.job_posts j
    WHERE j.is_active = TRUE
      AND (
          query_text IS NULL OR query_text = '' 
          OR j.search_vector @@ websearch_to_tsquery('simple', query_text)
          OR j.title ILIKE '%' || query_text || '%'
          OR j.institution ILIKE '%' || query_text || '%'
      )
      AND (filter_post_type IS NULL OR filter_post_type = 'all' OR j.post_type = filter_post_type)
      AND (filter_city IS NULL OR j.city ILIKE '%' || filter_city || '%')
      AND (filter_category IS NULL OR filter_category = 'all' OR j.category = filter_category)
    ORDER BY rank DESC, j.published_at DESC NULLS LAST, j.id DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;
