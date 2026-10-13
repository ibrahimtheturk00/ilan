import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class IlanGovScraper(BaseScraper):
    """
    Basın İlan Kurumu (ilan.gov.tr) Kamu Personeli Alımı İlanları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="ilan-gov")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://www.ilan.gov.tr"
        }

        # İlan.gov.tr Personel Alımı kategori sayfası
        target_url = "https://www.ilan.gov.tr/ilan/kategori/8/personel-alimi"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(target_url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # İlan kartları
                    items = soup.select(".classified-item, .ilan-listesi-item, tr.classified-row, article")
                    
                    for item in items:
                        title_el = item.select_one(".title, .classified-title, h2, h3, a.ilan-link")
                        link_el = item.select_one("a[href*='/ilan/']")
                        date_el = item.select_one(".date, .classified-date, .son-tarih")
                        city_el = item.select_one(".city, .classified-city, .sehir")
                        inst_el = item.select_one(".institution, .kurum")

                        if title_el and link_el:
                            href = link_el.get("href", "")
                            if not href.startswith("http"):
                                href = f"https://www.ilan.gov.tr{href}"

                            posts.append({
                                "title": title_el.get_text(strip=True),
                                "institution": inst_el.get_text(strip=True) if inst_el else "Resmi Kurum",
                                "city": city_el.get_text(strip=True) if city_el else None,
                                "deadline_at": date_el.get_text(strip=True) if date_el else None,
                                "original_url": href,
                                "description": item.get_text(separator=" ", strip=True)
                            })
        except Exception as e:
            self.logger.error(f"İlan.gov.tr scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = IlanGovScraper()
    scraper.run()
