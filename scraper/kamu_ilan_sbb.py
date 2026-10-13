import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper
from normalizer import parse_turkish_date_range, clean_text

class KamuIlanSbbScraper(BaseScraper):
    """
    Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı (kamuilan.sbb.gov.tr) Scraper'ı.
    Tüm güncel kamu kurum ve kuruluşları alım ilanlarını canlı olarak çeker.
    """
    def __init__(self):
        super().__init__(source_slug="kamu-ilan-sbb")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://kamuilan.sbb.gov.tr/"
        }

        url = "https://kamuilan.sbb.gov.tr/"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    
                    # SBB anasayfasındaki tüm ilan linkleri: a[href*='ilandetay.aspx']
                    links = soup.find_all("a", href=lambda h: h and "ilandetay.aspx" in h.lower())
                    self.logger.info(f"SBB sayfasında {len(links)} adet ilan kartı bulundu.")

                    for a in links:
                        black_el = a.select_one(".black")
                        patrol_el = a.select_one(".patrol")
                        date_el = a.select_one(".h5date")

                        institution = clean_text(black_el.get_text(strip=True)) if black_el else "Kamu Kurumu"
                        title_info = clean_text(patrol_el.get_text(strip=True)) if patrol_el else "Personel Alımı"
                        
                        full_title = f"{institution} {title_info}".strip()
                        if len(full_title) < 5:
                            continue

                        date_text = clean_text(date_el.get_text(strip=True)) if date_el else ""
                        published_at, deadline_at = parse_turkish_date_range(date_text)

                        href = a.get("href", "")
                        if not href.startswith("http"):
                            href = f"https://kamuilan.sbb.gov.tr/{href.lstrip('/')}"

                        description = f"{institution} bünyesinde istihdam edilmek üzere personel alım ilanı. Başvuru Şartları: {title_info}. Başvuru Tarihleri: {date_text}."

                        posts.append({
                            "title": full_title,
                            "institution": institution,
                            "published_at": published_at,
                            "deadline_at": deadline_at,
                            "original_url": href,
                            "description": description,
                        })
        except Exception as e:
            self.logger.error(f"Kamu İlan SBB scraping hatası: {e}", exc_info=True)

        return posts

if __name__ == "__main__":
    scraper = KamuIlanSbbScraper()
    scraper.run()
