import unittest
from deduplicator import generate_url_hash, generate_content_hash
from normalizer import clean_text, normalize_city, parse_turkish_date, extract_position_count
from categorizer import categorize_job

class TestScraperCore(unittest.TestCase):
    def test_deduplicator(self):
        url = "https://kariyerkapisi.cbiko.gov.tr/announcement/123"
        h1 = generate_url_hash(url)
        h2 = generate_url_hash(url + "  ")
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 64)

        ch = generate_content_hash("Mühendis Alımı", "Ankara Büyükşehir Belediyesi", "2024-11-20")
        self.assertEqual(len(ch), 64)

    def test_normalizer(self):
        self.assertEqual(clean_text("  Ankara   Büyükşehir \n  Belediyesi "), "Ankara Büyükşehir Belediyesi")
        self.assertEqual(normalize_city("İzmir Yüksek Teknoloji Enstitüsü"), "İzmir")
        self.assertEqual(normalize_city("İstanbul Valiliği"), "İstanbul")
        self.assertEqual(parse_turkish_date("15.11.2024"), "2024-11-15")
        self.assertEqual(parse_turkish_date("28 Ekim 2024"), "2024-10-28")
        self.assertEqual(extract_position_count("Kurumumuza 25 adet bilişim personeli alınacaktır"), 25)

    def test_categorizer(self):
        post_type, category = categorize_job("Sözleşmeli Yazılım Mühendisi Alım İlanı")
        self.assertEqual(post_type, "sozlesmeli")
        self.assertEqual(category, "bilisim")

        post_type2, category2 = categorize_job("Üniversitemize 5 Öğretim Üyesi Alınacaktır")
        self.assertEqual(post_type2, "akademik")

        post_type3, category3 = categorize_job("Sürekli İşçi (Temizlik Görevlisi) Alımı")
        self.assertEqual(post_type3, "isci")

if __name__ == "__main__":
    unittest.main()
