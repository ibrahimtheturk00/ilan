import re
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class IcisleriBakanligiScraper(BaseScraper):
    """
    T.C. İçişleri Bakanlığı Personel Genel Müdürlüğü
    Uzman Yardımcısı, Bilişim Personeli, İl Planlama ve Merkez/Taşra Teşkilatı Personel Alım İlanları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="icisleri-bakanligi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        target_urls = [
            "https://www.icisleri.gov.tr/personel",
            "https://www.icisleri.gov.tr/duyurular"
        ]
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://www.google.com"
        }

        keywords = [
            "alim", "alimi", "sinav", "sinavi", "uzman", "sozlesmeli", "bilisim",
            "kontrolor", "planlama", "gorevde yukselme", "unvan degisikligi", "stajyer"
        ]

        seen_titles = set()
        seen_urls = set()

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                for target_url in target_urls:
                    try:
                        resp = client.get(target_url)
                        if resp.status_code != 200:
                            continue

                        soup = BeautifulSoup(resp.text, "html.parser")
                        for a in soup.find_all("a", href=True):
                            title = a.get_text(separator=" ", strip=True)
                            clean_title = re.sub(r"\s+", " ", title).strip()
                            if not clean_title or len(clean_title) < 20 or clean_title in seen_titles:
                                continue

                            # Menü veya genel daire başlıklarını atla
                            norm = self._normalize_tr(clean_title)
                            if norm in ["personel genel mudurlugu", "acil durumlar ve savunma planlamasi dairesi"]:
                                continue

                            if not any(k in norm for k in keywords):
                                continue

                            href = a["href"]
                            if href.startswith("//"):
                                full_url = f"https:{href}"
                            elif href.startswith("/"):
                                full_url = f"https://www.icisleri.gov.tr{href}"
                            else:
                                full_url = href

                            if full_url in seen_urls:
                                continue

                            seen_titles.add(clean_title)
                            seen_urls.add(full_url)

                            post_type, category = self._classify_post(clean_title)

                            posts.append({
                                "title": clean_title,
                                "institution": "T.C. İçişleri Bakanlığı",
                                "city": "Ankara",
                                "published_at": None,
                                "deadline_at": None,
                                "original_url": full_url,
                                "description": clean_title,
                                "post_type": post_type,
                                "category": category
                            })
                    except Exception as sub_err:
                        self.logger.warning(f"URL taranırken hata ({target_url}): {sub_err}")

        except Exception as e:
            self.logger.error(f"İçişleri Bakanlığı scraping hatası: {e}")

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

        if "BİLİŞİM" in t_upper or "YAZILIM" in t_upper:
            cat = "bilisim"
        elif "HUKUK" in t_upper or "KONTROLÖR" in t_upper:
            cat = "hukuk"
        elif "PLANLAMA" in t_upper or "UZMAN" in t_upper or "YÜKSELME" in t_upper:
            cat = "maliye"
        else:
            cat = "diger"

        return post_type, cat

if __name__ == "__main__":
    scraper = IcisleriBakanligiScraper()
    scraper.run()
