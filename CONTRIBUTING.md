# Katkıda Bulunma Rehberi (Contributing)

Kamu İlan Merkezi projesine katkıda bulunmak istediğiniz için teşekkür ederiz!

## 1. Geliştirme Ortamı Kurulumu

### Web Ön Uç (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### Veri Tarayıcı Motorları (Python)
```bash
cd scraper
pip install -r requirements.txt
python -m unittest test_core.py
```

### Android Mobil Uygulama (Jetpack Compose)
- Android Studio Ladybug / Koala veya üzeri
- JDK 17+
- `./gradlew assembleDebug`

## 2. Kod Standartları ve Kuralları

- **TypeScript / React**: Strict type kontrolü, Tailwind CSS ile tasarım sistemi bütünlüğü.
- **Python**: PEP 8 uyumlu kod, `BaseScraper` sınıfından türetilen modüler tarayıcılar.
- **Kotlin**: Jetpack Compose modern UI mimarisi, Material 3 standartları, DataStore ve Coroutines.

## 3. Pull Request Süreci

1. Yeni bir dal (branch) açın: `git checkout -b feature/yeni-ozellik`
2. Değişikliklerinizi yapın ve test edin:
   - Web derleme testi: `npm run build`
   - Scraper testleri: `python scraper/test_core.py`
3. Açıklayıcı bir commit mesajı ile PR gönderin.
