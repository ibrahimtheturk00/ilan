import io
import re
from typing import Dict, Any, Optional

def extract_pdf_content(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    pdfplumber kullanarak PDF dosyasından metin, pozisyon sayıları ve tarihleri ayrıştırır.
    """
    result: Dict[str, Any] = {
        "text": "",
        "page_count": 0,
        "deadline": None,
        "position_count": None
    }
    
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            result["page_count"] = len(pdf.pages)
            pages_text = []
            for page in pdf.pages[:5]:  # İlk 5 sayfa genellikle başvuru koşulları için yeterlidir
                extracted = page.extract_text()
                if extracted:
                    pages_text.append(extracted)
            
            full_text = "\n".join(pages_text)
            result["text"] = full_text
            
            # Tarih tespiti: "Son Başvuru Tarihi: 15.11.2024"
            date_match = re.search(r'(?:son\s+başvuru\s+tarihi|başvuru\s+bitiş|müracaat\s+tarihi)\s*[:\-\s]\s*(\d{1,2}[\.\/]\d{1,2}[\.\/]\d{4})', full_text, re.IGNORECASE)
            if date_match:
                result["deadline"] = date_match.group(1)
                
            # Kadro sayısı: "Toplam X personel"
            count_match = re.search(r'(?:toplam\s*)?(\d+)\s*(?:adet|kişi|personel|sözleşmeli\s+personel)', full_text, re.IGNORECASE)
            if count_match:
                try:
                    result["position_count"] = int(count_match.group(1))
                except ValueError:
                    pass
    except Exception as e:
        result["error"] = str(e)
        
    return result
