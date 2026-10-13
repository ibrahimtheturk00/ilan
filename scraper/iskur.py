import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper
from pdf_parser import extract_pdf_content

class IskurScraper(BaseScraper):
    """
    İŞKUR Kurum Dışı Kamu İşçi Alımı İlanları Scraper'ı.
    Belediyeler ve kamu iktisadi teşekküllerinin personel alımlarını çeker ve PDF eklerini çözümler.
    """
    def __init__(self):
        super().__init__(source_slug="iskur")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        # İŞKUR Kurum Dışı Kamu İşçi Alımı sayfası
        url = "https://www.iskur.gov.tr/baglantilar/kurum-disi-kamu-isci-alimi/"

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # İlan tablosu satırları
                    rows = soup.select("table tbody tr, .content-list tr, .accordion-item")
                    
                    for row in rows[:30]:
                        links = row.select("a[href]")
                        if not links:
                            continue
                            
                        main_link = links[0]
                        href = main_link.get("href", "")
                        if not href.startswith("http"):
                            href = f"https://www.iskur.gov.tr{href}"

                        title = main_link.get_text(strip=True) or "İŞKUR Kamu İlanı"
                        
                        # Kurum veya il bilgisi genellikle satır içi sütunlardadır
                        cols = row.select("td")
                        institution = cols[0].get_text(strip=True) if len(cols) > 0 else "İŞKUR Kamu Kurumu"
                        deadline = cols[-1].get_text(strip=True) if len(cols) > 1 else None

                        # PDF eki varsa metin çıkarımı yap
                        pdf_desc = ""
                        pos_count = None
                        if href.endswith(".pdf"):
                            try:
                                pdf_resp = client.get(href, timeout=15.0)
                                if pdf_resp.status_code == 200:
                                    pdf_data = extract_pdf_content(pdf_resp.content)
                                    pdf_desc = pdf_data.get("text", "")[:1000]
                                    deadline = deadline or pdf_data.get("deadline")
                                    pos_count = pdf_data.get("position_count")
                            except Exception as pdf_err:
                                self.logger.warning(f"PDF okunamadı ({href}): {pdf_err}")

                        posts.append({
                            "title": title,
                            "institution": institution,
                            "post_type": "isci",
                            "deadline_at": deadline,
                            "position_count": pos_count,
                            "original_url": href,
                            "description": pdf_desc or row.get_text(separator=" ", strip=True)
                        })
        except Exception as e:
            self.logger.error(f"İŞKUR scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = IskurScraper()
    scraper.run()
