import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class KamuIlanSbbScraper(BaseScraper):
    """
    Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı (kamuilan.sbb.gov.tr) Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="kamu-ilan-sbb")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        url = "https://kamuilan.sbb.gov.tr"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # İlan tablosu veya kartları
                    rows = soup.select("table tbody tr, .ilan-row, .card-body")
                    
                    for row in rows:
                        link_el = row.select_one("a[href]")
                        if not link_el:
                            continue
                            
                        cols = row.select("td")
                        href = link_el.get("href", "")
                        if not href.startswith("http"):
                            href = f"https://kamuilan.sbb.gov.tr/{href.lstrip('/')}"
                            
                        title = link_el.get_text(strip=True)
                        institution = None
                        deadline = None
                        
                        if len(cols) >= 3:
                            institution = cols[0].get_text(strip=True) if cols[0] != link_el.parent else None
                            # Son başvuru veya yayın tarihi genellikle son sütundadır
                            deadline = cols[-1].get_text(strip=True)
                        
                        posts.append({
                            "title": title,
                            "institution": institution or "Kamu Kurumu",
                            "deadline_at": deadline,
                            "original_url": href,
                            "description": row.get_text(separator=" ", strip=True)
                        })
        except Exception as e:
            self.logger.error(f"Kamu İlan SBB scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = KamuIlanSbbScraper()
    scraper.run()
