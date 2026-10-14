import { createClient } from "@supabase/supabase-js";
import { JobPost, Source, ScrapeLog, FilterState } from "@/types";
import { detectKpssType, detectEducationLevel, fuzzyTurkishMatch, isJobPublishedToday } from "@/lib/jobParser";
import { getJobApplicationStatus, sanitizePositionCount, cleanInstitution } from "@/lib/utils";
export { trackUniqueVisitor, getCachedVisitorCount as fetchUniqueVisitorCount } from "@/lib/visitor";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock / Demo verileri (Supabase URL girilmeden önce veya çevrimdışı önizlemede kullanılır)
export const MOCK_SOURCES: Source[] = [
  { id: 1, name: "Kariyer Kapısı (CBİKO)", slug: "kariyer-kapisi", base_url: "https://kariyerkapisi.cbiko.gov.tr", scraper_type: "playwright", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 2, name: "İşe Alım Kariyer Kapısı (e-Devlet)", slug: "isealim-kariyerkapisi", base_url: "https://isealimkariyerkapisi.cbiko.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 3, name: "Kamu İlan (SBB / DPB)", slug: "kamu-ilan-sbb", base_url: "https://kamuilan.sbb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 4, name: "İlan.gov.tr (BİK)", slug: "ilan-gov", base_url: "https://www.ilan.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 5, name: "İŞKUR Kamu İlanları", slug: "iskur", base_url: "https://www.iskur.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 6, name: "T.C. Resmî Gazete", slug: "resmi-gazete", base_url: "https://www.resmigazete.gov.tr", scraper_type: "pdf", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 7, name: "Yerel Yönetimler Portalı", slug: "yerel-yonetimler", base_url: "https://yerelyonetimler.csb.gov.tr", scraper_type: "playwright", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 8, name: "Millî Savunma Bakanlığı (MSB PERTEM)", slug: "msb-pertem", base_url: "https://personeltemin.msb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 9, name: "Adalet Bakanlığı (PGM)", slug: "adalet-bakanligi", base_url: "https://pgm.adalet.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 10, name: "T.C. İçişleri Bakanlığı", slug: "icisleri-bakanligi", base_url: "https://www.icisleri.gov.tr/personel", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 11, name: "ÖSYM (KPSS Tercih & Yerleştirme)", slug: "osym", base_url: "https://www.osym.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 12, name: "Sağlık Bakanlığı (YHGM)", slug: "saglik-yhgm", base_url: "https://yhgm.saglik.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 13, name: "Millî Eğitim Bakanlığı (MEB PGM)", slug: "meb-pgm", base_url: "https://personel.meb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 14, name: "Polis Akademisi Başkanlığı (EGM)", slug: "polis-akademisi", base_url: "https://pa.edu.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 15, name: "Jandarma ve Sahil Güvenlik (JSGA PTM)", slug: "jandarma-ptm", base_url: "https://vatandas.jandarma.gov.tr/ptm/giris", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 16, name: "Sahil Güvenlik Komutanlığı", slug: "sahil-guvenlik", base_url: "https://www.sg.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 17, name: "Diyanet İşleri Başkanlığı (DİBBYS)", slug: "diyanet", base_url: "https://sinav.diyanet.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 18, name: "Aile ve Sosyal Hizmetler Bakanlığı (PGM)", slug: "aile-bakanligi", base_url: "https://aile.gov.tr/pgm", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 19, name: "TÜBİTAK Kariyer", slug: "tubitak-kariyer", base_url: "https://kariyer.tubitak.gov.tr", scraper_type: "playwright", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 20, name: "Gelir İdaresi Başkanlığı (GİB)", slug: "gib", base_url: "https://www.gib.gov.tr/kurumsal/duyurular", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 21, name: "Dışişleri Bakanlığı", slug: "disisleri-mfa", base_url: "https://www.mfa.gov.tr/duyurular.tr.mfa", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 22, name: "Vakıflar Genel Müdürlüğü (VGM)", slug: "vakiflar-vgm", base_url: "https://www.vgm.gov.tr/duyurular", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 23, name: "Göç İdaresi Başkanlığı", slug: "goc-idaresi", base_url: "https://www.goc.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 24, name: "Tarım ve Orman Bakanlığı (PERGEM & OGM)", slug: "tarim-orman", base_url: "https://www.tarimorman.gov.tr/PERGEM", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 25, name: "Ticaret Bakanlığı (Personel GM)", slug: "ticaret-bakanligi", base_url: "https://personel.ticaret.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 26, name: "Çalışma ve Sosyal Güvenlik Bakanlığı", slug: "csgb", base_url: "https://www.csgb.gov.tr/duyurular", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 27, name: "Ulaştırma ve Altyapı Bakanlığı", slug: "uab", base_url: "https://www.uab.gov.tr/duyurular", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 28, name: "Sanayi ve Teknoloji Bakanlığı", slug: "sanayi-bakanligi", base_url: "https://www.sanayi.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 29, name: "Hazine ve Maliye Bakanlığı (HMB)", slug: "hmb", base_url: "https://www.hmb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 30, name: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", slug: "csb", base_url: "https://csb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 31, name: "Kültür ve Turizm Bakanlığı (KTB)", slug: "ktb", base_url: "https://www.ktb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 32, name: "Gençlik ve Spor Bakanlığı (GSB)", slug: "gsb", base_url: "https://gsb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 33, name: "Sosyal Güvenlik Kurumu (SGK)", slug: "sgk", base_url: "https://www.sgk.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 34, name: "AFAD Başkanlığı", slug: "afad", base_url: "https://www.afad.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 35, name: "TCDD & Demiryolları", slug: "tcdd", base_url: "https://www.tcdd.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 36, name: "YÖK & Devlet Üniversiteleri Akademik Kadroları", slug: "yok-akademik", base_url: "https://akademik.yok.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 37, name: "Türkiye Belediyeler Birliği & Büyükşehirler", slug: "tbb-belediyeler", base_url: "https://www.tbb.gov.tr", scraper_type: "http", is_active: true, scrape_interval_minutes: 5, last_scraped_at: new Date().toISOString(), created_at: new Date().toISOString() },
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
  },
  {
    id: 481,
    source_id: 6,
    title: "Rize Belediyesi Sözleşmeli Personel Alım İptal İlanı (Gıda, Ziraat, Jeoloji Mühendisi ve Tekniker)",
    institution: "Rize Belediyesi",
    city: "Rize",
    district: null,
    post_type: "sozlesmeli",
    category: "muhendislik",
    position_count: null,
    published_at: "2026-09-29",
    deadline_at: null,
    original_url: "https://yerelyonetimler.csb.gov.tr/rize-belediyesi-ilk-defa-sozlesmeli-personel-gida-muhendisi-alim-iptal-ilani-duyuru-477955",
    url_hash: "05bb7cfbc609d09ed404eb1a68d6ba337a20fa1fb212d5eabc21777cbba65931",
    content_hash: "1bcb24bdbfc490b18fcdcac1725ac4891aa3ba0c0788150cb745a0dfe13c2432",
    description: "Rize Belediyesi bünyesinde istihdam edilmek üzere açılan Sözleşmeli Personel (Gıda Mühendisi, Ziraat Mühendisi, Jeoloji Mühendisi ve Tekniker) Alım İptal İlanı.",
    raw_content: "Rize Belediyesi İlk Defa Sözleşmeli Personel Gıda Mühendisi Alım İptal İlanı. RİZE BELEDİYESİ İLK DEFA SÖZLEŞMELİ PERSONEL ( Gıda Mühendisi ) ALIM İPTAL İLANI...",
    is_active: true,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources: MOCK_SOURCES[5],
  }
];

