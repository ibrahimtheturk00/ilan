import re
import sys
import logging
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

def normalize_tr(text: str) -> str:
    return (
        (text or "")
        .lower()
        .replace("ç", "c")
        .replace("ğ", "g")
        .replace("ı", "i")
        .replace("i̇", "i")
        .replace("ö", "o")
        .replace("ş", "s")
        .replace("ü", "u")
    )


class OSYMScraper(BaseScraper):
    """ÖSYM KPSS Tercih ve Merkezi Yerleştirme Duyuruları Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="osym")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("ÖSYM duyuruları taranıyor...")
                res = client.get("https://www.osym.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["kpss", "tercih", "yerlestirme", "kadro", "sozlesmeli"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.osym.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": title,
                                    "institution": "ÖSYM (Ölçme, Seçme ve Yerleştirme Merkezi)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "memur",
                                    "category": "diger"
                                })
        except Exception as e:
            self.logger.warning(f"ÖSYM tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class SaglikYHGMScraper(BaseScraper):
    """Sağlık Bakanlığı Yönetim Hizmetleri Genel Müdürlüğü (YHGM) Duyuruları Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="saglik-yhgm")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Sağlık Bakanlığı YHGM duyuruları taranıyor...")
                res = client.get("https://yhgm.saglik.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["alim", "sozlesmeli", "kura", "atama", "hemsire", "tabip", "personel"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://yhgm.saglik.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Sağlık Bakanlığı - {title}",
                                    "institution": "T.C. Sağlık Bakanlığı (YHGM)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "saglik"
                                })
        except Exception as e:
            self.logger.warning(f"Sağlık YHGM tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class MEBScraper(BaseScraper):
    """Millî Eğitim Bakanlığı Personel Genel Müdürlüğü (MEB PGM) Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="meb-pgm")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("MEB Personel Genel Müdürlüğü taranıyor...")
                res = client.get("https://personel.meb.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["ogretmen", "atama", "alim", "sozlesmeli", "personel", "basvuru"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://personel.meb.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"MEB - {title}",
                                    "institution": "Millî Eğitim Bakanlığı (MEB)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "egitim"
                                })
        except Exception as e:
            self.logger.warning(f"MEB PGM tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class AileBakanligiScraper(BaseScraper):
    """Aile ve Sosyal Hizmetler Bakanlığı Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="aile-bakanligi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Aile ve Sosyal Hizmetler Bakanlığı taranıyor...")
                res = client.get("https://www.aile.gov.tr/duyurular")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["personel", "alim", "sozlesmeli", "asdep", "sinav", "basvuru"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.aile.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Aile ve Sosyal Hizmetler Bakanlığı - {title}",
                                    "institution": "T.C. Aile ve Sosyal Hizmetler Bakanlığı",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                                    "category": "diger"
                                })
        except Exception as e:
            self.logger.warning(f"Aile Bakanlığı tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class GIBScraper(BaseScraper):
    """Gelir İdaresi Başkanlığı (GİB) Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="gib")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            api_url = "https://gib.gov.tr/api/gibportal/duyuru/listPublish?preview=false&page=0&size=50&sortFieldName=startdate&sortType=DESC"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                "Content-Type": "application/json",
                "Referer": "https://www.gib.gov.tr/duyuru-arsivi/guncel",
                "Accept": "application/json, text/plain, */*"
            }
            with httpx.Client(timeout=25.0, headers=headers, follow_redirects=True, verify=False) as client:
                self.logger.info("Gelir İdaresi Başkanlığı resmi API'si taranıyor...")
                res = client.post(api_url, json={})
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("resultContainer", {}).get("content", [])
                    self.logger.info(f"GİB API'den {len(content)} adet duyuru kaydı alındı.")

                    kw_pattern = re.compile(r'\b(alim|alimi|alimlari|sinav|sinavi|sinavlari|kadro|kadrolari|uzman|personel|sozlesmeli|memur|yeterlik|mudurluk|mudur\s+yardimciligi|giris\s+sinavi|gorevde\s+yukselme|unvan\s+degisikligi)\b')

                    for item in content:
                        raw_title = (item.get("title") or "").strip()
                        norm = normalize_tr(raw_title)

                        # Valimiz/ziyaret gibi ilgisiz duyuruları ele, sadece alım ve sınav odaklı olanları al
                        if not kw_pattern.search(norm):
                            continue
                        if "ziyaret" in norm and not any(k in norm for k in ["sinav", "alim", "kadro", "personel"]):
                            continue

                        slug = item.get("slug") or str(item.get("id"))
                        full_url = f"https://www.gib.gov.tr/duyuru-arsivi/guncel/{slug}"

                        ts = item.get("ts") or item.get("startdate")
                        pub_date = ts.split("T")[0] if ts else None

                        desc_html = item.get("description") or ""
                        clean_desc = raw_title
                        if desc_html:
                            s = BeautifulSoup(desc_html, "html.parser")
                            text_desc = s.get_text(separator=" ", strip=True)
                            if len(text_desc) > 20:
                                clean_desc = text_desc[:800]

                        posts.append({
                            "title": f"Gelir İdaresi Başkanlığı - {raw_title}",
                            "institution": "Gelir İdaresi Başkanlığı (GİB)",
                            "city": "Ankara",
                            "published_at": pub_date,
                            "deadline_at": None,
                            "original_url": full_url,
                            "description": clean_desc,
                            "post_type": "memur",
                            "category": "maliye"
                        })
        except Exception as e:
            self.logger.warning(f"GİB tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class DiyanetScraper(BaseScraper):
    """Diyanet İşleri Başkanlığı Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="diyanet")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Diyanet İşleri Başkanlığı duyuruları taranıyor...")
                res = client.get("https://www.diyanet.gov.tr/tr-TR/Haberler/Indeks/19")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for post in soup.find_all("div", class_="post"):
                        title_el = post.find("h2", class_="post-title")
                        a = title_el.find("a", href=True) if title_el else None
                        if not a:
                            continue
                        
                        raw_title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(raw_title)
                        
                        # Alım, sınav veya personel duyuruları
                        if not any(k in norm for k in ["alim", "sinav", "personel", "sozlesmeli", "vaiz", "imam", "muezzin", "kuran", "kadro", "yerlestirme", "murakip", "atamalari"]):
                            continue
                        
                        href = a["href"]
                        full_url = href if href.startswith("http") else f"https://www.diyanet.gov.tr{href}"
                        
                        # Tarih
                        date_el = post.find("abbr", class_="post-date")
                        pub_date = None
                        if date_el:
                            d_txt = date_el.get_text(strip=True)
                            # Örn: 14.10.2026 veya 8.10.2026
                            d_parts = d_txt.split(".")
                            if len(d_parts) == 3:
                                d = d_parts[0].zfill(2)
                                m = d_parts[1].zfill(2)
                                y = d_parts[2]
                                pub_date = f"{y}-{m}-{d}"
                        
                        # Açıklama
                        content_el = post.find("div", class_="post-content")
                        desc = content_el.get_text(separator=" ", strip=True) if content_el else raw_title
                        if len(desc) < 20:
                            desc = raw_title

                        posts.append({
                            "title": f"Diyanet İşleri Başkanlığı - {raw_title}",
                            "institution": "T.C. Diyanet İşleri Başkanlığı",
                            "city": "Ankara",
                            "published_at": pub_date,
                            "deadline_at": None,
                            "original_url": full_url,
                            "description": desc,
                            "post_type": "sozlesmeli" if "sozlesmeli" in norm else "memur",
                            "category": "diger"
                        })
        except Exception as e:
            self.logger.warning(f"Diyanet tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class PolisAkademisiScraper(BaseScraper):
    """Polis Akademisi Başkanlığı (EGM) Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="polis-akademisi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Polis Akademisi Başkanlığı duyuruları taranıyor...")
                res = client.get("https://www.pa.edu.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["pomem", "pmyo", "paem", "polis", "ogrenci", "alim", "giris", "sinav"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.pa.edu.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Polis Akademisi - {title}",
                                    "institution": "T.C. Polis Akademisi Başkanlığı (EGM)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "memur",
                                    "category": "diger"
                                })
        except Exception as e:
            self.logger.warning(f"Polis Akademisi tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class JandarmaPTMScraper(BaseScraper):
    """Jandarma ve Sahil Güvenlik Akademisi (JSGA PTM) Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="jandarma-ptm")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Jandarma PTM duyuruları taranıyor...")
                res = client.get("https://vatandas.jandarma.gov.tr/ptm/giris")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["subay", "astsubay", "uzman erbas", "alim", "temin", "basvuru", "sozlesmeli"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://vatandas.jandarma.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Jandarma PTM - {title}",
                                    "institution": "Jandarma ve Sahil Güvenlik (JSGA PTM)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "memur",
                                    "category": "diger"
                                })
        except Exception as e:
            self.logger.warning(f"Jandarma PTM tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class TubitakKariyerScraper(BaseScraper):
    """TÜBİTAK Kariyer Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="tubitak-kariyer")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("TÜBİTAK Kariyer duyuruları taranıyor...")
                res = client.get("https://kariyer.tubitak.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["arastirmaci", "muhendis", "uzman", "teknisyen", "bursiyer", "personel", "alim"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://kariyer.tubitak.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"TÜBİTAK - {title}",
                                    "institution": "TÜBİTAK",
                                    "city": "Ankara",
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "isci" if "isci" in norm else "memur",
                                    "category": "muhendislik"
                                })
        except Exception as e:
            self.logger.warning(f"TÜBİTAK Kariyer tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class YokAkademikScraper(BaseScraper):
    """YÖK & Üniversiteler Akademik Kadro Alımları Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="yok-akademik")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("YÖK Akademik kadro alımları taranıyor...")
                res = client.get("https://akademik.yok.gov.tr")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["ogretim gorevlisi", "arastirma gorevlisi", "ogretim uyesi", "docent", "profesor", "akademik"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://akademik.yok.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": title,
                                    "institution": "Yükseköğretim Kurulu (YÖK Akademik)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
                                    "post_type": "akademik",
                                    "category": "egitim"
                                })
        except Exception as e:
            self.logger.warning(f"YÖK Akademik tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


# Geriye dönük uyumluluk aliası
KurumPortallariScraper = OSYMScraper

if __name__ == "__main__":
    scrapers = [
        OSYMScraper(),
        SaglikYHGMScraper(),
        MEBScraper(),
        AileBakanligiScraper(),
        GIBScraper(),
        DiyanetScraper(),
        PolisAkademisiScraper(),
        JandarmaPTMScraper(),
        TubitakKariyerScraper(),
        YokAkademikScraper()
    ]
    for s in scrapers:
        try:
            s.run()
        except Exception as err:
            logging.getLogger("KurumPortallari").error(f"'{s.source_slug}' taramasında hata: {err}")


