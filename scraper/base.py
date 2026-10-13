import os
import sys
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

# Yerel modüller
from normalizer import clean_text, normalize_city, parse_turkish_date, extract_position_count
from categorizer import categorize_job
from deduplicator import generate_url_hash, generate_content_hash

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

class BaseScraper(ABC):
    """
    Tüm scraper'lar için ortak temel sınıf.
    Supabase bağlantısı, loglama, normalizasyon ve mükerrer engelleme işlemlerini yönetir.
    """
    def __init__(self, source_slug: str):
        self.source_slug = source_slug
        self.logger = logging.getLogger(f"scraper.{source_slug}")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        self.github_run_id = os.getenv("GITHUB_RUN_ID")
        
        self.client = None
        self.source_id = None
        self.log_id = None
        
        self._init_supabase()

    def _init_supabase(self):
        """Supabase istemcisini başlatır, ortam değişkenleri yoksa dry-run moduna geçer."""
        if not self.supabase_url or not self.supabase_key:
            self.logger.warning("SUPABASE_URL veya SUPABASE_SERVICE_KEY bulunamadı! Scraper DRY-RUN modunda çalışacak.")
            return

        try:
            from supabase import create_client
            self.client = create_client(self.supabase_url, self.supabase_key)
            # Source ID'yi slug üzerinden getir
            res = self.client.table("sources").select("id, name, is_active").eq("slug", self.source_slug).execute()
            if res.data and len(res.data) > 0:
                self.source_id = res.data[0]["id"]
                if not res.data[0].get("is_active", True):
                    self.logger.warning(f"Kaynak '{self.source_slug}' pasif durumda! Yine de çalıştırılıyor.")
            else:
                self.logger.warning(f"Kaynak '{self.source_slug}' veritabanında bulunamadı. ID atanmayacak.")
        except Exception as e:
            self.logger.error(f"Supabase bağlantı hatası: {e}")
            self.client = None

    def start_log(self) -> Optional[int]:
        """Tarama başlangıcını scrape_logs tablosuna kaydeder."""
        if not self.client or not self.source_id:
            return None
        try:
            data = {
                "source_id": self.source_id,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "status": "running",
                "github_run_id": self.github_run_id
            }
            res = self.client.table("scrape_logs").insert(data).execute()
            if res.data:
                self.log_id = res.data[0]["id"]
                return self.log_id
        except Exception as e:
            self.logger.error(f"Başlangıç logu kaydedilemedi: {e}")
        return None

    def end_log(self, status: str, posts_found: int, posts_new: int, posts_updated: int, error_message: Optional[str] = None):
        """Tarama sonucunu ve metriklerini kaydeder."""
        # sources tablosunda last_scraped_at güncelle
        if self.client and self.source_id:
            try:
                self.client.table("sources").update({
                    "last_scraped_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", self.source_id).execute()
            except Exception as e:
                self.logger.error(f"Kaynak last_scraped_at güncellenemedi: {e}")

        if not self.client or not self.log_id:
            return
            
        try:
            update_data = {
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "status": status,
                "posts_found": posts_found,
                "posts_new": posts_new,
                "posts_updated": posts_updated,
                "error_message": error_message
            }
            self.client.table("scrape_logs").update(update_data).eq("id", self.log_id).execute()
        except Exception as e:
            self.logger.error(f"Bitiş logu güncellenemedi: {e}")

    def normalize_and_prepare_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ham ilan verisini normalize eder, kategorize eder ve hash üretir.
        """
        title = clean_text(raw_post.get("title", ""))
        institution = clean_text(raw_post.get("institution", ""))
        raw_description = raw_post.get("description", "")
        clean_desc = clean_text(raw_description)
        original_url = raw_post.get("original_url", "").strip()

        # Şehir tespiti
        city = raw_post.get("city")
        if not city:
            city = normalize_city(f"{title} {institution} {clean_desc}")

        # Tarihler
        published_at = parse_turkish_date(raw_post.get("published_at"))
        deadline_at = parse_turkish_date(raw_post.get("deadline_at"))

        # Kadro sayısı
        pos_count = raw_post.get("position_count")
        if pos_count is None:
            pos_count = extract_position_count(f"{title} {clean_desc}")

        # Sınıflandırma
        post_type = raw_post.get("post_type")
        category = raw_post.get("category")
        if not post_type or not category:
            detected_type, detected_cat = categorize_job(title, clean_desc)
            post_type = post_type or detected_type
            category = category or detected_cat

        # Hashler
        url_hash = generate_url_hash(original_url)
        content_hash = generate_content_hash(title, institution, deadline_at)

        return {
            "source_id": self.source_id,
            "title": title,
            "institution": institution,
            "city": city,
            "district": raw_post.get("district"),
            "post_type": post_type,
            "category": category,
            "position_count": pos_count,
            "published_at": published_at,
            "deadline_at": deadline_at,
            "original_url": original_url,
            "url_hash": url_hash,
            "content_hash": content_hash,
            "description": clean_desc,
            "raw_content": raw_post.get("raw_content") or raw_description,
            "is_active": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

    def save_posts(self, posts: List[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Normalize edilmiş ilanları mükerrerlikten arındırarak Supabase'e kaydeder.
        Aynı kurum, başlık ve son başvuru tarihine sahip ilanların mükerrer kayıt oluşturmasını engeller.
        """
        if not posts:
            return 0, 0

        if not self.client:
            self.logger.info(f"[DRY-RUN] {len(posts)} ilan hazırlandı ancak Supabase bağlantısı yok.")
            return len(posts), 0

        # 1. Kendi içindeki mükerrerleri temizle (aynı scrape partisindeki yinelenenler)
        unique_posts_dict = {}
        for p in posts:
            ch = p.get("content_hash") or p.get("url_hash")
            unique_posts_dict[ch] = p
        unique_posts = list(unique_posts_dict.values())

        # 2. Veritabanındaki mevcut ilanların content_hash ve url_hash haritasını çek
        try:
            existing_res = self.client.table("job_posts").select("id, url_hash, content_hash").execute()
            existing_data = existing_res.data or []
            existing_by_content = {r["content_hash"]: r["id"] for r in existing_data if r.get("content_hash")}
            existing_by_url = {r["url_hash"]: r["id"] for r in existing_data if r.get("url_hash")}
        except Exception as e:
            self.logger.warning(f"Mevcut ilanlar çekilemedi, standart upsert kullanılacak: {e}")
            existing_by_content = {}
            existing_by_url = {}

        posts_new = 0
        posts_updated = 0

        for p in unique_posts:
            ch = p.get("content_hash")
            uh = p.get("url_hash")
            existing_id = existing_by_content.get(ch) or existing_by_url.get(uh)

            try:
                if existing_id:
                    # Mevcut ilanı güncelle
                    self.client.table("job_posts").update(p).eq("id", existing_id).execute()
                    posts_updated += 1
                else:
                    # Yeni ilan ekle
                    res = self.client.table("job_posts").insert(p).execute()
                    if res.data:
                        new_id = res.data[0]["id"]
                        existing_by_content[ch] = new_id
                        existing_by_url[uh] = new_id
                        posts_new += 1
            except Exception as e:
                self.logger.error(f"İlan kaydetme hatası ('{p.get('title')}'): {e}")

        return posts_new, posts_updated

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Her scraper'ın kendi kaynak çekme mantığını uygulayacağı soyut metot.
        Döndürülecek her sözlük en azından şunları içermelidir:
        { 'title': str, 'original_url': str, 'institution': str, ... }
        """
        pass

    def run(self):
        """Tüm tarama döngüsünü yönetir."""
        self.logger.info(f"'{self.source_slug}' taraması başlatılıyor...")
        self.start_log()
        
        try:
            raw_posts = self.scrape()
            posts_found = len(raw_posts)
            self.logger.info(f"{posts_found} adet ham ilan çekildi.")
            
            normalized_posts = [self.normalize_and_prepare_post(p) for p in raw_posts if p.get("original_url")]
            posts_new, posts_updated = self.save_posts(normalized_posts)
            
            self.logger.info(f"Tarama başarıyla bitti. Yeni/Güncellenen: {posts_new}, Bulunan: {posts_found}")
            self.end_log(status="success", posts_found=posts_found, posts_new=posts_new, posts_updated=posts_updated)
        except Exception as e:
            self.logger.error(f"Tarama sırasında kritik hata: {e}", exc_info=True)
            self.end_log(status="failed", posts_found=0, posts_new=0, posts_updated=0, error_message=str(e))
            sys.exit(1)
