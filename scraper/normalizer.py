import re
from datetime import datetime
from typing import Optional, Tuple

TURKISH_CITIES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
    "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
    "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
    "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
    "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
    "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
    "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak",
    "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman",
    "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
]

TURKISH_MONTHS = {
    "ocak": "01", "şubat": "02", "mart": "03", "nisan": "04",
    "mayıs": "05", "haziran": "06", "temmuz": "07", "ağustos": "08",
    "eylül": "09", "ekim": "10", "kasım": "11", "aralık": "12"
}

def clean_text(text: Optional[str]) -> str:
    """Metin içindeki fazla boşlukları ve karakter bozulmalarını temizler."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def normalize_city(text: str) -> Optional[str]:
    """Metin içinden veya kurum adından Türkiye ilini tespit eder."""
    if not text:
        return None
    lower_text = text.lower()
    for city in TURKISH_CITIES:
        pattern = r'\b' + re.escape(city.lower()) + r'\b'
        if re.search(pattern, lower_text):
            return city
    # Yerel yönetim (belediye, kaymakamlık vb.) değilse ve merkezi kamu kurumu ise Ankara merkezlidir
    is_local_gov = any(k in lower_text for k in ["belediye", "belediyesi", "kaymakamlığ", "valiliğ", "özel idare", "ilçe"])
    if not is_local_gov and any(k in lower_text for k in ["bakanlığı", "başkanlığı", "müsteşarlığı", "genel müdürlüğü", "yargıtay", "danıştay", "sayıştay"]):
        return "Ankara"
    return None

def parse_turkish_date(date_str: Optional[str]) -> Optional[str]:
    """
    Farklı formatlardaki tarih stringlerini YYYY-MM-DD ISO formatına dönüştürür.
    Yıl belirtilmemişse geçerli yılı otomatik olarak atar.
    """
    if not date_str:
        return None
    
    date_str = date_str.strip().lower()
    curr_year = datetime.now().year
    
    # ISO format kontrolü
    iso_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if iso_match:
        return f"{iso_match.group(1)}-{iso_match.group(2)}-{iso_match.group(3)}"
        
    # Gün.Ay.Yıl formatı (15.10.2026 veya 15/10/2026)
    dot_match = re.search(r'(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})', date_str)
    if dot_match:
        day = dot_match.group(1).zfill(2)
        month = dot_match.group(2).zfill(2)
        raw_year = dot_match.group(3)
        year = raw_year if len(raw_year) == 4 else f"20{raw_year}"
        return f"{year}-{month}-{day}"

    # Türkçe Ay adı formatı (15 Ekim veya 15 Ekim 2026)
    for m_name, m_num in TURKISH_MONTHS.items():
        if m_name in date_str:
            name_match = re.search(rf'(\d{{1,2}})\s+{m_name}(?:\s+(\d{{4}}))?', date_str)
            if name_match:
                day = name_match.group(1).zfill(2)
                year = name_match.group(2) or str(curr_year)
                return f"{year}-{m_num}-{day}"

    return None

def parse_turkish_date_range(range_str: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    '12 Ekim - 26 Ekim' veya '02.10.2026 - 15.10.2026' gibi tarih aralıklarını ayrıştırır.
    Döndürür: (published_at, deadline_at)
    """
    if not range_str:
        return None, None
        
    parts = range_str.split('-')
    if len(parts) >= 2:
        start = parse_turkish_date(parts[0].strip())
        end = parse_turkish_date(parts[1].strip())
        return start, end
    else:
        single = parse_turkish_date(range_str)
        return single, single

def extract_position_count(text: str) -> Optional[int]:
    """Metin içinden 'X adet', 'X kişi', 'X personel' gibi kadro sayılarını bulur. Tarih ve yılları (örn. 2026) eler."""
    if not text:
        return None
    # 1 ile 5 basamaklı sayıları ara (Sağlık Bakanlığı 15.000, MEB 20.000 gibi kitlesel alımları da kapsar)
    matches = re.finditer(r'\b(\d{1,5})\s*(adet|kişi|personel|memur|işçi|öğretim\s+üyesi|uzman|subay|mühendis|avukat|müdür|sağlık\s+personeli|öğretmen)', text, re.IGNORECASE)
    for match in matches:
        try:
            val = int(match.group(1))
            # Takvim yılı kontrolü (2020..2035) örn. "2026 Personel Alımı"
            if 2020 <= val <= 2035:
                continue
            # 50.000'den büyük sayılar veya 0 elenir
            if val > 50000 or val <= 0:
                continue
            return val
        except ValueError:
            continue
    return None

