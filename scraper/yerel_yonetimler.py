import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper
from normalizer import normalize_city

class YerelYonetimlerScraper(BaseScraper):
    """
    Yerel Yönetimler Portalı (yerelyonetimler.csb.gov.tr) ve Belediye Alımları Scraper'ı.
    """
    def __init__(self):
        super().__init__(source_slug="yerel-yonetimler")

    def _format_title_from_slug(self, slug: str) -> str:
        name_part = slug.split("-duyuru-")[0]
        tr_map = {
            "isparta": "Isparta", "ili": "İli", "sariidris": "Sarıidris", "belediye": "Belediye",
            "baskanligi": "Başkanlığı", "baskanligina": "Başkanlığına", "ilk": "İlk", "defa": "Defa",
            "atanmak": "Atanmak", "uzere": "Üzere", "zabita": "Zabıta", "memuru": "Memuru",
            "alimi": "Alımı", "ilani": "İlanı", "kesan": "Keşan", "edirne": "Edirne",
            "nevsehir": "Nevşehir", "ortahisar": "Ortahisar", "duzeltme": "Düzeltme",
            "rize": "Rize", "belediyesi": "Belediyesi", "sozlesmeli": "Sözleşmeli",
            "personel": "Personel", "jeoloji": "Jeoloji", "muhendisi": "Mühendisi",
            "iptal": "İptal", "ziraat": "Ziraat", "mus": "Muş", "malazgirt": "Malazgirt",
            "tekniker": "Tekniker", "gida": "Gıda", "istanbul": "İstanbul", "sile": "Şile",
            "ve": "ve", "nigde": "Niğde", "cukurkuyu": "Çukurkuyu", "cuikurkuyu": "Çukurkuyu",
            "zonguldak": "Zonguldak", "memur": "Memur", "alim": "Alım"
        }
        words = [tr_map.get(w.lower(), w.capitalize()) for w in name_part.split("-")]
        return " ".join(words)

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        url = "https://yerelyonetimler.csb.gov.tr/duyurular"

        months = {
            "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04", "Mayıs": "05", "Haziran": "06",
            "Temmuz": "07", "Ağustos": "08", "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12",
            "Eyll": "09"
        }

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.content, "html.parser")
                    links = soup.find_all("a", href=lambda h: h and "duyuru-" in str(h))
                    
                    seen_urls = set()
                    for a in links:
                        href = a.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        if not href.startswith("http"):
                            href = f"https://yerelyonetimler.csb.gov.tr{href}"

                        slug = href.split("/")[-1]
                        title = self._format_title_from_slug(slug)
                        if len(title) < 5:
                            continue

                        # Kurum adı
                        institution = "Belediye / Yerel Yönetim"
                        words = title.split()
                        for i, w in enumerate(words):
                            if "belediye" in w.lower():
                                institution = " ".join(words[:i+1])
                                if i + 1 < len(words) and "başkanlığı" in words[i+1].lower():
                                    institution += " " + words[i+1]
                                break

                        # İlan / Yayın tarihi
                        date_el = a.find(class_="date")
                        d_txt = date_el.get_text(" ", strip=True) if date_el else ""
                        parts = d_txt.split()
                        published_date = None
                        if len(parts) >= 3 and parts[0].isdigit() and parts[2].isdigit():
                            day = parts[0].zfill(2)
                            month = months.get(parts[1], "10")
                            year = parts[2]
                            published_date = f"{year}-{month}-{day}"

                        city = normalize_city(institution) or normalize_city(title)

                        # Detay açıklaması
                        desc = title
                        info_el = a.find(class_="info")
                        if info_el:
                            info_text = info_el.get_text(" ", strip=True)
                            if len(info_text) > len(desc):
                                desc = f"{title}. {info_text}"

                        posts.append({
                            "title": title,
                            "institution": institution,
                            "city": city or "Tüm Türkiye",
                            "published_at": published_date,
                            "deadline_at": None,
                            "original_url": href,
                            "description": desc
                        })

                    if posts:
                        self.logger.info(f"Yerel Yönetimler portalından {len(posts)} duyuru çekildi.")
                        return posts
        except Exception as e:
            self.logger.warning(f"Yerel Yönetimler HTTP isteği hatası: {e}")

        return posts

if __name__ == "__main__":
    scraper = YerelYonetimlerScraper()
    scraper.run()
