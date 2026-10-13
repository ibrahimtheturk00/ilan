package com.kamuilan.app.data.model

import java.time.LocalDate
import java.time.format.DateTimeFormatter
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

    fun detectEducationLevel(job: JobPost): String {
        val text = "${job.title} ${job.description ?: ""}".lowercase()

        return when {
            text.contains("doktora") || text.contains("tıpta uzmanlık") -> "Doktora"
            text.contains("yüksek lisans") || text.contains("tezli yüksek") -> "Yüksek Lisans"
            text.contains("lisans") || text.contains("fakülte") || text.contains("mühendis") || text.contains("avukat") || text.contains("tabip") -> "Lisans"
            text.contains("önlisans") || text.contains("ön lisans") || text.contains("meslek yüksekokul") || text.contains("myo") || text.contains("tekniker") -> "Önlisans"
            text.contains("lise") || text.contains("ortaöğretim") || text.contains("teknisyen") -> "Lise / Ortaöğretim"
            text.contains("ilköğretim") || text.contains("ilkokul") -> "İlköğretim"
            else -> "Belirtilmemiş"
        }
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
}
