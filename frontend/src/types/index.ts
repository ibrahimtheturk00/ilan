export type PostType = 'memur' | 'isci' | 'akademik' | 'sozlesmeli' | 'diger';
export type CategoryType = 'bilisim' | 'saglik' | 'egitim' | 'muhendislik' | 'hukuk' | 'maliye' | 'buro' | 'diger';

export interface Source {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  scraper_type: 'http' | 'playwright' | 'pdf';
  is_active: boolean;
  scrape_interval_minutes: number;
  last_scraped_at: string | null;
  created_at: string;
}

export interface JobPost {
  id: number;
  source_id: number | null;
  title: string;
  institution: string | null;
  city: string | null;
  district: string | null;
  post_type: PostType | null;
  category: CategoryType | null;
  position_count: number | null;
  published_at: string | null;
  deadline_at: string | null;
  original_url: string;
  url_hash: string;
  content_hash: string | null;
  description: string | null;
  raw_content: string | null;
  is_active: boolean;
  scraped_at: string;
  updated_at: string;
  sources?: Source;
}

export interface ScrapeLog {
  id: number;
  source_id: number;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'success' | 'partial' | 'failed';
  posts_found: number;
  posts_new: number;
  posts_updated: number;
  error_message: string | null;
  github_run_id: string | null;
  sources?: Source;
}

export type SortOption =
  | "deadline_asc"   // Son gün yaklaşanlar önce (kalan gün azalan)
  | "deadline_desc"  // Son gün uzak olanlar önce
  | "published_desc" // En yeni eklenenler önce
  | "title_asc"      // İlan Başlığı (A'dan Z'ye)
  | "title_desc"     // İlan Başlığı (Z'den A'ya)
  | "position_desc"; // Kontenjan Sayısı (Çoktan aza)

export interface FilterState {
  searchQuery: string;
  city: string;
  postType: string;
  category: string;
  sourceSlug: string;
  onlyActive: boolean;
  page: number;
  sortBy?: SortOption;
  kpssType?: string;
  educationLevel?: string;
  onlyUrgent?: boolean;
  onlyToday?: boolean;
}

export type JobFilters = FilterState;

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}
