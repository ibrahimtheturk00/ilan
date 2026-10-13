import hashlib
from typing import Optional

def generate_url_hash(url: str) -> str:
    """
    Verilen URL için tutarlı ve benzersiz bir SHA-256 hash üretir.
    URL'in query parametrelerindeki gereksiz boşlukları ve şema farklılıklarını normalize eder.
    """
    clean_url = url.strip()
    return hashlib.sha256(clean_url.encode("utf-8")).hexdigest()

def generate_content_hash(title: str, institution: Optional[str] = None, deadline: Optional[str] = None) -> str:
    """
    İlan içeriğindeki kritik alanlara (başlık, kurum, son başvuru tarihi)
    dayalı bir SHA-256 parmak izi üretir. İlan metni değişmeden URL değişse dahi
    çift ilanları tespit etmeyi sağlar.
    """
    raw_key = f"{(title or '').strip().lower()}|{(institution or '').strip().lower()}|{(deadline or '').strip()}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
