package com.kamuilan.app.data.model

import java.time.LocalDate
import java.time.temporal.ChronoUnit

object JobParser {

    fun detectKpssType(job: JobPost): String {
        val text = "${job.title} ${job.description ?: ""}".lowercase()

        return when {
            text.contains("p3") || text.contains("lisans kpss") || text.contains("b grubu lisans") -> "KPSS P3 (Lisans)"
            text.contains("p93") || text.contains("önlisans kpss") || text.contains("ön lisans kpss") -> "KPSS P93 (Önlisans)"
            text.contains("p94") || text.contains("ortaöğretim kpss") || text.contains("lise kpss") -> "KPSS P94 (Ortaöğretim)"
            text.contains("kpss şartı aranmamaktadır") || text.contains("kpss şartsız") || text.contains("kpss puanı aranmaz") -> "KPSS Şartsız"
            job.postType == "isci" -> "KPSS Şartsız"
            job.postType == "akademik" -> "Akademik Kadro"
            text.contains("kpss") -> "KPSS Puanı Gerekli"
            else -> "Belirtilmemiş"
        }
    }

    fun isKpssFree(job: JobPost): Boolean {
        val detected = detectKpssType(job)
        if (detected == "KPSS Şartsız") return true
        val text = "${job.title} ${job.description ?: ""}".lowercase()
        return text.contains("kpss şartı aranmaz") ||
                text.contains("kpss şartsız") ||
                text.contains("kpss puanı aranmaz") ||
                text.contains("kpss şartı yoktur") ||
                text.contains("kpss şartı aranmamaktadır") ||
                job.postType == "isci"
    }

    fun detectEducationLevel(job: JobPost): String {
        val text = "${job.title} ${job.description ?: ""}".lowercase()

        return when {
            text.contains("doktora") || text.contains("tıpta uzmanlık") -> "Doktora"
            text.contains("yüksek lisans") || text.contains("tezli yüksek") -> "Yüksek Lisans"
            text.contains("önlisans") || text.contains("ön lisans") || text.contains("meslek yüksekokul") || text.contains("myo") || text.contains("tekniker") -> "Önlisans"
            text.contains("lisans") || text.contains("fakülte") || text.contains("mühendis") || text.contains("avukat") || text.contains("tabip") -> "Lisans"
            text.contains("lise") || text.contains("ortaöğretim") || text.contains("teknisyen") -> "Lise / Ortaöğretim"
            text.contains("ilköğretim") || text.contains("ilkokul") -> "İlköğretim"
            else -> "Belirtilmemiş"
        }
    }

    fun detectMaxAge(job: JobPost): Int? {
        val text = "${job.title} ${job.description ?: ""}".lowercase()
        val regex = Regex("""(\d{2})\s*(?:yaş|yaşını|yaşından)""")
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.toIntOrNull()?.takeIf { it in 18..65 }
    }

    fun isToday(publishedStr: String?): Boolean {
        if (publishedStr.isNullOrBlank()) return false
        return try {
            val date = LocalDate.parse(publishedStr.substring(0, 10))
            date == LocalDate.now()
        } catch (e: Exception) {
            false
        }
    }

    fun isCancelled(title: String?): Boolean {
        if (title.isNullOrBlank()) return false
        val lower = title.lowercase()
        return lower.contains("iptal") || lower.contains("düzeltme")
    }

    fun calculateDaysRemaining(deadlineStr: String?): Long? {
        if (deadlineStr.isNullOrBlank()) return null
        return try {
            val deadlineDate = LocalDate.parse(deadlineStr.substring(0, 10))
            val today = LocalDate.now()
            ChronoUnit.DAYS.between(today, deadlineDate)
        } catch (e: Exception) {
            null
        }
    }

    fun cleanJobTitle(title: String?, city: String?, originalUrl: String?): String {
        if (title.isNullOrBlank()) return "Resmi Kamu İlanı"
        val lower = title.lowercase()
        val isFaulty = lower.contains("gün kaldı") ||
                lower.contains("gn kald") ||
                lower.contains("sona eriyor") ||
                lower.startsWith("(son") ||
                lower.startsWith("(bugün")

        if (!isFaulty) return title

        if (!originalUrl.isNullOrBlank() && originalUrl.contains("/")) {
            try {
                val fileName = java.net.URLDecoder.decode(originalUrl.substringAfterLast("/"), "UTF-8")
                    .replace(Regex("""(?i)\.pdf$"""), "")
                    .replace(Regex("""[-_]+"""), " ")
                    .trim()

                if (fileName.length > 3 && !fileName.all { it.isDigit() }) {
                    val formatted = fileName.split(" ")
                        .filter { it.isNotBlank() }
                        .joinToString(" ") { word ->
                            word.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
                        }
                    val formattedLower = formatted.lowercase()
                    if (!formattedLower.contains("doc0") && !formattedLower.contains("scan")) {
                        return "$formatted Personel Alım İlanı"
                    }
                }
            } catch (e: Exception) {
                // ignore
            }
        }

        val prefix = if (!city.isNullOrBlank()) "$city " else ""
        return "${prefix}Kamu Kurumu Personel Alım İlanı"
    }

