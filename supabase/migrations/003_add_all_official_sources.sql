-- ==============================================================================
-- KAMU İLAN MERKEZİ - 003 Migration: Tüm Resmî Devlet ve Kamu Kurum Portalları
-- ==============================================================================

INSERT INTO public.sources (name, slug, base_url, scraper_type, is_active, scrape_interval_minutes)
VALUES
    ('Kariyer Kapısı (CBİKO)', 'kariyer-kapisi', 'https://kariyerkapisi.cbiko.gov.tr', 'playwright', TRUE, 5),
    ('İşe Alım Kariyer Kapısı (e-Devlet)', 'isealim-kariyerkapisi', 'https://isealimkariyerkapisi.cbiko.gov.tr', 'http', TRUE, 5),
    ('Kamu İlan (SBB / DPB)', 'kamu-ilan-sbb', 'https://kamuilan.sbb.gov.tr', 'http', TRUE, 5),
    ('İlan.gov.tr (BİK)', 'ilan-gov', 'https://www.ilan.gov.tr', 'http', TRUE, 5),
    ('İŞKUR Kamu İlanları', 'iskur', 'https://www.iskur.gov.tr', 'http', TRUE, 5),
    ('T.C. Resmî Gazete', 'resmi-gazete', 'https://www.resmigazete.gov.tr', 'pdf', TRUE, 5),
    ('Yerel Yönetimler Portalı', 'yerel-yonetimler', 'https://yerelyonetimler.csb.gov.tr', 'playwright', TRUE, 5),
    ('Millî Savunma Bakanlığı (MSB PERTEM)', 'msb-pertem', 'https://personeltemin.msb.gov.tr', 'http', TRUE, 5),
    ('Adalet Bakanlığı (PGM)', 'adalet-bakanligi', 'https://pgm.adalet.gov.tr', 'http', TRUE, 5),
    ('T.C. İçişleri Bakanlığı', 'icisleri-bakanligi', 'https://www.icisleri.gov.tr/personel', 'http', TRUE, 5),
    ('ÖSYM (KPSS Tercih & Yerleştirme)', 'osym', 'https://www.osym.gov.tr', 'http', TRUE, 5),
    ('Sağlık Bakanlığı (YHGM)', 'saglik-yhgm', 'https://yhgm.saglik.gov.tr', 'http', TRUE, 5),
    ('Millî Eğitim Bakanlığı (MEB PGM)', 'meb-pgm', 'https://personel.meb.gov.tr', 'http', TRUE, 5),
    ('Polis Akademisi Başkanlığı (EGM)', 'polis-akademisi', 'https://pa.edu.tr', 'http', TRUE, 5),
    ('Jandarma ve Sahil Güvenlik (JSGA PTM)', 'jandarma-ptm', 'https://vatandas.jandarma.gov.tr/ptm/giris', 'http', TRUE, 5),
    ('Sahil Güvenlik Komutanlığı', 'sahil-guvenlik', 'https://www.sg.gov.tr', 'http', TRUE, 5),
    ('Diyanet İşleri Başkanlığı (DİBBYS)', 'diyanet', 'https://sinav.diyanet.gov.tr', 'http', TRUE, 5),
    ('Aile ve Sosyal Hizmetler Bakanlığı (PGM)', 'aile-bakanligi', 'https://aile.gov.tr/pgm', 'http', TRUE, 5),
    ('TÜBİTAK Kariyer', 'tubitak-kariyer', 'https://kariyer.tubitak.gov.tr', 'playwright', TRUE, 5),
    ('Gelir İdaresi Başkanlığı (GİB)', 'gib', 'https://www.gib.gov.tr/kurumsal/duyurular', 'http', TRUE, 5),
    ('Dışişleri Bakanlığı', 'disisleri-mfa', 'https://www.mfa.gov.tr/duyurular.tr.mfa', 'http', TRUE, 5),
    ('Vakıflar Genel Müdürlüğü (VGM)', 'vakiflar-vgm', 'https://www.vgm.gov.tr/duyurular', 'http', TRUE, 5),
    ('Göç İdaresi Başkanlığı', 'goc-idaresi', 'https://www.goc.gov.tr', 'http', TRUE, 5),
    ('Tarım ve Orman Bakanlığı (PERGEM & OGM)', 'tarim-orman', 'https://www.tarimorman.gov.tr/PERGEM', 'http', TRUE, 5),
    ('Ticaret Bakanlığı (Personel GM)', 'ticaret-bakanligi', 'https://personel.ticaret.gov.tr', 'http', TRUE, 5),
    ('Çalışma ve Sosyal Güvenlik Bakanlığı', 'csgb', 'https://www.csgb.gov.tr/duyurular', 'http', TRUE, 5),
    ('Ulaştırma ve Altyapı Bakanlığı', 'uab', 'https://www.uab.gov.tr/duyurular', 'http', TRUE, 5),
    ('Sanayi ve Teknoloji Bakanlığı', 'sanayi-bakanligi', 'https://www.sanayi.gov.tr', 'http', TRUE, 5),
    ('Hazine ve Maliye Bakanlığı (HMB)', 'hmb', 'https://www.hmb.gov.tr', 'http', TRUE, 5),
    ('Çevre, Şehircilik ve İklim Değişikliği Bakanlığı', 'csb', 'https://csb.gov.tr', 'http', TRUE, 5),
    ('Kültür ve Turizm Bakanlığı (KTB)', 'ktb', 'https://www.ktb.gov.tr', 'http', TRUE, 5),
    ('Gençlik ve Spor Bakanlığı (GSB)', 'gsb', 'https://gsb.gov.tr', 'http', TRUE, 5),
    ('Sosyal Güvenlik Kurumu (SGK)', 'sgk', 'https://www.sgk.gov.tr', 'http', TRUE, 5),
    ('AFAD Başkanlığı', 'afad', 'https://www.afad.gov.tr', 'http', TRUE, 5),
    ('TCDD & Demiryolları', 'tcdd', 'https://www.tcdd.gov.tr', 'http', TRUE, 5),
    ('YÖK & Devlet Üniversiteleri Akademik Kadroları', 'yok-akademik', 'https://akademik.yok.gov.tr', 'http', TRUE, 5),
    ('Türkiye Belediyeler Birliği & Büyükşehirler', 'tbb-belediyeler', 'https://www.tbb.gov.tr', 'http', TRUE, 5)
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    base_url = EXCLUDED.base_url,
    scraper_type = EXCLUDED.scraper_type,
    is_active = EXCLUDED.is_active,
    scrape_interval_minutes = EXCLUDED.scrape_interval_minutes;
