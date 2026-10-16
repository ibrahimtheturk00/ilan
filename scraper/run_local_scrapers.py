import os
import sys
import logging
from datetime import datetime

# Çalışma dizinini scraper klasörüne sabitle
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
os.chdir(current_dir)

# Loglama dizini ve dosyası
log_dir = os.path.join(current_dir, "logs")
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, "local_scraper.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ],
    force=True
)

logger = logging.getLogger("LocalScraperRunner")

def run_all_local():
    """
    Yurtdışı bulut sunucularında (GitHub Actions) Geoblock / Firewall engeline takılan
    ve yalnızca Türkiye IP'si üzerinden erişilebilen resmî kamu portallarını yerel olarak tarar.
    """
    logger.info("==================================================")
    logger.info("Yerel Türkiye IP Otomatik Taraması Başlatılıyor...")
    logger.info("==================================================")

    # 1. Kamu İlan SBB
    try:
        from kamu_ilan_sbb import KamuIlanSbbScraper
        logger.info("[1/4] Kamu İlan SBB taranıyor...")
        KamuIlanSbbScraper().run()
    except Exception as e:
        logger.error(f"Kamu İlan SBB yerel tarama hatası: {e}", exc_info=True)

    # 2. Kariyer Kapısı (CBİKO)
    try:
        from kariyer_kapisi import KariyerKapisiScraper
        logger.info("[2/4] Kariyer Kapısı taranıyor...")
        KariyerKapisiScraper().run()
    except Exception as e:
        logger.error(f"Kariyer Kapısı yerel tarama hatası: {e}", exc_info=True)

    # 3. Yerel Yönetimler Portalı
    try:
        from yerel_yonetimler import YerelYonetimlerScraper
        logger.info("[3/4] Yerel Yönetimler Portalı taranıyor...")
        YerelYonetimlerScraper().run()
    except Exception as e:
        logger.error(f"Yerel Yönetimler yerel tarama hatası: {e}", exc_info=True)

    # 4. MSB Pertem (Millî Savunma Bakanlığı)
    try:
        from msb_pertem import MsbPertemScraper
        logger.info("[4/5] MSB PERTEM taranıyor...")
        MsbPertemScraper().run()
    except Exception as e:
        logger.error(f"MSB PERTEM yerel tarama hatası: {e}", exc_info=True)

    # 5. Kurum Portalları (Diyanet, Polis Akademisi, Jandarma, TÜBİTAK, YÖK vb.)
    try:
        from kurum_portallari import scrapers
        logger.info("[5/5] Kurum Portalları (Diyanet, PA, Jandarma, TÜBİTAK, YÖK vb.) taranıyor...")
        for s in scrapers:
            try:
                s.run()
            except Exception as e:
                logger.error(f"Kurum portalı '{s.source_slug}' yerel tarama hatası: {e}")
    except Exception as e:
        logger.error(f"Kurum portalları genel hatası: {e}", exc_info=True)

    logger.info("==================================================")
    logger.info("Yerel Tarama Tamamlandı. Veriler Supabase'e İşlendi.")
    logger.info("==================================================")

if __name__ == "__main__":
    run_all_local()