    fun cleanInstitution(institution: String?, title: String?, city: String?, originalUrl: String?): String {
        if (institution.isNullOrBlank()) return "Resmi Kamu Kurumu"
        val lower = institution.lowercase()
        val isFaulty = lower.contains("gün kaldı") ||
                lower.contains("gn kald") ||
                lower.contains("sona eriyor") ||
                lower.startsWith("(son") ||
                lower.startsWith("(bugün")

        if (!isFaulty) return institution

        if (!originalUrl.isNullOrBlank() && originalUrl.contains("/")) {
            try {
                val fileName = java.net.URLDecoder.decode(originalUrl.substringAfterLast("/"), "UTF-8")
                    .replace(Regex("""(?i)\.pdf$"""), "")
                    .replace(Regex("""[-_]+"""), " ")
                    .trim()

                if (fileName.length > 3 && !fileName.all { it.isDigit() }) {
                    val formatted = fileName.split(" ")
                        .filter { it.isNotBlank() }
                        .joinToString(" ") { word ->
                            word.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
                        }
                    val formattedLower = formatted.lowercase()
                    if (!formattedLower.contains("doc0") && !formattedLower.contains("scan")) {
                        return formatted
                    }
                }
            } catch (e: Exception) {
                // ignore
            }
        }

        val prefix = if (!city.isNullOrBlank()) "$city " else ""
        return "${prefix}Belediyesi / Kamu Kurumu"
    }

