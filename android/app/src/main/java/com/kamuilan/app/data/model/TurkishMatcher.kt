package com.kamuilan.app.data.model

import java.util.Locale

object TurkishMatcher {

    fun normalize(text: String?): String {
        if (text.isNullOrBlank()) return ""
        return text
            .replace("İ", "i")
            .replace("I", "i")
            .replace("ı", "i")
            .replace("Ş", "s")
            .replace("ş", "s")
            .replace("Ğ", "g")
            .replace("ğ", "g")
            .replace("Ü", "u")
            .replace("ü", "u")
            .replace("Ö", "o")
            .replace("ö", "o")
            .replace("Ç", "c")
            .replace("ç", "c")
            .lowercase(Locale.ROOT)
            .trim()
    }

    private val CATEGORY_SYNONYMS = mapOf(
        "bilisim" to listOf(
            "bilisim", "yazilim", "bilgisayar", "kodlama", "yapay zeka",
            "veri", "siber", "web", "programci", "yazilimci", "ag", "sistem"
        ),
        "saglik" to listOf(
            "saglik", "tabip", "doktor", "dis tabibi", "eczaci", "hekim", "fizik tedavi"
        ),
        "hemsirelik" to listOf(
            "hemsire", "ebe", "saglik teknikeri", "anestezi", "radyoloji", "paramedik", "diyaliz"
        ),
        "egitim" to listOf(
            "ogretim", "ogretmen", "arastirma gorevlisi", "akademisyen", "docent", "profesor", "egitim"
        ),
        "muhendislik" to listOf(
            "muhendis", "mimar", "insaat", "makine", "elektrik", "elektronik", "harita", "jeoloji", "sehir plancisi"
        ),
        "hukuk" to listOf(
            "hukuk", "avukat", "hakim", "savci", "zabit katibi", "mubasir", "icra katibi", "adalet"
        ),
        "iktisat" to listOf(
            "maliye", "iktisat", "isletme", "muhasebe", "kamu yonetimi", "gelir uzmani", "vergi", "mufettis", "denetmen"
        ),
        "buro" to listOf(
            "buro", "sekreter", "idari", "arsiv", "veri hazirlama", "vhk", "memur"
        ),
        "guvenlik" to listOf(
            "guvenlik", "zabita", "itfaiye", "infaz koruma", "gardiyan", "koruma", "bekci"
        ),
        "sosyal" to listOf(
            "psikolog", "sosyal calismaci", "sosyal hizmet", "pdr", "sosyolog", "rehabilitasyon"
        ),
        "ziraat" to listOf(
            "ziraat", "veteriner", "orman", "tarim", "hayvancilik", "su urunleri"
        ),
        "ilahiyat" to listOf(
            "imam", "muezzin", "kuran kursu", "ilahiyat", "vaiz", "din"
        ),
        "iletisim" to listOf(
            "iletisim", "halkla iliskiler", "basin", "medya", "grafiker", "gazeteci"
        ),
        "turizm" to listOf(
            "turizm", "otelcilik", "rehber", "konaklama", "resepsiyon", "ascilik", "asci"
        ),
        "teknik" to listOf(
            "teknisyen", "tekniker", "bakim", "onarim", "elektrikci", "tesisat", "motor"
        )
    )

    fun matchesCategory(job: JobPost, categorySlug: String): Boolean {
        val dept = YokDepartments.getById(categorySlug)
        if (dept != null) {
            return YokDepartments.matches(job, dept)
        }

        val normSlug = normalize(categorySlug)

        // 1. Doğrudan veri tabanındaki category alanı eşleşmesi
        val jobCat = normalize(job.category)
        if (jobCat == normSlug) return true

        val synonyms = CATEGORY_SYNONYMS[normSlug] ?: listOf(normSlug)
        val searchableText = normalize("${job.title} ${job.institution ?: ""} ${job.description ?: ""}")

        return synonyms.any { synonym -> searchableText.contains(synonym) }
    }

    fun matchesQuery(job: JobPost, query: String): Boolean {
        val normQuery = normalize(query)
        if (normQuery.isBlank()) return true

        // Kategori kelimesi mi sorgulandı? (örn. 'yazılım', 'bilişim', 'mühendis')
        for ((slug, synonyms) in CATEGORY_SYNONYMS) {
            if (synonyms.contains(normQuery) || slug == normQuery) {
                if (matchesCategory(job, slug)) return true
            }
        }

        val searchableText = normalize("${job.title} ${job.institution ?: ""} ${job.city ?: ""} ${job.category ?: ""} ${job.description ?: ""}")

        val queryWords = normQuery.split("\\s+".toRegex()).filter { it.isNotBlank() }
        return queryWords.all { word -> searchableText.contains(word) }
    }
}
