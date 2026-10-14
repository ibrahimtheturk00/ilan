import re
import logging
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple
from base import BaseScraper

class KurumPortallariScraper(BaseScraper):
    """
    ÖSYM, Sağlık Bakanlığı (YHGM), MEB PGM, Aile Bakanlığı, GİB, Diyanet,
    İşe Alım Kariyer Kapısı gibi merkezi resmi kurum portallarını tarayan birleşik motor.
    """
    def __init__(self):
        super().__init__(source_slug="osym")

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

if __name__ == "__main__":
    scraper = KurumPortallariScraper()
    scraper.run()