    fun resolveApplicationUrl(institution: String?, originalUrl: String?): String {
        if (originalUrl.isNullOrBlank()) return "https://kariyerkapisi.gov.tr/isealim"

        if (originalUrl.contains("kamuilan.sbb.gov.tr/ilanDetay.aspx")) {
            val rawInst = institution ?: ""
            val norm = rawInst.lowercase()
                .replace("ç", "c")
                .replace("ğ", "g")
                .replace("ı", "i")
                .replace("i̇", "i")
                .replace("ö", "o")
                .replace("ş", "s")
                .replace("ü", "u")

            // 1. Askeri / Güvenlik Kurumları
            if (norm.contains("milli savunma") || norm.contains("msb")) return "https://personeltemin.msb.gov.tr/"
            if (norm.contains("jandarma")) return "https://vatandas.jandarma.gov.tr/ptm/giris"
            if (norm.contains("sahil guvenlik")) return "https://www.sg.gov.tr/"
            if (norm.contains("emniyet") || norm.contains("polis")) return "https://www.pa.edu.tr/"

            // 2. Bakanlıklar ve Kurumlar
            if (norm.contains("tapu ve kadastro") || norm.contains("tkgm")) return "https://kariyerkapisi.gov.tr/isealim"
            if (norm.contains("adalet") || norm.contains("icra")) return "https://pgm.adalet.gov.tr/"
            if (norm.contains("kalkinma ajansi") || norm.contains("ajansi")) return "https://sinavbasvuru.sanayi.gov.tr/"
            if (norm.contains("tubitak")) return "https://kariyer.tubitak.gov.tr/"
            if (norm.contains("tmsf")) return "https://www.tmsf.org.tr/"
            if (norm.contains("bddk")) return "https://www.bddk.org.tr/"
            if (norm.contains("vakiflar")) return "https://vgm.gov.tr/"
            if (norm.contains("yargitay")) return "https://www.yargitay.gov.tr/"
            if (norm.contains("danistay")) return "https://www.danistay.gov.tr/"
            if (norm.contains("gelir idaresi") || norm.contains("gib")) return "https://www.gib.gov.tr/"
            if (norm.contains("savunma sanayii") || norm.contains("ssb")) return "https://www.ssb.gov.tr/"
            if (norm.contains("spk")) return "https://spk.gov.tr/"
            if (norm.contains("iett")) return "https://iett.istanbul/"
            if (norm.contains("orta karadeniz") || norm.contains("oka")) return "https://www.oka.ka.gov.tr/"
            if (norm.contains("mevlana") || norm.contains("mevka")) return "https://www.mevka.org.tr/"

            // 3. Üniversiteler
            val uniDomains = listOf(
                "sakarya" to "https://www.subu.edu.tr/",
                "subu" to "https://www.subu.edu.tr/",
                "canakkale" to "https://www.comu.edu.tr/",
                "onsekiz mart" to "https://www.comu.edu.tr/",
                "yildiz" to "https://www.yildiz.edu.tr/",
                "medeniyet" to "https://www.medeniyet.edu.tr/",
                "ondokuz mayis" to "https://www.omu.edu.tr/",
                "erbakan" to "https://www.erbakan.edu.tr/",
                "sirnak" to "https://www.sirnak.edu.tr/",
                "bandirma" to "https://www.bandirma.edu.tr/",
                "marmara" to "https://www.marmara.edu.tr/",
                "giresun" to "https://www.giresun.edu.tr/",
                "bozok" to "https://bozok.edu.tr/",
                "siirt" to "https://www.siirt.edu.tr/",
                "bogazici" to "https://www.boun.edu.tr/",
                "dicle" to "https://www.dicle.edu.tr/",
                "akdeniz" to "https://www.akdeniz.edu.tr/",
                "artvin" to "https://www.artvin.edu.tr/",
                "ahi evran" to "https://www.ahievran.edu.tr/",
                "haci bayram" to "https://hacibayram.edu.tr/",
                "isparta" to "https://isparta.edu.tr/",
                "samsun" to "https://samsun.edu.tr/",
                "igdir" to "https://www.igdir.edu.tr/",
                "adiyaman" to "https://www.adiyaman.edu.tr/",
                "adnan menderes" to "https://www.adu.edu.tr/",
                "balikesir" to "https://www.baun.edu.tr/",
                "karatekin" to "https://www.karatekin.edu.tr/",
                "cankiri" to "https://www.karatekin.edu.tr/",
                "usak" to "https://www.usak.edu.tr/",
                "suleyman demirel" to "https://w3.sdu.edu.tr/",
                "yuzuncu yil" to "https://www.yyu.edu.tr/",
                "turk-alman" to "https://www.tau.edu.tr/",
                "alaaddin keykubat" to "https://www.alanya.edu.tr/",
                "gaziosmanpasa" to "https://www.gop.edu.tr/",
                "tokat" to "https://www.gop.edu.tr/",
                "eskisehir" to "https://www.eskisehir.edu.tr/",
                "duzce" to "https://duzce.edu.tr/",
                "ankara" to "https://www.ankara.edu.tr/",
                "ataturk" to "https://atauni.edu.tr/",
                "batman" to "https://batman.edu.tr/",
                "itu" to "https://www.itu.edu.tr/",
                "istanbul teknik" to "https://www.itu.edu.tr/"
            )

            for ((key, u) in uniDomains) {
                if (norm.contains(key)) return u
            }

            // 4. Belediyeler
            val belMap = listOf(
                "sariidris" to "https://sariidris.bel.tr/",
                "eleskirt" to "http://www.eleskirt.bel.tr/",
                "sile" to "https://www.sile.bel.tr/",
                "celtik" to "https://www.celtik.bel.tr/",
                "kesan" to "https://www.kesan.bel.tr/",
                "ortahisar" to "https://www.ortahisar.bel.tr/",
                "inebolu" to "https://www.inebolu.bel.tr/",
                "malazgirt" to "https://www.malazgirt.bel.tr/",
                "rize" to "https://rize.bel.tr/",
                "posof" to "https://posof.bel.tr/",
                "atalan" to "https://www.atalan.bel.tr/",
                "elmakaya" to "https://elmakaya.bel.tr/",
                "mucur" to "https://mucur.bel.tr/",
                "didim" to "https://www.didim.bel.tr/",
                "gerede" to "https://gerede.bel.tr/",
                "pursaklar" to "https://www.pursaklar.bel.tr/",
                "taskesti" to "https://www.taskesti.bel.tr/",
                "aralik" to "https://www.aralik.bel.tr/",
                "cukurkuyu" to "https://cukurkuyu.bel.tr/"
            )

            for ((key, u) in belMap) {
                if (norm.contains(key)) return u
            }

            if (norm.contains("belediye") || norm.contains("belediyesi")) {
                return "https://yerelyonetimler.csb.gov.tr/"
            }

            return "https://kariyerkapisi.gov.tr/isealim"
        }

        return originalUrl
    }
}
