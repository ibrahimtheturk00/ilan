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
            else -> "$daysRemaining Gün Kaldı (${job.deadlineAt?.take(10) ?: ""})"
        }

        val url = job.originalUrl ?: "https://kamuilanmerkezi.com"
        val kpss = com.kamuilan.app.data.model.JobParser.detectKpssType(job)
        val kpssInfo = if (kpss != "Belirtilmemiş") " • $kpss" else ""

        return buildString {
            append("🏛️ *${job.title}*\n")
            append("🏢 *Kurum:* ${job.institution ?: "T.C. Kamu Kurumu"}\n")
            if (!job.city.isNullOrBlank()) append("📍 *Şehir:* ${job.city}\n")
            if (job.positionCount != null && job.positionCount > 0) append("👥 *Kontenjan:* ${job.positionCount} Kişi\n")
            append("⏳ *Son Başvuru:* $deadlineText$kpssInfo\n\n")
            append("🔗 *İlan ve Başvuru Detayı:*\n$url\n\n")
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
