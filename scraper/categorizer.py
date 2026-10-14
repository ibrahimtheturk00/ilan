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

# Kategori Belirleme Kuralları (Öncelik ve Tam Kelime Eşleşmeli)
CATEGORY_PATTERNS = {
    'maliye': [
        r'\bmuhasebe\b', r'\bmaliye\b', r'\bgelir\s+uzman', r'\bvergi\b', r'\bdenetmen\b',
        r'\bdenetçi\b', r'\bdenetci\b', r'\bsayman\b', r'\biktisat\b', r'\bekonomist\b',
        r'\bfon\b', r'\bbankacılık\b', r'\bbankacilik\b', r'\bfinans\b', r'\bbütçe\b',
        r'\bbutce\b', r'\bisletme\b', r'\bişletme\b', r'\bbddk\b', r'\bspk\b', r'\btmsf\b',
        r'\bhazine\b', r'\bkalkınma\s+ajans', r'\bkalkinma\s+ajans'
    ],
    'bilisim': [
        r'\byazılım\b', r'\byazilim\b', r'\bbilişim\b', r'\bbilisim\b', r'\bprogramcı\b',
        r'\bprogramci\b', r'\bsistem\s+yöneticisi', r'\bveritabanı\b', r'\bağ\s+uzmanı',
        r'\bcyber\b', r'\bsiber\b', r'\bbilgisayar\b', r'\bçözümleyici\b', r'\bcozumleyici\b',
        r'\bveri\s+analist', r'\byapay\s+zeka', r'\bweb\s+tasarım'
    ],
    'hukuk': [
        r'\bavukat\b', r'\bhukuk\b', r'\bhakim\b', r'\bsavcı\b', r'\bsavci\b',
        r'\bicra\s+müdür', r'\bicra\b', r'\badli\b', r'\barabulucu\b', r'\bnoter\b',
        r'\bzabıt\s+katibi', r'\byargıtay\b', r'\byargitay\b'
    ],
    'muhendislik': [
        r'\bmühendis\b', r'\bmuhendis\b', r'\bmühendisliği\b', r'\bmuhendisligi\b',
        r'\bmühendisi\b', r'\bmuhendisi\b', r'\bmimar\b', r'\bmimarlık\b',
        r'\bşehir\s+plancısı', r'\btekniker\b', r'\bteknisyen\b', r'\bharita\b',
        r'\binşaat\b', r'\binsaat\b', r'\bmakine\b', r'\belektrik\b', r'\belektronik\b',
        r'\bjeoloji\b', r'\bmaden\b', r'\bendüstri\b'
    ],
    'saglik': [
        r'\bdoktor\b', r'\btabip\b', r'\bdiş\s+tabibi', r'\bhekim\b', r'\bhemşire\b', r'\bhemsire\b',
        r'\bebe\b', r'\bsağlık\s+teknikeri', r'\bsaglik\s+teknikeri', r'\bsağlık\s+memuru',
        r'\beczacı\b', r'\beczaci\b', r'\bbiyolog\b', r'\bpsikolog\b', r'\bfizyoterapist\b',
        r'\bhastane\b', r'\bsağlık\b', r'\bsaglik\b', r'\blaborant\b', r'\bdiyetisyen\b',
        r'\bacil\s+tıp', r'\btıp\s+fakültesi', r'\bveteriner\b', r'\bparamedik\b', r'\bmedikal\b'
    ],
    'buro': [
        r'\bbüro\s+personeli', r'\bburo\s+personeli', r'\bbüro\b', r'\bburo\b',
        r'\bv\.?h\.?k\.?i\b', r'\bveri\s+hazırlama', r'\bsekreter\b', r'\bsekreterlik\b',
        r'\bidari\s+personel\b', r'\bidari\s+memur\b', r'\bzabıt\s+katibi\b', r'\bkatip\b',
        r'\byazı\s+işleri\b', r'\barşiv\b', r'\bkütüphaneci\b', r'\bveznedar\b',
        r'\bambar\s+memuru\b', r'\bsantral\b', r'\bdanışma\s+görevlisi\b', r'\bmemur\s+kadroları\b'
    ],
    'egitim': [
        r'\böğretim\s+üyesi', r'\bogretim\s+uyesi', r'\böğretim\s+elemanı', r'\böğretim\s+görevlisi',
        r'\bogretim\s+gorevlisi', r'\baraştırma\s+görevlisi', r'\böğretmen\b', r'\bogretmen\b',
        r'\beğitmen\b', r'\bakademisyen\b', r'\bpedagog\b', r'\bprofesör\b', r'\bdoçent\b',
        r'\büniversite\b', r'\brektörlük\b'
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
    title_lower = turkish_lower(title)
    text_lower = turkish_lower(text)

    # 1. Önce sadece BAŞLIKTA ara (başlık her zaman en belirleyici alandır)
    for category, patterns in CATEGORY_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, title_lower):
                return category

    # 2. Başlıkta bulunamadıysa açıklamada ara
    for category, patterns in CATEGORY_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text_lower):
                return category

    return 'diger'

def categorize_job(title: str, text: str = "") -> Tuple[str, str]:
    """Her iki sınıflandırmayı tek seferde döndürür."""
    return detect_post_type(title, text), detect_category(title, text)

