import re
from typing import Tuple

# Post Type Belirleme Kuralları
POST_TYPE_PATTERNS = {
    'akademik': [
        r'öğretim\s+üyesi', r'profesör', r'doçent', r'doktor\s+öğretim',
        r'araştırma\s+görevlisi', r'öğretim\s+görevlisi', r'akademik', r'rektörlük'
    ],
    'sozlesmeli': [
        r'sözleşmeli', r'4/b', r'4-b', r'proje\s+personeli', r'geçici\s+personel'
    ],
    'isci': [
        r'sürekli\s+işçi', r'geçici\s+işçi', r'işçi', r'temizlik\s+görevlisi',
        r'güvenlik\s+görevlisi', r'şoför', r'aşçı', r'teknisyen', r'operatör'
    ],
    'memur': [
        r'memur', r'uzman\s+yardımcısı', r'müfettiş\s+yardımcısı', r'denetçi',
        r'zabıta', r'itfaiye', r'v.h.k.i', r'veri\s+hazırlama', r'kaymakam', r'idari\s+personel'
    ]
}

# Kategori Belirleme Kuralları
CATEGORY_PATTERNS = {
    'bilisim': [
        r'yazılım', r'bilişim', r'programcı', r'sistem\s+yöneticisi', r'veritabanı',
        r'ağ\s+uzmanı', r'cyber', r'siber', r'bilgisayar', r'çözümleyici'
    ],
    'saglik': [
        r'doktor', r'tabip', r'hemşire', r'ebe', r'sağlık\s+teknikeri', r'eczacı',
        r'biyolog', r'psikolog', r'fizyoterapist', r'hastane', r'sağlık'
    ],
    'egitim': [
        r'öğretmen', r'eğitmen', r'öğretim', r'akademisyen', r'anaokulu', r'pedagog'
    ],
    'muhendislik': [
        r'mühendis', r'mimar', r'şehir\s+plancısı', r'tekniker', r'harita'
    ],
    'hukuk': [
        r'avukat', r'hukuk', r'hakim', r'savcı', r'icra\s+müdürü', r'adli'
    ],
    'maliye': [
        r'muhasebe', r'maliye', r'gelir\s+uzmanı', r'vergi', r'denetmen', r'sayman',
        r'iktisat', r'ekonomist'
    ]
}

def detect_post_type(title: str, text: str = "") -> str:
    """İlan başlığı ve içeriğinden kadro türünü tespit eder."""
    combined = f"{title} {text}".lower()
    for post_type, patterns in POST_TYPE_PATTERNS.items():
        for pat in patterns:
            if re.search(r'\b' + pat, combined):
                return post_type
    return 'diger'

def detect_category(title: str, text: str = "") -> str:
    """İlan başlığı ve içeriğinden meslek kategorisini tespit eder."""
    combined = f"{title} {text}".lower()
    for category, patterns in CATEGORY_PATTERNS.items():
        for pat in patterns:
            if re.search(r'\b' + pat, combined):
                return category
    return 'diger'

def categorize_job(title: str, text: str = "") -> Tuple[str, str]:
    """Her iki sınıflandırmayı tek seferde döndürür."""
    return detect_post_type(title, text), detect_category(title, text)
