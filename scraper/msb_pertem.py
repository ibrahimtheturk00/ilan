import re
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class MsbPertemScraper(BaseScraper):
    """
    Millî Savunma Bakanlığı Personel Temin Daire Başkanlığı (MSB PERTEM)
    Muvazzaf Subay, Astsubay, Uzman Erbaş, Sözleşmeli Er ve Sivil Memur Alım İlanları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="msb-pertem")

    def scrape(self) -> List[Dict[str, Any]]:
        base_url = "https://personeltemin.msb.gov.tr"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://www.google.com"
        }

        # 1. HTTPX İle Hızlı Tarama
        try:
            with httpx.Client(timeout=25.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(base_url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    posts = self._parse_soup(soup, base_url)
                    if posts:
                        return posts
        except Exception as e:
            self.logger.warning(f"MSB PERTEM httpx uyarısı: {e}")

        # 2. Playwright İle Güvenli Fallback
        try:
            self.logger.info("MSB PERTEM Playwright fallback ile taranıyor...")
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(base_url, timeout=25000, wait_until="domcontentloaded")
                page.wait_for_timeout(3000)
                html = page.content()
                browser.close()
                soup = BeautifulSoup(html, "html.parser")
                posts = self._parse_soup(soup, base_url)
                if posts:
                    return posts
        except Exception as e:
            self.logger.error(f"MSB PERTEM Playwright hatası: {e}")

        return []

    def _parse_soup(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        posts = []
        # 1. Öncelikli / Güncel Temin Blokları (.home-first-block--item)
        first_items = soup.find_all("div", class_="home-first-block--item")
        for it in first_items:
            h3 = it.find("h3")
            if not h3:
                continue
            raw_title = h3.get_text(separator=" ", strip=True)
            clean_title = re.sub(r"\s+", " ", raw_title).strip()
            if not clean_title:
                continue

            date_el = it.find("p", class_="date")
            pub_date = date_el.get_text(strip=True) if date_el else None
            desc_paragraphs = [p.get_text(strip=True) for p in it.find_all("p") if p != date_el]
            desc = " ".join(desc_paragraphs).strip() or clean_title

            inst = self._detect_institution(clean_title)
            post_type, category = self._classify_msb_post(clean_title)

            slug_id = re.sub(r"[^a-zA-Z0-9]+", "-", clean_title[:40].lower()).strip("-")
            original_url = f"{base_url}/#temin-{slug_id}"

            posts.append({
                "title": clean_title,
                "institution": inst,
                "city": "Ankara",
                "published_at": pub_date,
                "deadline_at": None,
                "original_url": original_url,
                "description": desc,
                "post_type": post_type,
                "category": category
            })

        # 2. Duyurular ve Temin Listesi (.item--exp)
        exp_items = soup.find_all("div", class_="item--exp")
        for it in exp_items:
            h = it.find(["h3", "h4", "p"])
            if not h:
                continue
            raw_title = h.get_text(separator=" ", strip=True)
            clean_title = re.sub(r"\s+", " ", raw_title).strip()
            if not clean_title or len(clean_title) < 15:
                continue

            if not any(k in clean_title.upper() for k in ["TEMİN", "ALIM", "SUBAY", "ASTSUBAY", "ERBAŞ", "İŞÇİ", "MEMUR", "KAYIT", "SINAV", "SONUÇ"]):
                continue

            date_el = it.find("p", class_="date")
            pub_date = date_el.get_text(strip=True) if date_el else None

            inst = self._detect_institution(clean_title)
            post_type, category = self._classify_msb_post(clean_title)

            slug_id = re.sub(r"[^a-zA-Z0-9]+", "-", clean_title[:40].lower()).strip("-")
            original_url = f"{base_url}/#duyuru-{slug_id}"

            posts.append({
                "title": clean_title,
                "institution": inst,
                "city": "Ankara",
                "published_at": pub_date,
                "deadline_at": None,
                "original_url": original_url,
                "description": clean_title,
                "post_type": post_type,
                "category": category
            })

        return posts

    def _detect_institution(self, title: str) -> str:
        t_upper = title.upper()
        if "DENİZ KUVVETLERİ" in t_upper or "DZ.K.K" in t_upper:
            return "Deniz Kuvvetleri Komutanlığı"
        elif "KARA KUVVETLERİ" in t_upper or "K.K.K" in t_upper:
            return "Kara Kuvvetleri Komutanlığı"
        elif "HAVA KUVVETLERİ" in t_upper or "HV.K.K" in t_upper:
            return "Hava Kuvvetleri Komutanlığı"
        elif "MİLLÎ SAVUNMA ÜNİVERSİTESİ" in t_upper or "MSÜ" in t_upper:
            return "Millî Savunma Üniversitesi"
        elif "HARİTA GENEL" in t_upper:
            return "Harita Genel Müdürlüğü"
        return "Millî Savunma Bakanlığı"

    def _classify_msb_post(self, title: str) -> tuple[str, str]:
        t_upper = title.upper()
        # Post Type
        if "SÖZLEŞMELİ" in t_upper:
            post_type = "sozlesmeli"
        elif "İŞÇİ" in t_upper:
            post_type = "isci"
        elif "MUVAZZAF" in t_upper or "UZMAN ERBAŞ" in t_upper or "SUBAY" in t_upper or "ASTSUBAY" in t_upper or "MEMUR" in t_upper:
            post_type = "memur"
        else:
            post_type = "memur"

        # Category
        if "MÜHENDİS" in t_upper or "TEKNİK" in t_upper:
            cat = "muhendislik"
        elif "TABİP" in t_upper or "DİŞ" in t_upper or "SAĞLIK" in t_upper:
            cat = "saglik"
        elif "ÖĞRETMEN" in t_upper or "BEDEN EĞİTİMİ" in t_upper or "EĞİTİM" in t_upper:
            cat = "egitim"
        elif "HUKUK" in t_upper or "ADLİ" in t_upper:
            cat = "hukuk"
        else:
            cat = "diger"

        return post_type, cat

if __name__ == "__main__":
    scraper = MsbPertemScraper()
    scraper.run()
