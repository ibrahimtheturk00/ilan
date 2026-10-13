import { createClient } from "@supabase/supabase-js";
import { JobPost, Source, ScrapeLog, FilterState } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock / Demo verileri (Supabase URL girilmeden önce veya çevrimdışı önizlemede kullanılır)
export const MOCK_SOURCES: Source[] = [
  { id: 1, name: "Kariyer Kapısı (CBİKO)", slug: "kariyer-kapisi", base_url: "https://kariyerkapisi.cbiko.gov.tr", scraper_type: "playwright", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 2, name: "İlan.gov.tr (BİK)", slug: "ilan-gov", base_url: "https://www.ilan.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 3, name: "Kamu İlan (SBB)", slug: "kamu-ilan-sbb", base_url: "https://kamuilan.sbb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 4, name: "İŞKUR Kamu İlanları", slug: "iskur", base_url: "https://www.iskur.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 5, name: "T.C. Resmî Gazete", slug: "resmi-gazete", base_url: "https://www.resmigazete.gov.tr", scraper_type: "pdf", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 6, name: "Yerel Yönetimler Portalı", slug: "yerel-yonetimler", base_url: "https://yerelyonetimler.csb.gov.tr", scraper_type: "playwright", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

export const MOCK_JOBS: JobPost[] = [
  {
    id: 1,
    source_id: 1,
    title: "TÜBİTAK BİLGEM 25 Yazılım ve Yapay Zeka Uzmanı Alım İlanı",
    institution: "TÜBİTAK BİLGEM",
    city: "Kocaeli",
    district: "Gebze",
    post_type: "sozlesmeli",
    category: "bilisim",
    position_count: 25,
    published_at: "2026-10-10",
    deadline_at: "2026-11-15",
    original_url: "https://kariyerkapisi.cbiko.gov.tr/announcement/1",
    url_hash: "mock1",
    content_hash: "mockcontent1",
    description: "TÜBİTAK Bilişim ve Bilgi Güvenliği İleri Teknolojiler Araştırma Merkezi bünyesinde istihdam edilmek üzere Python, Go, C++ ve Makine Öğrenmesi alanlarında tecrübeli 25 uzman araştırmacı personel alınacaktır. Başvurular Kariyer Kapısı üzerinden alınacaktır.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[0],
  },
  {
    id: 2,
    source_id: 2,
    title: "Sağlık Bakanlığı 15.000 Sözleşmeli Sağlık Personeli ve Hemşire Alımı",
    institution: "T.C. Sağlık Bakanlığı",
    city: "Ankara",
    district: null,
    post_type: "sozlesmeli",
    category: "saglik",
    position_count: 15000,
    published_at: "2026-10-12",
    deadline_at: "2026-11-28",
    original_url: "https://www.ilan.gov.tr/ilan/kategori/8/saglik-personeli",
    url_hash: "mock2",
    content_hash: "mockcontent2",
    description: "Sağlık Bakanlığı taşra teşkilatı hizmet birimlerinde istihdam edilmek üzere KPSS puan sıralaması esas alınarak 15.000 sözleşmeli personel alımı yapılacaktır. Tercihler ÖSYM üzerinden yapılacaktır.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[1],
  },
  {
    id: 3,
    source_id: 5,
    title: "İstanbul Teknik Üniversitesi (İTÜ) 18 Öğretim Üyesi Alım İlanı",
    institution: "İstanbul Teknik Üniversitesi",
    city: "İstanbul",
    district: "Sarıyer",
    post_type: "akademik",
    category: "egitim",
    position_count: 18,
    published_at: "2026-10-11",
    deadline_at: "2026-11-26",
    original_url: "https://www.resmigazete.gov.tr/ilanlar/itu-akademik.pdf",
    url_hash: "mock3",
    content_hash: "mockcontent3",
    description: "İTÜ Bilgisayar ve Bilişim Fakültesi ile Makine Fakültesi bölümlerine 2547 sayılı Yükseköğretim Kanunu uyarınca profesör, doçent ve doktor öğretim üyesi kadrolarına atama yapılacaktır.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[4],
  },
  {
    id: 4,
    source_id: 4,
    title: "Ankara Büyükşehir Belediyesi 50 Sürekli İşçi ve Şoför Alımı",
    institution: "Ankara Büyükşehir Belediyesi",
    city: "Ankara",
    district: null,
    post_type: "isci",
    category: "diger",
    position_count: 50,
    published_at: "2026-10-09",
    deadline_at: "2026-11-20",
    original_url: "https://www.iskur.gov.tr/baglantilar/kurum-disi-kamu-isci-alimi/abb-sofor.pdf",
    url_hash: "mock4",
    content_hash: "mockcontent4",
    description: "EGO Genel Müdürlüğü otobüs işletmesinde görevlendirilmek üzere E sınıfı sürücü belgesine sahip 50 daimi işçi statüsünde şoför istihdam edilecektir.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[3],
  },
  {
    id: 5,
    source_id: 3,
    title: "Hazine ve Maliye Bakanlığı 100 Defterdarlık Uzman Yardımcısı Giriş Sınavı",
    institution: "T.C. Hazine ve Maliye Bakanlığı",
    city: "Ankara",
    district: null,
    post_type: "memur",
    category: "maliye",
    position_count: 100,
    published_at: "2026-10-08",
    deadline_at: "2026-11-15",
    original_url: "https://kamuilan.sbb.gov.tr/ilan-105",
    url_hash: "mock5",
    content_hash: "mockcontent5",
    description: "Hazine ve Maliye Bakanlığı merkez teşkilatında istihdam edilmek üzere İktisat, İşletme ve Maliye mezunu 100 Defterdarlık Uzman Yardımcısı alınacaktır.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[2],
  },
  {
    id: 6,
    source_id: 6,
    title: "İzmir Büyükşehir Belediyesi 12 Avukat ve Hukuk Müşaviri Alımı",
    institution: "İzmir Büyükşehir Belediyesi",
    city: "İzmir",
    district: "Konak",
    post_type: "memur",
    category: "hukuk",
    position_count: 12,
    published_at: "2026-10-05",
    deadline_at: "2026-11-25",
    original_url: "https://yerelyonetimler.csb.gov.tr/duyurular/izmir-avukat",
    url_hash: "mock6",
    content_hash: "mockcontent6",
    description: "İzmir Büyükşehir Belediyesi Hukuk Müşavirliği bünyesinde görev alacak ruhsatlı ve baroya kayıtlı 12 avukat alınacaktır.",
    raw_content: null,
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[5],
  }
];

export async function fetchJobPosts(filters: FilterState): Promise<{ data: JobPost[]; count: number }> {
  if (supabase) {
    try {
      let query = supabase
        .from("job_posts")
        .select("*, sources(name, slug)", { count: "exact" });

      if (filters.onlyActive) {
        query = query.eq("is_active", true);
      }

      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.postType) {
        query = query.eq("post_type", filters.postType);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.searchQuery) {
        const term = `%${filters.searchQuery.trim()}%`;
        query = query.or(`title.ilike.${term},institution.ilike.${term},description.ilike.${term}`);
      }

      const pageSize = 12;
      const from = (filters.page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Dinamik Sıralama
      switch (filters.sortBy) {
        case "deadline_asc":
          // Başvuru süresi en az kalanlar / yaklaşanlar önce
          query = query.order("deadline_at", { ascending: true, nullsFirst: false }).order("id", { ascending: true });
          break;
        case "published_desc":
          // En yeni eklenen / yayınlanan ilanlar önce
          query = query.order("published_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
        case "title_asc":
          // A'dan Z'ye alfabetik
          query = query.order("title", { ascending: true }).order("id", { ascending: false });
          break;
        case "title_desc":
          // Z'den A'ya alfabetik
          query = query.order("title", { ascending: false }).order("id", { ascending: false });
          break;
        case "deadline_desc":
        default:
          // Varsayılan: Son başvuru tarihi ileri olanlar / güncel
          query = query.order("deadline_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
      }

      const { data, count, error } = await query.range(from, to);

      if (!error && data) {
        return { data: data as JobPost[], count: count || data.length };
      }
    } catch (err) {
      console.warn("Supabase fetch hatası, mock veriye dönülüyor:", err);
    }
  }

  // Mock Filtreleme Motoru
  let filtered = [...MOCK_JOBS];

  if (filters.onlyActive) {
    filtered = filtered.filter((j) => j.is_active);
  }

  if (filters.city) {
    filtered = filtered.filter((j) => j.city?.toLowerCase() === filters.city.toLowerCase());
  }

  if (filters.postType) {
    filtered = filtered.filter((j) => j.post_type === filters.postType);
  }

  if (filters.category) {
    filtered = filtered.filter((j) => j.category === filters.category);
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.institution?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
    );
  }

  return {
    data: filtered,
    count: filtered.length,
  };
}

export async function fetchJobById(id: number | string): Promise<JobPost | null> {
  const numericId = Number(id);
  if (supabase && !isNaN(numericId)) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*, sources(name, slug, base_url)")
        .eq("id", numericId)
        .single();
      if (!error && data) {
        return data as JobPost;
      }
    } catch (err) {
      console.warn("Supabase tekil ilan çekme hatası:", err);
    }
  }

  return MOCK_JOBS.find((j) => j.id === numericId) || MOCK_JOBS[0] || null;
}

export async function fetchJobsByIds(ids: number[]): Promise<JobPost[]> {
  if (ids.length === 0) return [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*, sources(name, slug)")
        .in("id", ids)
        .order("deadline_at", { ascending: true, nullsFirst: false });
      if (!error && data) {
        return data as JobPost[];
      }
    } catch (err) {
      console.warn("ID listesi ile ilan çekme hatası:", err);
    }
  }
  return MOCK_JOBS.filter((j) => ids.includes(j.id));
}

