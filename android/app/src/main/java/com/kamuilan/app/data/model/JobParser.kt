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
}
