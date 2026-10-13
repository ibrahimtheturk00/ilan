import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper
from pdf_parser import extract_pdf_content

class ResmiGazeteScraper(BaseScraper):
    """
    T.C. Resmî Gazete Çeşitli İlanlar (Kamu Personeli ve Akademik Alımlar) Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="resmi-gazete")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        # Resmî Gazete ana sayfası ve güncel ilanlar
        url = "https://www.resmigazete.gov.tr"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    
                    # Çeşitli İlanlar başlığı altındaki linkler
                    links = soup.select("a[href*='ilanlar'], a[href*='.pdf'], .html-link a")
                    
                    for link in links:
                        title = link.get_text(strip=True)
                        href = link.get("href", "")
                        
                        # Personel, öğretim üyesi, memur veya alım içeren ilanları filtrele
                        keywords = ["alımı", "personel", "öğretim üyesi", "araştırma görevlisi", "müfettiş", "uzman yardımcısı", "memur"]
                        if not any(k in title.lower() for k in keywords):
                            continue

                        if not href.startswith("http"):
                            href = f"https://www.resmigazete.gov.tr/{href.lstrip('/')}"

                        # PDF dosyası kontrolü
                        pdf_desc = ""
                        deadline = None
                        if href.endswith(".pdf"):
                            try:
                                pdf_resp = client.get(href, timeout=15.0)
                                if pdf_resp.status_code == 200:
                                    pdf_data = extract_pdf_content(pdf_resp.content)
                                    pdf_desc = pdf_data.get("text", "")[:1200]
                                    deadline = pdf_data.get("deadline")
                            except Exception as pdf_err:
                                self.logger.warning(f"Resmi Gazete PDF okunamadı ({href}): {pdf_err}")

                        posts.append({
                            "title": title,
                            "institution": "T.C. Resmî Gazete İlanı",
                            "deadline_at": deadline,
                            "original_url": href,
                            "description": pdf_desc or title
                        })
        except Exception as e:
            self.logger.error(f"Resmî Gazete scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = ResmiGazeteScraper()
    scraper.run()