export async function fetchAllJobSummaries(): Promise<{ id: number; title: string; category: string | null; description: string | null }[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("id, title, category, description")
        .eq("is_active", true)
        .limit(1000);
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("Özet ilanlar çekilemedi:", err);
    }
  }
  return MOCK_JOBS.map((j) => ({
    id: j.id,
    title: j.title,
    category: j.category,
    description: j.description,
  }));
}



export async function fetchScrapeLogs(): Promise<ScrapeLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("scrape_logs")
        .select("*, sources(name, slug)")
        .order("started_at", { ascending: false })
        .limit(25);
      if (!error && data) {
        return data as ScrapeLog[];
      }
    } catch (err) {
      console.warn("Log çekme hatası:", err);
    }
  }

  // Mock Scrape Logs
  return [
    { id: 1, source_id: 1, started_at: new Date(Date.now() - 3600000).toISOString(), finished_at: new Date(Date.now() - 3500000).toISOString(), status: "success", posts_found: 25, posts_new: 4, posts_updated: 21, error_message: null, github_run_id: "run-9841", sources: MOCK_SOURCES[0] },
    { id: 2, source_id: 2, started_at: new Date(Date.now() - 7200000).toISOString(), finished_at: new Date(Date.now() - 7150000).toISOString(), status: "success", posts_found: 15, posts_new: 2, posts_updated: 13, error_message: null, github_run_id: "run-9840", sources: MOCK_SOURCES[1] },
    { id: 3, source_id: 5, started_at: new Date(Date.now() - 14400000).toISOString(), finished_at: new Date(Date.now() - 14320000).toISOString(), status: "success", posts_found: 8, posts_new: 1, posts_updated: 7, error_message: null, github_run_id: "run-9838", sources: MOCK_SOURCES[4] },
    { id: 4, source_id: 6, started_at: new Date(Date.now() - 21600000).toISOString(), finished_at: new Date(Date.now() - 21550000).toISOString(), status: "partial", posts_found: 6, posts_new: 0, posts_updated: 6, error_message: "Bağlantı zaman aşımı (Playwright fallback kullanıldı)", github_run_id: "run-9835", sources: MOCK_SOURCES[5] },
  ];
}

export async function fetchSources(): Promise<Source[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Source[];
      }
    } catch (err) {
      console.warn("Kaynakları çekme hatası:", err);
    }
  }
  return MOCK_SOURCES;
}

