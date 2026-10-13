package com.kamuilan.app

import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.model.TurkishMatcher
import com.kamuilan.app.data.model.YokDepartments
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CategoryMatchingTest {

    @Test
    fun testAll16YokDepartmentsConfigured() {
        assertEquals(16, YokDepartments.LIST.size)

        val expectedIds = listOf(
            "bilisim", "egitim", "hukuk", "saglik", "hemsirelik", "iibf",
            "muhendislik", "buro", "zabita", "sosyal", "fen_edebiyat",
            "ziraat_veteriner", "teknik_usta", "savunma_askeri", "kultur_sanat", "destek_hizmet"
        )

        val actualIds = YokDepartments.LIST.map { it.id }
        assertEquals(expectedIds, actualIds)

        YokDepartments.LIST.forEach { dept ->
            assertNotNull(dept.name)
            assertTrue(dept.name.isNotBlank())
            assertTrue(dept.keywords.isNotEmpty())
        }
    }

    @Test
    fun testTurkishNormalization() {
        assertEquals("yazilim", TurkishMatcher.normalize("YAZILIM"))
        assertEquals("bilgisayar muhendisi", TurkishMatcher.normalize("BİLGİSAYAR MÜHENDİSİ"))
        assertEquals("istanbul universitesi", TurkishMatcher.normalize("İSTANBUL ÜNİVERSİTESİ"))
        assertEquals("ogretim gorevlisi", TurkishMatcher.normalize("Öğretim Görevlisi"))
        assertEquals("saglik teknisyeni", TurkishMatcher.normalize("SAĞLIK TEKNİSYENİ"))
        assertEquals("hukuk musaviri", TurkishMatcher.normalize("Hukuk Müşaviri"))
    }

    @Test
    fun testCategoryMatchingAgainstSampleJobs() {
        val itJob = JobPost(
            id = 1,
            title = "TÜBİTAK 10 Kıdemli Yazılım Mühendisi ve Siber Güvenlik Uzmanı Alımı",
            description = "Python ve Go dillerinde deneyimli yazılımcı ve yapay zeka uzmanı aranmaktadır.",
            institution = "TÜBİTAK BİLGEM",
            category = "bilisim"
        )

        val lawJob = JobPost(
            id = 2,
            title = "Adalet Bakanlığı 50 Sözleşmeli Avukat ve İcra Müdür Yardımcısı Alımı",
            description = "Hukuk fakültesi mezunu adaylar arasından alım yapılacaktır.",
            institution = "Adalet Bakanlığı",
            category = "hukuk"
        )

        val eduJob = JobPost(
            id = 3,
            title = "İstanbul Üniversitesi 15 Profesör ve Doçent Öğretim Üyesi İlanı",
            description = "Fakültelerimize 2547 sayılı kanuna göre akademisyen ve araştırma görevlisi alınacaktır.",
            institution = "İstanbul Üniversitesi",
            category = "egitim"
        )

        val healthJob = JobPost(
            id = 4,
            title = "Sağlık Bakanlığı Uzman Tabip ve Diş Hekimi Kadrosu",
            description = "Tıp fakültesi mezunu hekim ve doktor istihdam edilecektir.",
            institution = "Sağlık Bakanlığı",
            category = "saglik"
        )

        val nurseJob = JobPost(
            id = 5,
            title = "Şehir Hastanesi Hemşire ve Anestezi Sağlık Teknikeri Alımı",
            description = "Hastanemize yoğun bakım hemşire ve paramedik personeli alınacaktır.",
            institution = "Ankara Şehir Hastanesi"
        )

        val policeJob = JobPost(
            id = 6,
            title = "İzmir Büyükşehir Belediyesi 30 Zabıta Memuru ve İtfaiye Eri Alımı",
            description = "Özel güvenlik ve koruma sertifikasına sahip personel.",
            institution = "İzmir BB"
        )

        // IT Job asserts
        assertTrue(YokDepartments.matches(itJob, "bilisim"))
        assertFalse(YokDepartments.matches(itJob, "hukuk"))
        assertFalse(YokDepartments.matches(itJob, "saglik"))

        // Law Job asserts
        assertTrue(YokDepartments.matches(lawJob, "hukuk"))
        assertFalse(YokDepartments.matches(lawJob, "bilisim"))

        // Education Job asserts
        assertTrue(YokDepartments.matches(eduJob, "egitim"))
        assertFalse(YokDepartments.matches(eduJob, "muhendislik"))

        // Health Job asserts
        assertTrue(YokDepartments.matches(healthJob, "saglik"))
        assertFalse(YokDepartments.matches(healthJob, "destek_hizmet"))

        // Nurse Job asserts
        assertTrue(YokDepartments.matches(nurseJob, "hemsirelik"))
        assertFalse(YokDepartments.matches(nurseJob, "bilisim"))

        // Municipal/Security Job asserts
        assertTrue(YokDepartments.matches(policeJob, "zabita"))
        assertFalse(YokDepartments.matches(policeJob, "egitim"))
    }

    @Test
    fun testLiveCountsCalculation() {
        val jobs = listOf(
            JobPost(id = 101, title = "Yazılım Uzmanı", category = "bilisim"),
            JobPost(id = 102, title = "Bilgisayar Mühendisi", category = "bilisim"),
            JobPost(id = 103, title = "Araştırma Görevlisi", category = "egitim"),
            JobPost(id = 104, title = "Avukat Kadrosu", category = "hukuk")
        )

        val counts = YokDepartments.calculateCounts(jobs)
        assertEquals(2, counts["bilisim"])
        assertEquals(1, counts["egitim"])
        assertEquals(1, counts["hukuk"])
        assertEquals(0, counts["saglik"])
        assertEquals(1, counts["muhendislik"]) // "Bilgisayar Mühendisi" matches both bilisim and muhendislik
    }

    @Test
    fun testJobParserKpssAndEducationDetection() {
        val bachelorsJob = JobPost(id = 201, title = "Lisans Mezunu KPSS P3 ile Mühendis Alımı")
        val associateJob = JobPost(id = 202, title = "Önlisans Mezunu KPSS P93 ile Tekniker Alımı")
        val highSchoolJob = JobPost(id = 203, title = "Ortaöğretim Lise Mezunu KPSS P94 Hizmetli Alımı")
        val noKpssJob = JobPost(id = 204, title = "KPSS Şartsız Sürekli İşçi Alımı", postType = "isci")

        assertEquals("KPSS P3 (Lisans)", JobParser.detectKpssType(bachelorsJob))
        assertEquals("Lisans", JobParser.detectEducationLevel(bachelorsJob))

        assertEquals("KPSS P93 (Önlisans)", JobParser.detectKpssType(associateJob))
        assertEquals("Önlisans", JobParser.detectEducationLevel(associateJob))

        assertEquals("KPSS P94 (Ortaöğretim)", JobParser.detectKpssType(highSchoolJob))
        assertEquals("Lise / Ortaöğretim", JobParser.detectEducationLevel(highSchoolJob))

        assertEquals("KPSS Şartsız", JobParser.detectKpssType(noKpssJob))
    }
}
