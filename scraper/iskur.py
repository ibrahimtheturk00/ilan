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

        # İŞKUR hem Kamu Memur Alımı hem de Kurumdışı Kamu İşçi Alımı sayfalarını tarar
        pages = [
            ("https://www.iskur.gov.tr/ilanlar/kamu-memur-alim-ilanlari/", "memur"),
            ("https://www.iskur.gov.tr/ilanlar/kurumdisi-kamu-isci-alim-ilanlari/", "isci")
        ]

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                for base_page, default_type in pages:
                    resp = client.get(base_page)
                    if resp.status_code != 200:
                        continue

                    soup = BeautifulSoup(resp.text, "html.parser")
                    # data-count olan şehirleri tespit et
                    active_cities = []
                    for opt in soup.select("#city-dropdown option"):
                        val = opt.get("value")
                        data_id = opt.get("data-id")
                        text = opt.get_text(strip=True)
                        if "(" in text and val and data_id:
                            active_cities.append((val, data_id))

                    # İlk 15 şehri tara (kota aşımını önlemek için)
                    for city_val, city_id in active_cities[:15]:
                        city_url = f"{base_page}?idId={city_id}&il={city_val}"
                        try:
                            c_resp = client.get(city_url, timeout=15.0)
                            if c_resp.status_code == 200:
                                c_soup = BeautifulSoup(c_resp.text, "html.parser")
                                for row in c_soup.select(".clickable-row"):
                                    file_url = row.get("data-file-url") or ""
                                    if file_url and not file_url.startswith("http"):
                                        file_url = f"https://www.iskur.gov.tr{file_url}"

                                    row_text = row.get_text(separator=" | ", strip=True)
                                    parts = [p.strip() for p in row_text.split("|") if p.strip()]
                                    
                                    deadline = parts[0] if len(parts) > 1 else None
                                    title = parts[1] if len(parts) > 1 else (parts[0] if parts else "İŞKUR Kamu İlanı")

                                    # Eğer başlıkta kalan gün veya süre metni varsa PDF dosya adından temizle
                                    title_lower = title.lower()
                                    if any(w in title_lower for w in ["gün kaldı", "gn kald", "sona eriyor", "(son", "(bugün"]):
                                        if file_url and "/" in file_url:
                                            try:
                                                import urllib.parse
                                                pdf_name = urllib.parse.unquote(file_url.split("/")[-1]).replace(".pdf", "").replace("-", " ").replace("_", " ").strip().title()
                                                if len(pdf_name) > 3 and not pdf_name.isdigit() and "doc0" not in pdf_name.lower() and "scan" not in pdf_name.lower():
                                                    title = f"{pdf_name} Personel Alım İlanı"
                                                else:
                                                    title = f"{city_val.capitalize()} Kamu Personel Alım İlanı"
                                            except Exception:
                                                title = f"{city_val.capitalize()} Kamu Personel Alım İlanı"
                                        else:
                                            title = f"{city_val.capitalize()} Kamu Personel Alım İlanı"

                                    posts.append({
                                        "title": title,
                                        "institution": title.split("Alım")[0].split("Sınav")[0].strip() or f"{city_val.capitalize()} Kamu Kurumu",
                                        "city": city_val.capitalize() if city_val else None,
                                        "post_type": default_type,
                                        "deadline_at": deadline,
                                        "original_url": file_url or city_url,
                                        "description": f"İŞKUR {default_type} Alım İlanı: {title}"
                                    })
                        except Exception as city_err:
                            self.logger.warning(f"İŞKUR {city_val} sayfası hatası: {city_err}")
        except Exception as e:
            self.logger.error(f"İŞKUR scraping hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = IskurScraper()
    scraper.run()
