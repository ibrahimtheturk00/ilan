import re
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class AdaletPgmScraper(BaseScraper):
    """
    T.C. Adalet Bakanlığı Personel Genel Müdürlüğü (PGM)
    Zabıt Katibi, İnfaz Koruma Memuru, Mübaşir, İcra Katibi ve Adli Personel Alım İlanları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="adalet-bakanligi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        target_url = "https://pgm.adalet.gov.tr/Home/TumHaberler/1"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://www.google.com"
        }

        keywords = [
            "alim", "alimi", "sinav", "sinavi", "katip", "memur", "infaz", "mubasir",
            "sozlesmeli", "atama", "personel", "basvuru", "hakim", "savci", "yarisma",
            "yeterlik", "stajyer", "koruma", "guvenlik", "asci", "icra", "sofor"
        ]

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(target_url)
                if resp.status_code != 200:
                    self.logger.error(f"Adalet PGM yanıt kodu: {resp.status_code}")
                    return []

                soup = BeautifulSoup(resp.text, "html.parser")
                seen_titles = set()
                seen_urls = set()

                for a in soup.find_all("a", href=True):
                    href = a["href"]
                    if "SayfaDetay" not in href:
                        continue

                    title = a.get_text(separator=" ", strip=True)
                    clean_title = re.sub(r"\s+", " ", title).strip()
                    if not clean_title or len(clean_title) < 15 or clean_title in seen_titles:
                        continue

                    full_url = href if href.startswith("http") else f"https://pgm.adalet.gov.tr{href}"
                    if full_url in seen_urls:
                        continue

                    # İlgili anahtar kelime kontrolü
                    norm_title = self._normalize_tr(clean_title)
                    if not any(k in norm_title for k in keywords):
                        continue

                    # URL'den tarih çıkarma: örn. ...12102026025323 -> 2026-10-12
                    pub_date = None
                    m = re.search(r"(\d{2})(\d{2})(20\d{2})\d{4,6}$", href)
                    if m:
                        day, month, year = m.groups()
                        pub_date = f"{year}-{month}-{day}"

                    # Sadece son dönem (2025-2026) ilanlarını al
                    if pub_date and not (pub_date.startswith("2026") or pub_date.startswith("2025")):
                        continue

                    seen_titles.add(clean_title)
                    seen_urls.add(full_url)

                    # Post type ve kategori tespiti
                    post_type, category = self._classify_post(clean_title)

                    posts.append({
                        "title": clean_title,
                        "institution": "T.C. Adalet Bakanlığı",
                        "city": None, # Tüm Türkiye adliyeleri ve ceza infaz kurumları
                        "published_at": pub_date,
                        "deadline_at": None,
                        "original_url": full_url,
                        "description": clean_title,
                        "post_type": post_type,
                        "category": category
                    })

                    # Maksimum 30 en güncel ilanı al
                    if len(posts) >= 30:
                        break

        except Exception as e:
            self.logger.error(f"Adalet Bakanlığı scraping hatası: {e}")

        return posts

    def _normalize_tr(self, text: str) -> str:
        return (
            text.lower()
            .replace("ı", "i")
            .replace("İ", "i")
            .replace("ş", "s")
            .replace("ğ", "g")
            .replace("ü", "u")
            .replace("ö", "o")
            .replace("ç", "c")
        )

    def _classify_post(self, title: str) -> tuple[str, str]:
        t_upper = title.upper()
        if "SÖZLEŞMELİ" in t_upper:
            post_type = "sozlesmeli"
        elif "İŞÇİ" in t_upper:
            post_type = "isci"
        else:
            post_type = "memur"

        if "HUKUK" in t_upper or "HAKİM" in t_upper or "SAVCI" in t_upper or "KATİP" in t_upper or "MÜBAŞİR" in t_upper or "İNFAZ" in t_upper or "İCRA" in t_upper:
            cat = "hukuk"
        elif "DESTEK" in t_upper or "GÜVENLİK" in t_upper or "AŞÇI" in t_upper:
            cat = "diger"
        else:
            cat = "hukuk"

        return post_type, cat

if __name__ == "__main__":
    scraper = AdaletPgmScraper()
    scraper.run()
