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
        
        import httpx
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://kariyerkapisi.gov.tr",
            "Referer": "https://kariyerkapisi.gov.tr/isealim"
        }
        
        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                url = "https://api.kariyerkapisi.gov.tr/api/ilan/SearchIlanPublic"
                payload = {
                    "krM_ID": 0,
                    "searchText": "",
                    "il": "0",
                    "ilanTuru": "0"
                }
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    items = resp.json()
                    self.logger.info(f"Kariyer Kapısı API'den {len(items)} adet resmi kamu ilanı çekildi.")
                    for item in items:
                        guid = item.get("guid")
                        if not guid:
                            continue
                        
                        inst = (item.get("kurumAdi") or "").strip()
                        raw_title = (item.get("ilanBaslik") or "").strip()
                        
                        # Başlık kurum adıyla başlıyorsa temizle veya düzgün birleştir
                        if raw_title.startswith(inst):
                            title = raw_title.lstrip(inst).lstrip(" -").strip()
                            full_title = f"{inst} {title}".strip()
                        else:
                            full_title = f"{inst} {raw_title}".strip() if inst else raw_title
                            
                        # Başvuru ekranına doğrudan giden URL:
                        direct_url = f"https://kariyerkapisi.gov.tr/IlanDetay?i={guid}"
                        
                        start_date = (item.get("basTarih") or "").split("T")[0] if item.get("basTarih") else None
                        end_date = (item.get("bitTarih") or "").split("T")[0] if item.get("bitTarih") else None
                        ilan_turu = item.get("ilanTuru") or "Personel Alımı"
                        birim = item.get("birimAdi") or ""
                        
                        description = f"{inst} bünyesinde istihdam edilmek üzere {ilan_turu}. {birim}. Başvuru Tarihleri: {start_date} - {end_date}."

                        posts.append({
                            "title": full_title,
                            "institution": inst,
                            "published_at": start_date,
                            "deadline_at": end_date,
                            "original_url": direct_url,
                            "description": description,
                        })
                    if posts:
                        return posts
        except Exception as e:
            self.logger.warning(f"Kariyer Kapısı API çağrısı başarısız: {e}")

        # 2. API sonuç vermezse Playwright ile headless tarama
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://kariyerkapisi.gov.tr/isealim", timeout=45000, wait_until="domcontentloaded")
                
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
                            href = f"https://kariyerkapisi.gov.tr{href}"
                        
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
