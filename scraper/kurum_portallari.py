import re
import sys
import logging
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple
from base import BaseScraper

class KurumPortallariScraper(BaseScraper):
    """
    ÖSYM, Sağlık Bakanlığı (YHGM), MEB PGM, Aile Bakanlığı, GİB gibi
    merkezi resmi kurum portallarını tarayan ve her birini kendi resmi kaynağına yazan birleşik motor.
    """
    def __init__(self):
        super().__init__(source_slug="osym")
        self.source_id_map: Dict[str, int] = {}
        if self.client:
            try:
                res = self.client.table("sources").select("id, slug").execute()
                if res.data:
                    self.source_id_map = {r["slug"]: r["id"] for r in res.data}
            except Exception as e:
                self.logger.warning(f"Source ID haritası çekilemedi: {e}")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9",
        }

        with httpx.Client(timeout=25.0, headers=headers, follow_redirects=True, verify=False) as client:
            # 1. ÖSYM KPSS Tercih ve Merkezi Yerleştirme Duyuruları
            try:
                self.logger.info("ÖSYM duyuruları taranıyor...")
                res = client.get("https://www.osym.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = self._normalize_tr(title)
                        if any(k in norm for k in ["kpss", "tercih", "yerlestirme", "kadro", "sozlesmeli"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.osym.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "source_id": self.source_id_map.get("osym") or self.source_id,
                                    "source_slug": "osym",
                                    "title": title,
                                    "institution": "ÖSYM (Ölçme, Seçme ve Yerleştirme Merkezi)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "memur",
                                    "category": "diger"
                                })
            except Exception as e:
                self.logger.warning(f"ÖSYM tarama uyarısı: {e}")

            # 2. Sağlık Bakanlığı Yönetim Hizmetleri Genel Müdürlüğü (YHGM)
            try:
                self.logger.info("Sağlık Bakanlığı YHGM duyuruları taranıyor...")
                res = client.get("https://yhgm.saglik.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = self._normalize_tr(title)
                        if any(k in norm for k in ["alim", "sozlesmeli", "kura", "atama", "hemsire", "tabip", "personel"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://yhgm.saglik.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "source_id": self.source_id_map.get("saglik-yhgm"),
                                    "source_slug": "saglik-yhgm",
                                    "title": f"Sağlık Bakanlığı - {title}",
                                    "institution": "T.C. Sağlık Bakanlığı (YHGM)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "saglik"
                                })
            except Exception as e:
                self.logger.warning(f"Sağlık YHGM tarama uyarısı: {e}")

            # 3. Millî Eğitim Bakanlığı Personel Genel Müdürlüğü (MEB PGM)
            try:
                self.logger.info("MEB Personel Genel Müdürlüğü taranıyor...")
                res = client.get("https://personel.meb.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = self._normalize_tr(title)
                        if any(k in norm for k in ["ogretmen", "atama", "alim", "sozlesmeli", "personel", "basvuru"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://personel.meb.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "source_id": self.source_id_map.get("meb-pgm"),
                                    "source_slug": "meb-pgm",
                                    "title": f"MEB - {title}",
                                    "institution": "Millî Eğitim Bakanlığı (MEB)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "egitim"
                                })
            except Exception as e:
                self.logger.warning(f"MEB PGM tarama uyarısı: {e}")

            # 4. Aile ve Sosyal Hizmetler Bakanlığı
            try:
                self.logger.info("Aile ve Sosyal Hizmetler Bakanlığı taranıyor...")
                res = client.get("https://www.aile.gov.tr/duyurular")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = self._normalize_tr(title)
                        if any(k in norm for k in ["personel", "alim", "sozlesmeli", "asdep", "sinav", "basvuru"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.aile.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "source_id": self.source_id_map.get("aile-bakanligi"),
                                    "source_slug": "aile-bakanligi",
                                    "title": f"Aile ve Sosyal Hizmetler Bakanlığı - {title}",
                                    "institution": "T.C. Aile ve Sosyal Hizmetler Bakanlığı",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "diger"
                                })
            except Exception as e:
                self.logger.warning(f"Aile Bakanlığı tarama uyarısı: {e}")

            # 5. Gelir İdaresi Başkanlığı (GİB)
            try:
                self.logger.info("Gelir İdaresi Başkanlığı taranıyor...")
                res = client.get("https://www.gib.gov.tr/kurumsal/duyurular")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = self._normalize_tr(title)
                        if any(k in norm for k in ["uzman", "yardimcisi", "alim", "sinav", "giris", "kadro"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.gib.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "source_id": self.source_id_map.get("gib"),
                                    "source_slug": "gib",
                                    "title": f"Gelir İdaresi Başkanlığı - {title}",
                                    "institution": "Gelir İdaresi Başkanlığı (GİB)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "memur",
                                    "category": "maliye"
                                })
            except Exception as e:
                self.logger.warning(f"GİB tarama uyarısı: {e}")

        # Tekilleştirme (aynı başlıklı mükerrerleri filtrele)
        seen_titles = set()
        unique_posts = []
        for p in posts:
            t = p["title"].strip()
            if t not in seen_titles:
                seen_titles.add(t)
                unique_posts.append(p)

        self.logger.info(f"Kurum portallarından toplam {len(unique_posts)} güncel ilan/duyuru derlendi.")
        return unique_posts

    def _normalize_tr(self, text: str) -> str:
        return (
            (text or "")
            .lower()
            .replace("ç", "c")
            .replace("ğ", "g")
            .replace("ı", "i")
            .replace("i̇", "i")
            .replace("ö", "o")
            .replace("ş", "s")
            .replace("ü", "u")
        )

    def run(self):
        """Tüm kurum portallarını tarar ve her kurumun kendi kaynağına log ve ilan yazar."""
        self.logger.info("Çoklu kurum portalları taraması başlatılıyor...")
        active_slugs = ["osym", "saglik-yhgm", "meb-pgm", "aile-bakanligi", "gib"]
        started_at = datetime.now(timezone.utc).isoformat()
        log_ids = {}

        if self.client:
            for slug in active_slugs:
                s_id = self.source_id_map.get(slug)
                if s_id:
                    try:
                        res = self.client.table("scrape_logs").insert({
                            "source_id": s_id,
                            "started_at": started_at,
                            "status": "running",
                            "github_run_id": self.github_run_id
                        }).execute()
                        if res.data:
                            log_ids[slug] = res.data[0]["id"]
                    except Exception as e:
                        self.logger.warning(f"{slug} log kaydı başlatılamadı: {e}")

        try:
            raw_posts = self.scrape()
            posts_found = len(raw_posts)
            self.logger.info(f"{posts_found} adet ham ilan çekildi.")

            normalized_posts = [self.normalize_and_prepare_post(p) for p in raw_posts if p.get("original_url")]
            posts_new, posts_updated = self.save_posts(normalized_posts)

            # Süresi dolan veya iptal ilanları temizle
            self.deactivate_expired_and_cancelled_jobs()

            now_iso = datetime.now(timezone.utc).isoformat()
            if self.client:
                for slug in active_slugs:
                    s_id = self.source_id_map.get(slug)
                    if s_id:
                        try:
                            self.client.table("sources").update({"last_scraped_at": now_iso}).eq("id", s_id).execute()
                        except Exception:
                            pass

                        l_id = log_ids.get(slug)
                        if l_id:
                            c_found = sum(1 for p in raw_posts if p.get("source_slug") == slug)
                            try:
                                self.client.table("scrape_logs").update({
                                    "finished_at": now_iso,
                                    "status": "success",
                                    "posts_found": c_found,
                                    "posts_new": posts_new if c_found > 0 else 0,
                                    "posts_updated": posts_updated if c_found > 0 else 0
                                }).eq("id", l_id).execute()
                            except Exception:
                                pass

            self.logger.info("Tüm kurum portalları taraması ve log kayıtları tamamlandı.")
        except Exception as e:
            self.logger.error(f"Kurum portalları taramasında hata: {e}", exc_info=True)
            now_iso = datetime.now(timezone.utc).isoformat()
            if self.client:
                for slug, l_id in log_ids.items():
                    try:
                        self.client.table("scrape_logs").update({
                            "finished_at": now_iso,
                            "status": "failed",
                            "error_message": str(e)
                        }).eq("id", l_id).execute()
                    except Exception:
                        pass
            sys.exit(1)

if __name__ == "__main__":
    scraper = KurumPortallariScraper()
    scraper.run()