export function deduplicateJobs(jobs: JobPost[]): JobPost[] {
  const seen = new Set<string>();
  const result: JobPost[] = [];
  for (const job of jobs) {
    const urlKey = job.original_url ? job.original_url.trim().toLowerCase() : "";
    const titleKey = `${(job.institution || "").trim().toLowerCase()}_${job.title.trim().toLowerCase()}`;
    
    if (urlKey && seen.has(urlKey)) continue;
    if (seen.has(titleKey)) continue;
    
    if (urlKey) seen.add(urlKey);
    seen.add(titleKey);
    result.push(job);
  }
  return result;
}

export async function fetchJobPosts(rawFilters: Partial<FilterState> = {}): Promise<{ data: JobPost[]; count: number }> {
  const filters: FilterState = {
    searchQuery: rawFilters.searchQuery || "",
    city: rawFilters.city || "",
    postType: rawFilters.postType || "",
    category: rawFilters.category || "",
    sourceSlug: rawFilters.sourceSlug || "",
    onlyActive: rawFilters.onlyActive !== undefined ? rawFilters.onlyActive : true,
    page: rawFilters.page || 1,
    sortBy: rawFilters.sortBy || "published_desc",
    kpssType: rawFilters.kpssType,
    educationLevel: rawFilters.educationLevel,
    onlyUrgent: rawFilters.onlyUrgent,
    onlyToday: rawFilters.onlyToday,
    pageSize: rawFilters.pageSize || 12,
  };
  const hasDerivedFilters = Boolean(filters.kpssType || filters.educationLevel || filters.onlyUrgent);
  const pageSize = filters.pageSize || 12;
  const page = filters.page;

  if (supabase) {
    try {
      let query = supabase
        .from("job_posts")
        .select("*, sources(name, slug)", { count: "exact" });

      if (filters.onlyActive) {
        query = query.eq("is_active", true);
      }

      if (filters.city) {
        query = query.ilike("city", filters.city);
      }

      if (filters.postType) {
        query = query.eq("post_type", filters.postType);
      }

      if (filters.category && filters.category !== "buro") {
        query = query.eq("category", filters.category);
      }

      if (filters.sourceSlug) {
        const matchedSource = MOCK_SOURCES.find((s) => s.slug === filters.sourceSlug);
        if (matchedSource) {
          query = query.eq("source_id", matchedSource.id);
        }
      }

      // Dinamik Sıralama
      switch (filters.sortBy) {
        case "deadline_asc":
          query = query.order("deadline_at", { ascending: true, nullsFirst: false }).order("id", { ascending: true });
          break;
        case "published_desc":
          query = query.order("published_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
        case "position_desc":
          query = query.order("position_count", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
        case "title_asc":
          query = query.order("title", { ascending: true }).order("id", { ascending: false });
          break;
        case "title_desc":
          query = query.order("title", { ascending: false }).order("id", { ascending: false });
          break;
        case "deadline_desc":
          query = query.order("deadline_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
        case "published_desc":
        default:
          query = query.order("published_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
          break;
      }

      // İlanları çekip otomatik tekilleştirmeden geçiriyoruz
      const { data, error } = await query.limit(500);
      if (!error && data) {
        let filtered = deduplicateJobs(data as JobPost[]);

        if (filters.category === "buro") {
          filtered = filtered.filter((j) => j.category === "buro" || fuzzyTurkishMatch(j, "büro"));
        }

        if (filters.searchQuery) {
          filtered = filtered.filter((j) => fuzzyTurkishMatch(j, filters.searchQuery));
        }

        if (filters.kpssType) {
          filtered = filtered.filter((j) => detectKpssType(j).type === filters.kpssType);
        }

        if (filters.educationLevel) {
          filtered = filtered.filter((j) => detectEducationLevel(j).level === filters.educationLevel);
        }

        if (filters.onlyUrgent) {
          filtered = filtered.filter((j) => {
            const status = getJobApplicationStatus(j.published_at, j.deadline_at, j.title);
            return status.type === "urgent";
          });
        }

        if (filters.onlyToday) {
          filtered = filtered.filter((j) => isJobPublishedToday(j));
        }

        const count = filtered.length;
        const from = (page - 1) * pageSize;
        const pageData = filtered.slice(from, from + pageSize);
        return { data: pageData, count };
      }
    } catch (err) {
      console.warn("Supabase fetch hatası, mock veriye dönülüyor:", err);
    }
  }

  // Mock Filtreleme Motoru
  let filtered = deduplicateJobs([...MOCK_JOBS]);

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
    if (filters.category === "buro") {
      filtered = filtered.filter((j) => j.category === "buro" || fuzzyTurkishMatch(j, "büro"));
    } else {
      filtered = filtered.filter((j) => j.category === filters.category);
    }
  }

  if (filters.sourceSlug) {
    filtered = filtered.filter(
      (j) =>
        j.sources?.slug === filters.sourceSlug ||
        (j.source_id && MOCK_SOURCES.find((s) => s.id === j.source_id)?.slug === filters.sourceSlug)
    );
  }

  if (filters.searchQuery) {
    filtered = filtered.filter((j) => fuzzyTurkishMatch(j, filters.searchQuery));
  }

  if (filters.kpssType) {
    filtered = filtered.filter((j) => detectKpssType(j).type === filters.kpssType);
  }

  if (filters.educationLevel) {
    filtered = filtered.filter((j) => detectEducationLevel(j).level === filters.educationLevel);
  }

  if (filters.onlyUrgent) {
    filtered = filtered.filter((j) => {
      const status = getJobApplicationStatus(j.published_at, j.deadline_at, j.title);
      return status.type === "urgent";
    });
  }

  if (filters.onlyToday) {
    filtered = filtered.filter((j) => isJobPublishedToday(j));
  }

  if (filters.sortBy === "position_desc") {
    filtered.sort((a, b) => (b.position_count || 0) - (a.position_count || 0));
  }

  const count = filtered.length;
  const from = (page - 1) * pageSize;
  const pageData = filtered.slice(from, from + pageSize);

  return {
    data: pageData,
    count,
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

  return MOCK_JOBS.find((j) => j.id === numericId) || null;
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

export async function fetchAllActiveJobPosts(): Promise<JobPost[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*, sources(name, slug)")
        .eq("is_active", true)
        .order("deadline_at", { ascending: true, nullsFirst: false })
        .limit(1000);
      if (!error && data) {
        return data as JobPost[];
      }
    } catch (err) {
      console.warn("Tüm aktif ilanlar çekilemedi:", err);
    }
  }
  return MOCK_JOBS;
}

export async function fetchCityJobCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("city")
        .eq("is_active", true);
      if (!error && data) {
        for (const row of data) {
          const city = row.city || "Tüm Türkiye";
          counts[city] = (counts[city] || 0) + 1;
        }
        return counts;
      }
    } catch (e) {
      console.warn("Şehir sayaçları alınamadı:", e);
    }
  }

  for (const job of MOCK_JOBS) {
    const city = job.city || "Tüm Türkiye";
    counts[city] = (counts[city] || 0) + 1;
  }
  return counts;
}

