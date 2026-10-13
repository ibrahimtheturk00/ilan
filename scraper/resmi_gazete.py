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
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    
                    # Çeşitli İlanlar başlığı altındaki linki bul (eskiilanlar/...-4.htm)
                    cesitli_link = None
                    for a in soup.select("a[href]"):
                        href = a.get("href", "")
                        if "eskiilanlar" in href and href.endswith("-4.htm"):
                            cesitli_link = href
                            break

                    sub_url = cesitli_link
                    if not sub_url:
                        from datetime import datetime
                        today_str = datetime.now().strftime("%Y/%m/%Y%m%d-4.htm")
                        sub_url = f"https://www.resmigazete.gov.tr/ilanlar/eskiilanlar/{today_str}"
                    elif not sub_url.startswith("http"):
                        sub_url = f"https://www.resmigazete.gov.tr/{sub_url.lstrip('/')}"

                    # Çeşitli İlanlar sayfasını çek
                    sub_resp = client.get(sub_url)
                    if sub_resp.status_code == 200:
                        sub_resp.encoding = "windows-1254"
                        sub_soup = BeautifulSoup(sub_resp.text, "html.parser")
                        base_sub = sub_url.rsplit("/", 1)[0]

                        for a in sub_soup.select("a[href]"):
                            title = a.get_text(separator=" ", strip=True)
                            href = a.get("href", "")
                            if not href.endswith(".pdf"):
                                continue

                            pdf_url = href if href.startswith("http") else f"{base_sub}/{href.lstrip('/')}"
                            inst = title.split("Rektörlüğünden")[0].split("Başkanlığından")[0].split("Müdürlüğünden")[0].strip()

                            posts.append({
                                "title": title,
                                "institution": inst or "T.C. Resmî Gazete İlanı",
                                "deadline_at": None,
                                "original_url": pdf_url,
                                "description": f"Resmî Gazete Çeşitli İlanlar bölümünde yayımlanan personel alım ilanı: {title}"
                            })
        except Exception as e:
            self.logger.error(f"Resmî Gazete scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = ResmiGazeteScraper()
    scraper.run()
