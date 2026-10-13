import json
import logging
from typing import List, Dict, Any
from base import BaseScraper

class KariyerKapisiScraper(BaseScraper):
    """
    Kariyer Kapısı (CBİKO) Kamu İşe Alım İlanları Scraper'ı.
    Playwright veya dinamik API istekleri ile güncel kamu iş ilanlarını çeker.
    """
    def __init__(self):
        super().__init__(source_slug="kariyer-kapisi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        
        # 1. Öncelikli olarak API veya HTTP istekleri denenir
        import httpx
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://kariyerkapisi.cbiko.gov.tr/"
        }
        
        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as client:
                # Kamu iş ilanları API veya anasayfa
                url = "https://isealimkariyerkapisi.cbiko.gov.tr/api/announcements/public"
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data if isinstance(data, list) else data.get("items", data.get("data", []))
                    for item in items:
                        posts.append({
                            "title": item.get("title") or item.get("jobTitle") or "Kamu Personeli Alımı",
                            "institution": item.get("organizationName") or item.get("institution"),
                            "city": item.get("city"),
                            "published_at": item.get("startDate") or item.get("createdDate"),
                            "deadline_at": item.get("endDate") or item.get("applicationEndDate"),
                            "position_count": item.get("quota") or item.get("positionCount"),
                            "original_url": item.get("url") or f"https://isealimkariyerkapisi.cbiko.gov.tr/announcement/{item.get('id', '')}",
                            "description": item.get("summary") or item.get("description", "")
                        })
                    if posts:
                        return posts
        except Exception as e:
            self.logger.warning(f"HTTP/API çağrısı başarısız, Playwright deneniyor: {e}")

        # 2. API sonuç vermezse Playwright ile headless tarama
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://kariyerkapisi.cbiko.gov.tr", timeout=45000, wait_until="domcontentloaded")
                
                # İlan kartlarını tara
                cards = page.query_selector_all(".announcement-card, .job-item, .card")
                for card in cards[:20]:
                    title_elem = card.query_selector("h3, h4, .title")
                    link_elem = card.query_selector("a")
                    org_elem = card.query_selector(".organization, .institution, .company")
                    date_elem = card.query_selector(".date, .deadline")
                    
                    if title_elem and link_elem:
                        href = link_elem.get_attribute("href") or ""
                        if not href.startswith("http"):
                            href = f"https://kariyerkapisi.cbiko.gov.tr{href}"
                        
                        posts.append({
                            "title": title_elem.inner_text().strip(),
                            "institution": org_elem.inner_text().strip() if org_elem else "Kamu Kurumu",
                            "deadline_at": date_elem.inner_text().strip() if date_elem else None,
                            "original_url": href,
                            "description": card.inner_text().strip()
                        })
                browser.close()
        except Exception as e:
            self.logger.error(f"Playwright tarama hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = KariyerKapisiScraper()
    scraper.run()
