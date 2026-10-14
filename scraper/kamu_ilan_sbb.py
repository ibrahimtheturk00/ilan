import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from base import BaseScraper
from normalizer import parse_turkish_date_range, clean_text

class KamuIlanSbbScraper(BaseScraper):
    """
    Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı (kamuilan.sbb.gov.tr) Scraper'ı.
    Tüm güncel kamu kurum ve kuruluşları alım ilanlarını canlı olarak çeker.
    """
    def __init__(self):
        super().__init__(source_slug="kamu-ilan-sbb")

    def scrape(self) -> List[Dict[str, Any]]:
        posts = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Referer": "https://kamuilan.sbb.gov.tr/"
        }

        url = "https://kamuilan.sbb.gov.tr/"

        # Kariyer Kapısı doğrudan IlanDetay tekil başvuru haritasını çek
        kariyer_kapisi_map = {}
        try:
            with httpx.Client(timeout=10.0) as kk_client:
                kk_resp = kk_client.post(
                    "https://api.kariyerkapisi.gov.tr/api/ilan/SearchIlanPublic",
                    json={"krM_ID": 0, "searchText": "", "il": "0", "ilanTuru": "0"},
                    headers={"Content-Type": "application/json", "Origin": "https://kariyerkapisi.gov.tr"}
                )
                if kk_resp.status_code == 200:
                    for it in kk_resp.json():
                        k_name = (it.get("kurumAdi") or "").strip().lower()
                        k_guid = it.get("guid")
                        if k_name and k_guid:
                            kariyer_kapisi_map[k_name] = f"https://kariyerkapisi.gov.tr/IlanDetay?i={k_guid}"
        except Exception as e:
            self.logger.warning(f"Kariyer Kapısı haritası yüklenemedi: {e}")

        try:
            with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True, verify=False) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    
                    # SBB anasayfasındaki tüm ilan linkleri: a[href*='ilandetay.aspx']
                    links = soup.find_all("a", href=lambda h: h and "ilandetay.aspx" in h.lower())
                    self.logger.info(f"SBB sayfasında {len(links)} adet ilan kartı bulundu.")

                    for a in links:
                        # 1. Tip: Üst kartlar (.black, .patrol, .h5date)
                        black_el = a.select_one(".black")
                        patrol_el = a.select_one(".patrol")
                        date_el = a.select_one(".h5date")

                        # 2. Tip: Alt kartlar (.alt_p1, .alt_p2, em)
                        alt_p1 = a.select_one(".alt_p1")
                        alt_p2 = a.select_one(".alt_p2")

                        institution = ""
                        title_info = ""
                        date_text = ""

                        if black_el or patrol_el:
                            institution = clean_text(black_el.get_text(strip=True)) if black_el else "Kamu Kurumu"
                            title_info = clean_text(patrol_el.get_text(strip=True)) if patrol_el else "Personel Alımı"
                            date_text = clean_text(date_el.get_text(strip=True)) if date_el else ""
                        elif alt_p1 or alt_p2:
                            institution = clean_text(alt_p1.get_text(strip=True)) if alt_p1 else "Kamu Kurumu"
                            if alt_p2:
                                em = alt_p2.select_one("em")
                                if em:
                                    date_text = clean_text(em.get_text(strip=True)).strip("()")
                                    em.decompose()
                                title_info = clean_text(alt_p2.get_text(strip=True))
                        else:
                            continue

                        full_title = f"{institution} {title_info}".strip()
                        if len(full_title) < 5:
                            continue

                        published_at, deadline_at = parse_turkish_date_range(date_text)

                        href = a.get("href", "")
                        if not href.startswith("http"):
                            href = f"https://kamuilan.sbb.gov.tr/{href.lstrip('/')}"

                        description = f"{institution} bünyesinde istihdam edilmek üzere personel alım ilanı. Başvuru Şartları: {title_info}. Başvuru Tarihleri: {date_text}."

                        # Kariyer Kapısı doğrudan tekil başvuru ekranı eşleştirmesi
                        final_url = href
                        inst_lower = institution.lower()
                        for kk_inst, kk_url in kariyer_kapisi_map.items():
                            if (kk_inst in inst_lower or inst_lower in kk_inst) and len(inst_lower) > 5:
                                final_url = kk_url
                                break

                        # SBB doğrudan PDF hotlink engeli varsa ve Kariyer Kapısı ile eşleşmediyse resmi web adresini ata
                        if final_url == href and "kamuilan.sbb.gov.tr" in final_url:
                            norm = inst_lower.replace("ç","c").replace("ğ","g").replace("ı","i").replace("i̇","i").replace("ö","o").replace("ş","s").replace("ü","u")
                            if "jandarma" in norm: final_url = "https://vatandas.jandarma.gov.tr/ptm/giris"
                            elif "milli savunma" in norm or "msb" in norm: final_url = "https://personeltemin.msb.gov.tr/"
                            elif "yargitay" in norm: final_url = "https://www.yargitay.gov.tr/"
                            elif "gelir idaresi" in norm or "gib" in norm: final_url = "https://www.gib.gov.tr/"
                            elif "iett" in norm: final_url = "https://iett.istanbul/"
                            elif "iletisim" in norm: final_url = "https://kariyerkapisi.gov.tr/isealim"
                            elif "orta karadeniz" in norm or "oka" in norm: final_url = "https://www.oka.ka.gov.tr/"
                            elif "mevlana" in norm or "mevka" in norm: final_url = "https://www.mevka.org.tr/"
                            else:
                                uni_map = {
                                    "sakarya": "https://www.subu.edu.tr/", "subu": "https://www.subu.edu.tr/",
                                    "canakkale": "https://www.comu.edu.tr/", "yildiz": "https://www.yildiz.edu.tr/",
                                    "medeniyet": "https://www.medeniyet.edu.tr/", "ondokuz mayis": "https://www.omu.edu.tr/",
                                    "erbakan": "https://www.erbakan.edu.tr/", "sirnak": "https://www.sirnak.edu.tr/",
                                    "bandirma": "https://www.bandirma.edu.tr/", "marmara": "https://www.marmara.edu.tr/",
                                    "giresun": "https://www.giresun.edu.tr/", "bozok": "https://bozok.edu.tr/",
                                    "siirt": "https://www.siirt.edu.tr/", "bogazici": "https://www.boun.edu.tr/",
                                    "dicle": "https://www.dicle.edu.tr/", "akdeniz": "https://www.akdeniz.edu.tr/",
                                    "artvin": "https://www.artvin.edu.tr/", "ahi evran": "https://www.ahievran.edu.tr/",
                                    "haci bayram": "https://hacibayram.edu.tr/", "isparta": "https://isparta.edu.tr/",
                                    "samsun": "https://samsun.edu.tr/", "igdir": "https://www.igdir.edu.tr/",
                                    "adiyaman": "https://www.adiyaman.edu.tr/", "adnan menderes": "https://www.adu.edu.tr/",
                                    "balikesir": "https://www.baun.edu.tr/", "karatekin": "https://www.karatekin.edu.tr/",
                                    "cankiri": "https://www.karatekin.edu.tr/", "usak": "https://www.usak.edu.tr/",
                                    "suleyman demirel": "https://w3.sdu.edu.tr/", "yuzuncu yil": "https://www.yyu.edu.tr/",
                                    "turk-alman": "https://www.tau.edu.tr/", "alaaddin keykubat": "https://www.alanya.edu.tr/",
                                    "gaziosmanpasa": "https://www.gop.edu.tr/", "tokat": "https://www.gop.edu.tr/",
                                    "eskisehir": "https://www.eskisehir.edu.tr/", "duzce": "https://duzce.edu.tr/",
                                    "ankara": "https://www.ankara.edu.tr/", "ataturk": "https://atauni.edu.tr/",
                                    "batman": "https://batman.edu.tr/", "itu": "https://www.itu.edu.tr/"
                                }
                                for u_key, u_url in uni_map.items():
                                    if u_key in norm:
                                        final_url = u_url
                                        break
                                if final_url == href:
                                    bel_map = {
                                        "sariidris": "https://sariidris.bel.tr/", "eleskirt": "http://www.eleskirt.bel.tr/",
                                        "sile": "https://www.sile.bel.tr/", "celtik": "https://www.celtik.bel.tr/",
                                        "kesan": "https://www.kesan.bel.tr/", "ortahisar": "https://www.ortahisar.bel.tr/",
                                        "inebolu": "https://www.inebolu.bel.tr/", "malazgirt": "https://www.malazgirt.bel.tr/",
                                        "rize": "https://rize.bel.tr/", "posof": "https://posof.bel.tr/",
                                        "atalan": "https://www.atalan.bel.tr/", "elmakaya": "https://elmakaya.bel.tr/",
                                        "mucur": "https://mucur.bel.tr/", "didim": "https://www.didim.bel.tr/",
                                        "gerede": "https://gerede.bel.tr/", "pursaklar": "https://www.pursaklar.bel.tr/",
                                        "taskesti": "https://www.taskesti.bel.tr/", "aralik": "https://www.aralik.bel.tr/",
                                        "cukurkuyu": "https://cukurkuyu.bel.tr/"
                                    }
                                    for b_key, b_url in bel_map.items():
                                        if b_key in norm:
                                            final_url = b_url
                                            break
                                if final_url == href and ("belediye" in norm or "belediyesi" in norm):
                                    final_url = "https://yerelyonetimler.csb.gov.tr/"
                                elif final_url == href and ("universite" in norm or "universitesi" in norm):
                                    final_url = "https://kariyerkapisi.gov.tr/isealim"

                        posts.append({
                            "title": full_title,
                            "institution": institution,
                            "published_at": published_at,
                            "deadline_at": deadline_at,
                            "original_url": final_url,
                            "description": description,
                        })
        except Exception as e:
            self.logger.error(f"Kamu İlan SBB scraping hatası: {e}", exc_info=True)

        return posts

if __name__ == "__main__":
    scraper = KamuIlanSbbScraper()
    scraper.run()
