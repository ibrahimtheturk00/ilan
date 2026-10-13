import re
from typing import Tuple

def turkish_lower(text: str) -> str:
    """Türkçe karakterleri doğru şekilde küçük harfe dönüştürür."""
    if not text:
        return ""
    # Türkçe İ ve I harfleri dönüşümü
    mapping = {
        'İ': 'i', 'I': 'ı', 'Ş': 'ş', 'Ğ': 'ğ', 'Ü': 'ü', 'Ö': 'ö', 'Ç': 'ç'
    }
    for upper, lower in mapping.items():
        text = text.replace(upper, lower)
    # Python lower() ve kalan birleşik karakterleri (combining dot \u0307) temizle
    return text.lower().replace('\u0307', '')

# Post Type Belirleme Kuralları
POST_TYPE_PATTERNS = {
    'akademik': [
        r'öğretim\s+üyesi', r'profesör', r'doçent', r'doktor\s+öğretim',
        r'araştırma\s+görevlisi', r'öğretim\s+görevlisi', r'akademik', r'rektörlük'
    ],
    'sozlesmeli': [
        r'sözleşmeli', r'4/b', r'4-b', r'proje\s+personeli', r'geçici\s+personel',
        r'sözleşmeli\s+bilişim'
    ],
    'isci': [
        r'sürekli\s+işçi', r'geçici\s+işçi', r'işçi', r'temizlik\s+görevlisi',
        r'güvenlik\s+görevlisi', r'şoför', r'aşçı', r'teknisyen', r'operatör'
    ],
    'memur': [
        r'memur', r'uzman', r'denetçi', r'müfettiş', r'subay', r'astsubay', r'avukat',
        r'zabıta', r'itfaiye', r'v\.h\.k\.i', r'veri\s+hazırlama', r'kaymakam',
        r'idari\s+personel', r'icra\s+müdür', r'hakim', r'savcı'
    ]
}

# Kategori Belirleme Kuralları
CATEGORY_PATTERNS = {
    'bilisim': [
        r'yazılım', r'bilişim', r'programcı', r'sistem\s+yöneticisi', r'veritabanı',
        r'ağ\s+uzmanı', r'cyber', r'siber', r'bilgisayar', r'çözümleyici', r'veri\s+analist',
        r'teknoloji', r'yapay\s+zeka', r'web\s+tasarım'
    ],
    'saglik': [
        r'doktor', r'tabip', r'hemşire', r'ebe', r'sağlık\s+teknikeri', r'eczacı',
        r'biyolog', r'psikolog', r'fizyoterapist', r'hastane', r'sağlık', r'veteriner',
        r'laborant', r'diyetisyen', r'acil\s+tıp'
    ],
    'egitim': [
        r'öğretmen', r'eğitmen', r'öğretim', r'akademisyen', r'anaokulu', r'pedagog',
        r'profesör', r'doçent', r'üniversite', r'eğitim'
    ],
    'muhendislik': [
        r'mühendis', r'mimar', r'şehir\s+plancısı', r'tekniker', r'harita',
        r'inşaat', r'makine', r'elektrik', r'elektronik', r'ziraat\s+mühendis'
    ],
    'hukuk': [
        r'avukat', r'hukuk', r'hakim', r'savcı', r'icra\s+müdürü', r'icra', r'adli',
        r'arabulucu', r'noter', r'zabıt\s+katibi'
    ],
    'maliye': [
        r'muhasebe', r'maliye', r'gelir\s+uzmanı', r'vergi', r'denetmen', r'sayman',
        r'iktisat', r'ekonomist', r'fon', r'bankacılık', r'finans', r'bütçe'
    ]
}

def detect_post_type(title: str, text: str = "") -> str:
    """İlan başlığı ve içeriğinden kadro türünü tespit eder."""
    combined = turkish_lower(f"{title} {text}")
    for post_type, patterns in POST_TYPE_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, combined):
                return post_type
    return 'memur' if 'personel' in combined else 'diger'

def detect_category(title: str, text: str = "") -> str:
    """İlan başlığı ve içeriğinden meslek kategorisini tespit eder."""
    combined = turkish_lower(f"{title} {text}")
    for category, patterns in CATEGORY_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, combined):
                return category
    return 'diger'

def categorize_job(title: str, text: str = "") -> Tuple[str, str]:
    """Her iki sınıflandırmayı tek seferde döndürür."""
    return detect_post_type(title, text), detect_category(title, text)

