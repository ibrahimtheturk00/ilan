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
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                self.logger.info("Gelir İdaresi Başkanlığı taranıyor...")
                res = client.get("https://www.gib.gov.tr/kurumsal/duyurular")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["uzman", "yardimcisi", "alim", "sinav", "giris", "kadro"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.gib.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Gelir İdaresi Başkanlığı - {title}",
                                    "institution": "Gelir İdaresi Başkanlığı (GİB)",
                                    "city": None,
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
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
                res = client.get("https://www.diyanet.gov.tr/tr-TR/Kurumsal/Duyurular")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        title = a.get_text(separator=" ", strip=True)
                        norm = normalize_tr(title)
                        if any(k in norm for k in ["alim", "sinav", "personel", "sozlesmeli", "vaiz", "imam", "muezzin", "kuran", "kadro"]):
                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.diyanet.gov.tr{href}"
                            if len(title) >= 15:
                                posts.append({
                                    "title": f"Diyanet İşleri Başkanlığı - {title}",
                                    "institution": "T.C. Diyanet İşleri Başkanlığı",
                                    "city": "Ankara",
                                    "published_at": None,
                                    "deadline_at": None,
                                    "original_url": full_url,
                                    "description": title,
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


