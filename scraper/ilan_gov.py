import re
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx
from bs4 import BeautifulSoup

from base import BaseScraper
from normalizer import clean_text, parse_turkish_date

class IlanGovScraper(BaseScraper):
    """
    Basın İlan Kurumu (ilan.gov.tr) Resmi Kamu Personeli Alımı İlanları Scraper'ı.
    ilan.gov.tr resmi JSON API'si üzerinden 'Personel Alımı' ilanlarını çeker.
    """
    def __init__(self):
        super().__init__(source_slug="ilan-gov")
        self.api_url = "https://www.ilan.gov.tr/api/api/services/app/Ad/AdsByFilter"
        self.detail_url = "https://www.ilan.gov.tr/api/api/services/app/AdDetail/GetAdDetail"

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "X-Request-Origin": "IGT-UI",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json-patch+json",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://www.ilan.gov.tr/ilan/kategori/8/personel-alimi",
        }

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                # İlk 3 sayfayı (60 ilan) çek
                page_size = 20
                max_pages = 3

                for page in range(max_pages):
                    payload = {
                        "keys": {"txv": [8]},  # 8 = Personel Alımı kategorisi
                        "skipCount": page * page_size,
                        "maxResultCount": page_size
                    }

                    resp = client.post(self.api_url, json=payload)
                    if resp.status_code != 200:
                        self.logger.warning(f"İlan.gov.tr API sayfa {page} yanıt kodu: {resp.status_code}")
                        break

                    data = resp.json()
                    ads = data.get("result", {}).get("ads", [])
                    if not ads:
                        break

                    self.logger.info(f"İlan.gov.tr sayfa {page + 1}: {len(ads)} ilan bulundu.")

                    for ad in ads:
                        ad_id = ad.get("id")
                        if not ad_id:
                            continue

                        raw_title = (ad.get("title") or "").strip()
                        advertiser = (ad.get("advertiserName") or "").strip()
                        city = (ad.get("addressCityName") or "").strip() or None
                        url_str = ad.get("urlStr") or f"/ilan/{ad_id}"
                        original_url = f"https://www.ilan.gov.tr{url_str}"

                        # Başlık düzenlemesi
                        title = clean_text(raw_title)
                        if advertiser and not title.lower().startswith(advertiser.lower()[:10]):
                            full_title = f"{advertiser} - {title}"
                        else:
                            full_title = title

                        # Tarihleri filtrelerden veya doğrudan alanlardan çek
                        published_at = None
                        deadline_at = None

                        # 1. Start Date (ISO string)
                        start_raw = ad.get("publishStartDate")
                        if start_raw:
                            published_at = start_raw.split("T")[0]

                        # 2. adTypeFilters içindeki tarihler
                        for f in ad.get("adTypeFilters", []):
                            k = (f.get("key") or "").lower()
                            v = (f.get("value") or "").strip()
                            if "resm" in k or "yay" in k:
                                p_date = parse_turkish_date(v)
                                if p_date:
                                    published_at = p_date
                            elif "son" in k or "basvuru" in k or "bitis" in k:
                                d_date = parse_turkish_date(v)
                                if d_date:
                                    deadline_at = d_date

                        # Kategori ve açıklama
                        category_info = ""
                        for val in ad.get("values", []):
                            if val.get("key") == "Kategori":
                                category_info = val.get("value", "")

                        description = f"{advertiser} bünyesinde personel alımı ilanı. {category_info}".strip()

                        # Detay metnini GetAdDetail üzerinden çekmeyi dene
                        try:
                            detail_resp = client.get(f"{self.detail_url}?id={ad_id}", timeout=10.0)
                            if detail_resp.status_code == 200:
                                detail_data = detail_resp.json().get("result", {})
                                html_content = detail_data.get("content") or ""
                                if html_content:
                                    soup = BeautifulSoup(html_content, "html.parser")
                                    clean_content = soup.get_text(separator=" ", strip=True)
                                    if len(clean_content) > 30:
                                        description = clean_content[:800]
                                        # Açıklamadan son başvuru tarihi aranabilir
                                        if not deadline_at:
                                            m = re.search(r'(\d{1,2}[\./]\d{1,2}[\./]\d{4})', clean_content)
                                            if m:
                                                cand = parse_turkish_date(m.group(1))
                                                if cand and (not published_at or cand >= published_at):
                                                    deadline_at = cand
                        except Exception as det_err:
                            self.logger.debug(f"Detay çekme atlandı ({ad_id}): {det_err}")

                        posts.append({
                            "title": full_title,
                            "institution": advertiser or "Kamu Kurumu",
                            "city": city,
                            "published_at": published_at,
                            "deadline_at": deadline_at,
                            "original_url": original_url,
                            "description": description,
                        })

        except Exception as e:
            self.logger.error(f"İlan.gov.tr scraping hatası: {e}", exc_info=True)

        self.logger.info(f"İlan.gov.tr toplam {len(posts)} ilan başarıyla toplandı.")
        return posts

if __name__ == "__main__":
    scraper = IlanGovScraper()
    scraper.run()