export interface EmploymentReportData {
  totalActiveJobs: number;
  totalPositions: number;
  urgentJobsCount: number;
  totalInstitutions: number;
  topInstitutions: { name: string; count: number; positions: number }[];
  categoryDistribution: { key: string; label: string; count: number; percentage: number }[];
  postTypeDistribution: { key: string; label: string; count: number; percentage: number }[];
  topCities: { city: string; count: number }[];
  allJobs: JobPost[];
}

export async function fetchEmploymentStats(): Promise<EmploymentReportData> {
  let jobs: JobPost[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .eq("is_active", true)
        .range(0, 4999);
      if (!error && data) {
        jobs = data as JobPost[];
      }
    } catch (e) {
      console.warn("İstihdam raporu verileri alınamadı:", e);
    }
  }

  if (jobs.length === 0) {
    jobs = MOCK_JOBS;
  }

  jobs = deduplicateJobs(jobs);

  const totalActiveJobs = jobs.length;
  let totalPositions = 0;
  let urgentJobsCount = 0;

  const instMap: Record<string, { count: number; positions: number }> = {};
  const catMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};
  const cityMap: Record<string, number> = {};

  for (const j of jobs) {
    const pCount = sanitizePositionCount(j.position_count);
    totalPositions += pCount;

    const st = getJobApplicationStatus(j.published_at, j.deadline_at, j.title);
    if (st.type === "urgent") {
      urgentJobsCount++;
    }

    const inst = cleanInstitution(j.institution, j.title, j.city, j.original_url).trim();
    if (!instMap[inst]) instMap[inst] = { count: 0, positions: 0 };
    instMap[inst].count++;
    instMap[inst].positions += pCount;

    const cat = j.category || "diger";
    catMap[cat] = (catMap[cat] || 0) + 1;

    const pType = j.post_type || "diger";
    typeMap[pType] = (typeMap[pType] || 0) + 1;

    if (j.city && j.city !== "Tüm Türkiye") {
      cityMap[j.city] = (cityMap[j.city] || 0) + 1;
    }
  }

  const topInstitutions = Object.entries(instMap)
    .map(([name, val]) => ({ name, count: val.count, positions: val.positions }))
    .sort((a, b) => b.positions - a.positions || b.count - a.count)
    .slice(0, 5);

  const CAT_NAMES: Record<string, string> = {
    buro: "Büro & Memur",
    bilisim: "Bilişim & Yazılım",
    saglik: "Sağlık & Tıp",
    egitim: "Eğitim & Akademi",
    muhendislik: "Mühendislik & Teknik",
    hukuk: "Hukuk & Adalet",
    maliye: "Maliye & Finans",
    diger: "Genel / Diğer",
  };

  const TYPE_NAMES: Record<string, string> = {
    memur: "Memur",
    sozlesmeli: "Sözleşmeli Personel",
    isci: "Sürekli / Geçici İşçi",
    akademik: "Akademik Personel",
    diger: "Genel Kadrolar",
  };

  const categoryDistribution = Object.entries(catMap)
    .map(([key, count]) => ({
      key,
      label: CAT_NAMES[key] || key,
      count,
      percentage: totalActiveJobs > 0 ? Math.round((count / totalActiveJobs) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const postTypeDistribution = Object.entries(typeMap)
    .map(([key, count]) => ({
      key,
      label: TYPE_NAMES[key] || key,
      count,
      percentage: totalActiveJobs > 0 ? Math.round((count / totalActiveJobs) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topCities = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalActiveJobs,
    totalPositions,
    urgentJobsCount,
    totalInstitutions: Object.keys(instMap).length,
    topInstitutions,
    categoryDistribution,
    postTypeDistribution,
    topCities,
    allJobs: jobs,
  };
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
        .neq("slug", "visitor-counter")
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


