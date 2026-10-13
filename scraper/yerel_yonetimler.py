import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

class YerelYonetimlerScraper(BaseScraper):
    """
    Yerel Yönetimler Portalı (yerelyonetimler.csb.gov.tr) ve Belediye Alımları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="yerel-yonetimler")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        url = "https://yerelyonetimler.csb.gov.tr/duyurular"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    items = soup.select(".announcement-item, .duyuru-listesi li, .card, table tr")
                    
                    for item in items:
                        link_el = item.select_one("a[href]")
                        if not link_el:
                            continue
                            
                        title = link_el.get_text(strip=True)
                        if len(title) < 5:
                            continue
                            
                        href = link_el.get("href", "")
                        if not href.startswith("http"):
                            href = f"https://yerelyonetimler.csb.gov.tr{href}"

                        date_el = item.select_one(".date, .tarih, span.small")
                        deadline = date_el.get_text(strip=True) if date_el else None

                        posts.append({
                            "title": title,
                            "institution": "Belediye / Yerel Yönetim",
                            "deadline_at": deadline,
                            "original_url": href,
                            "description": item.get_text(separator=" ", strip=True)
                        })
                        
                    if posts:
                        return posts
        except Exception as e:
            self.logger.warning(f"HTTP isteği başarısız oldu, Playwright deneniyor: {e}")

        # Fallback to Playwright if needed
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, timeout=30000, wait_until="domcontentloaded")
                
                cards = page.query_selector_all("a[href*='duyuru'], .card a")
                for card in cards[:15]:
                    title = card.inner_text().strip()
                    href = card.get_attribute("href") or ""
                    if title and href:
                        if not href.startswith("http"):
                            href = f"https://yerelyonetimler.csb.gov.tr{href}"
                        posts.append({
                            "title": title,
                            "institution": "Yerel Yönetimler Genel Müdürlüğü",
                            "original_url": href,
                            "description": title
                        })
                browser.close()
        except Exception as e:
            self.logger.error(f"Yerel Yönetimler scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = YerelYonetimlerScraper()
    scraper.run()
