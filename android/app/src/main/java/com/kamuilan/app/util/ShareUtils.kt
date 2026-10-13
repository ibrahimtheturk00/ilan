package com.kamuilan.app.util

import android.content.Context
import android.content.Intent
import com.kamuilan.app.data.model.JobPost

object ShareUtils {

    fun formatJobShareText(job: JobPost): String {
        val daysRemaining = com.kamuilan.app.data.model.JobParser.calculateDaysRemaining(job.deadlineAt)
        val deadlineText = when {
            daysRemaining == null -> "Belirtilmemiş"
            daysRemaining <= 0 -> "Bugün Son Gün!"
            else -> " Gün Kaldı ()"
        }

        val url = job.originalUrl ?: "https://kamuilanmerkezi.com"
        val kpss = com.kamuilan.app.data.model.JobParser.detectKpssType(job)
        val kpssInfo = if (kpss != "Belirtilmemiş") " • " else ""

        return buildString {
            append("🏛️ **\n")
            append("🏢 *Kurum:* \n")
            if (!job.city.isNullOrBlank()) append("📍 *Şehir:* \n")
            if (job.positionCount != null && job.positionCount > 0) append("👥 *Kontenjan:*  Kişi\n")
            append("⏳ *Son Başvuru:* \n\n")
            append("🔗 *İlan ve Başvuru Detayı:*\n\n\n")
            append("📱 *Kamu İlan* mobil uygulamasından paylaşıldı.")
        }
    }

    fun shareJob(context: Context, job: JobPost) {
        val shareText = formatJobShareText(job)
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, job.title)
            putExtra(Intent.EXTRA_TEXT, shareText)
        }
        context.startActivity(Intent.createChooser(shareIntent, "İlanı Paylaş"))
    }
}
