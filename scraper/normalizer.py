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
    """Metin içindeki fazla boşlukları, özel karakter bozulmalarını temizler."""
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
    return None

def parse_turkish_date(date_str: Optional[str]) -> Optional[str]:
    """
    Farklı formatlardaki tarih stringlerini YYYY-MM-DD ISO formatına dönüştürür.
    Örnekler:
    - '15.10.2024' -> '2024-10-15'
    - '15 Ekim 2024' -> '2024-10-15'
    - '2024-10-15T09:00:00' -> '2024-10-15'
    """
    if not date_str:
        return None
    
    date_str = date_str.strip().lower()
    
    # ISO format kontrolü
    iso_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if iso_match:
        return f"{iso_match.group(1)}-{iso_match.group(2)}-{iso_match.group(3)}"
        
    # Gün.Ay.Yıl formatı (15.10.2024 veya 15/10/2024)
    dot_match = re.search(r'(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})', date_str)
    if dot_match:
        day = dot_match.group(1).zfill(2)
        month = dot_match.group(2).zfill(2)
        year = dot_match.group(3)
        return f"{year}-{month}-{day}"

    # Türkçe Ay adı formatı (15 Ekim 2024)
    for m_name, m_num in TURKISH_MONTHS.items():
        if m_name in date_str:
            name_match = re.search(rf'(\d{{1,2}})\s+{m_name}\s+(\d{{4}})', date_str)
            if name_match:
                day = name_match.group(1).zfill(2)
                year = name_match.group(2)
                return f"{year}-{m_num}-{day}"

    return None

def extract_position_count(text: str) -> Optional[int]:
    """Metin içinden 'X adet', 'X kişi', 'X personel' gibi kadro sayılarını bulur."""
    if not text:
        return None
    match = re.search(r'(\d+)\s*(adet|kişi|personel|memur|işçi|öğretim\s+üyesi)', text, re.IGNORECASE)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            pass
    return None
