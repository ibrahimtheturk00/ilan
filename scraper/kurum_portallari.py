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

TR_MONTHS = {
    "ocak": "01", "subat": "02", "mart": "03", "nisan": "04", "mayis": "05", "haziran": "06",
    "temmuz": "07", "agustos": "08", "eylul": "09", "ekim": "10", "kasim": "11", "aralik": "12"
}

def parse_tr_date(date_str: str) -> str | None:
    if not date_str:
        return None
    m_num = re.search(r"(\d{2})[./-](\d{2})[./-](\d{4})", date_str)
    if m_num:
        return f"{m_num.group(3)}-{m_num.group(2)}-{m_num.group(1)}"
    clean = re.sub(r"[^a-zA-Z0-9\s]", "", normalize_tr(date_str))
    parts = clean.split()
    if len(parts) >= 3 and parts[0].isdigit() and parts[2].isdigit():
        d = parts[0].zfill(2)
        m = TR_MONTHS.get(parts[1], "01")
        y = parts[2]
        return f"{y}-{m}-{d}"
    return None

def fetch_html_resilient(url: str, timeout: float = 20.0) -> str:
    try:
        with httpx.Client(timeout=timeout, headers=HEADERS, follow_redirects=True, verify=False) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                return resp.text
    except Exception:
        pass
    try:
        import subprocess
        cmd = ["curl.exe" if sys.platform == "win32" else "curl", "-s", "-k", "-L", "-A", HEADERS["User-Agent"], url]
        return subprocess.check_output(cmd, encoding="utf-8", errors="ignore")
    except Exception:
        return ""


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
            self.logger.info("Diyanet İşleri Başkanlığı duyuruları taranıyor...")
            html = fetch_html_resilient("https://diyanet.gov.tr/duyurular")
            if html:
                soup = BeautifulSoup(html, "html.parser")
                cards = soup.select("div.group.glass-card")
                for card in cards:
                    a = card.find("a", href=True)
                    h2 = card.find("h2")
                    time_el = card.find("time")
                    if not a or not h2:
                        continue

                    raw_title = h2.get_text(separator=" ", strip=True)
                    norm = normalize_tr(raw_title)
                    href = a["href"]
                    full_url = href if href.startswith("http") else f"https://diyanet.gov.tr{href}"
                    date_str = time_el.get_text(strip=True) if time_el else None
                    pub_date = parse_tr_date(date_str)

                    desc_el = card.find("p")
                    desc = desc_el.get_text(separator=" ", strip=True) if desc_el else raw_title

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
    """Polis Akademisi Başkanlığı (EGM) Scraper'ı (Resmî JSON API)."""
    def __init__(self):
        super().__init__(source_slug="polis-akademisi")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            self.logger.info("Polis Akademisi Başkanlığı duyuruları taranıyor...")
            api_headers = {
                **HEADERS,
                "X-Requested-With": "XMLHttpRequest"
            }
            with httpx.Client(timeout=25.0, headers=api_headers, follow_redirects=True, verify=False) as client:
                res = client.get("https://www.pa.edu.tr/Home/AnasayfaDuyurular?Adet=25&DilKodu=1")
                if res.status_code == 200:
                    import json
                    data = res.json()
                    raw_inner = data.get("data")
                    if raw_inner:
                        items = json.loads(json.loads(raw_inner)) if isinstance(raw_inner, str) else raw_inner
                        for it in items:
                            title = it.get("HaberBaslik", "").strip()
                            if not title or len(title) < 10:
                                continue
                            seo = it.get("HaberSeo", "").strip()
                            full_url = f"https://www.pa.edu.tr/duyuru/{seo}" if seo else "https://www.pa.edu.tr/duyurular"
                            raw_date = it.get("HaberTarihi", "")
                            pub_date = raw_date[:10] if raw_date and len(raw_date) >= 10 else None
                            desc = it.get("HaberIcerik", "") or title
                            clean_desc = re.sub(r"<[^>]+>", " ", desc).strip() or title

                            posts.append({
                                "title": f"Polis Akademisi - {title}",
                                "institution": "T.C. Polis Akademisi Başkanlığı (EGM)",
                                "city": "Ankara",
                                "published_at": pub_date,
                                "deadline_at": None,
                                "original_url": full_url,
                                "description": clean_desc,
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
        self.logger.info("Jandarma PTM duyuruları taranıyor...")

        # 1. Playwright ile Dinamik Sayfayı Çekme
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://personeltemin.jandarma.gov.tr", timeout=30000, wait_until="networkidle")
                tables = page.query_selector_all("table")
                for table in tables:
                    rows = table.query_selector_all("tbody tr")
                    for r in rows:
                        text = r.inner_text().strip()
                        lines = [l.strip() for l in text.split("\n") if l.strip()]
                        if not lines:
                            continue
                        title = lines[1] if len(lines) > 1 and lines[0].isdigit() else lines[0]
                        if len(title) < 10:
                            continue

                        start_date, end_date = None, None
                        for idx, line in enumerate(lines):
                            if any(k in line for k in ["Başlama", "Baslama", "Yayın", "Yayin"]):
                                if idx + 1 < len(lines):
                                    start_date = parse_tr_date(lines[idx + 1])
                            elif any(k in line for k in ["Bitiş", "Bitis"]):
                                if idx + 1 < len(lines):
                                    end_date = parse_tr_date(lines[idx + 1])

                        slug_id = re.sub(r"[^a-zA-Z0-9]+", "-", title[:40].lower()).strip("-")
                        posts.append({
                            "title": f"Jandarma - {title}",
                            "institution": "Jandarma Genel Komutanlığı (JSGA)",
                            "city": "Ankara",
                            "published_at": start_date,
                            "deadline_at": end_date,
                            "original_url": f"https://personeltemin.jandarma.gov.tr/#temin-{slug_id}",
                            "description": title,
                            "post_type": "sozlesmeli" if "sozlesmeli" in normalize_tr(title) else "memur",
                            "category": "diger"
                        })
                browser.close()
        except Exception as e:
            self.logger.warning(f"Jandarma PTM Playwright uyarısı: {e}")

        # 2. Fallback olarak httpx
        if not posts:
            try:
                html = fetch_html_resilient("https://personeltemin.jandarma.gov.tr")
                if html:
                    soup = BeautifulSoup(html, "html.parser")
                    for a in soup.find_all("a", href=True):
                        t = a.get_text(strip=True)
                        if len(t) >= 15 and any(k in normalize_tr(t) for k in ["subay", "astsubay", "uzman", "erbas", "temin", "alim"]):
                            slug_id = re.sub(r"[^a-zA-Z0-9]+", "-", t[:40].lower()).strip("-")
                            posts.append({
                                "title": f"Jandarma - {t}",
                                "institution": "Jandarma Genel Komutanlığı (JSGA)",
                                "city": "Ankara",
                                "published_at": None,
                                "deadline_at": None,
                                "original_url": f"https://personeltemin.jandarma.gov.tr/#temin-{slug_id}",
                                "description": t,
                                "post_type": "memur",
                                "category": "diger"
                            })
            except Exception as e:
                self.logger.warning(f"Jandarma PTM fallback uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class TubitakKariyerScraper(BaseScraper):
    """TÜBİTAK Kariyer Scraper'ı (Açık Pozisyonlar Portalı)."""
    def __init__(self):
        super().__init__(source_slug="tubitak-kariyer")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        self.logger.info("TÜBİTAK Kariyer açık pozisyonları taranıyor...")

        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://kariyer.tubitak.gov.tr/anasayfa-ilan-listesi", timeout=25000, wait_until="domcontentloaded")
                page.wait_for_timeout(4000)
                html = page.content()
                browser.close()

                soup = BeautifulSoup(html, "html.parser")
                cards = soup.find_all("div", class_="job-card-selection-wrapper")
                for c in cards:
                    parts = [p.strip() for p in c.get_text(separator="|", strip=True).split("|") if p.strip()]
                    date_val, city_val, code_val, title_val = None, "Ankara", None, "Araştırmacı"
                    for pt in parts:
                        if "/" in pt and len(pt) == 10:
                            date_val = parse_tr_date(pt)
                        elif pt.upper() in ["GEBZE", "ANKARA", "KOCAELİ", "İSTANBUL", "BURSA", "ANTALYA", "KONYA"]:
                            city_val = pt.capitalize()
                        elif pt.startswith("TBTK."):
                            code_val = pt
                        elif pt in ["Aday Araştırmacı", "Araştırmacı", "Uzman", "Mühendis", "Teknik Personel", "İdari Personel"]:
                            title_val = pt

                    full_title = f"TÜBİTAK - {title_val}"
                    if code_val:
                        full_title += f" ({code_val})"

                    slug_id = re.sub(r"[^a-zA-Z0-9]+", "-", (code_val or title_val)).lower().strip("-")
                    posts.append({
                        "title": full_title,
                        "institution": "TÜBİTAK",
                        "city": city_val,
                        "published_at": None,
                        "deadline_at": date_val,
                        "original_url": f"https://kariyer.tubitak.gov.tr/anasayfa-ilan-listesi#{slug_id}",
                        "description": full_title,
                        "post_type": "isci" if "isci" in normalize_tr(full_title) else "memur",
                        "category": "muhendislik"
                    })
        except Exception as e:
            self.logger.warning(f"TÜBİTAK Kariyer tarama uyarısı: {e}")

        seen = set()
        return [p for p in posts if p["title"] not in seen and not seen.add(p["title"])]


class YokAkademikScraper(BaseScraper):
    """YÖK & Üniversiteler Akademik ve Personel Kadro Alımları Scraper'ı."""
    def __init__(self):
        super().__init__(source_slug="yok-akademik")

    def scrape(self) -> List[Dict[str, Any]]:
        posts: List[Dict[str, Any]] = []
        try:
            self.logger.info("YÖK resmî kadro ve personel duyuruları taranıyor...")
            with httpx.Client(timeout=25.0, headers=HEADERS, follow_redirects=True, verify=False) as client:
                res = client.get("https://www.yok.gov.tr/tr/announcements")
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    for a in soup.find_all("a", href=True):
                        if "/announcements/" in a["href"] and a.get_text(strip=True) != "Detay" and not a.find("img"):
                            raw_title = a.get_text(separator=" ", strip=True)
                            norm = normalize_tr(raw_title)

                            if not any(k in norm for k in ["personel", "alim", "kadro", "rektor", "sozlesmeli", "ogrenci", "sinav", "akademik", "yerlestirme", "aday"]):
                                continue

                            href = a["href"]
                            full_url = href if href.startswith("http") else f"https://www.yok.gov.tr{href}"

                            container = a.find_parent("div", class_="item") or a.find_parent("div")
                            desc = container.get_text(separator=" ", strip=True) if container else raw_title

                            date_match = re.search(r"(\d{1,2}\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]+\s+\d{4})", desc)
                            pub_date = parse_tr_date(date_match.group(1)) if date_match else None

                            posts.append({
                                "title": f"YÖK - {raw_title}",
                                "institution": "Yükseköğretim Kurulu (YÖK)",
                                "city": "Ankara",
                                "published_at": pub_date,
                                "deadline_at": None,
                                "original_url": full_url,
                                "description": desc,
                                "post_type": "akademik" if any(x in norm for x in ["akademik", "rektor", "ogretim"]) else "memur",
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


