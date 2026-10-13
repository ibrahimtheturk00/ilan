package com.kamuilan.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.kamuilan.app.MainActivity
import com.kamuilan.app.R
import com.kamuilan.app.data.model.JobPost

object JobNotificationHelper {

    const val CHANNEL_ID = "kamu_ilan_match_channel"
    const val CHANNEL_NAME = "Kamu İlan Eşleşme Bildirimleri"
    const val EXTRA_JOB_ID = "extra_job_id"

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Kriterlerinizle eşleşen yeni kamu ilanları için anlık bildirimler"
                enableLights(true)
                enableVibration(true)
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun showJobMatchNotification(context: Context, job: JobPost) {
        createNotificationChannel(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_JOB_ID, job.id)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            job.id.toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val institution = job.institution?.takeIf { it.isNotBlank() } ?: "T.C. Kamu Kurumu"
        val titleText = "Yeni İlan: $institution"
        val contentText = "${job.title} — Kriterlerinize uygun yeni kadro yayında!"

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(titleText)
            .setContentText(contentText)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(contentText)
                    .setSummaryText(job.city ?: "Kamu Alımı")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        try {
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(job.id.toInt(), builder.build())
        } catch (e: SecurityException) {
            // Android 13+ bildirim izni henüz verilmediyse
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
