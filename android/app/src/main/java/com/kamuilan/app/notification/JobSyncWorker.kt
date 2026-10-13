package com.kamuilan.app.notification

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.kamuilan.app.data.api.NetworkModule
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.model.TurkishMatcher
import kotlinx.coroutines.flow.first

class JobSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val preferencesManager = PreferencesManager(applicationContext)

        // 1. Bildirimler açık mı?
        val notificationsEnabled = preferencesManager.notificationsEnabledFlow.first()
        if (!notificationsEnabled) return Result.success()

        // 2. Kullanıcı profili oluşturulmuş mu?
        val profile = preferencesManager.userProfileFlow.first()
        if (!profile.isOnboardingCompleted) return Result.success()

        try {
            // 3. Supabase'den güncel aktif ilanları çek
            val response = NetworkModule.apiService.getJobs(limit = 100)
            if (!response.isSuccessful || response.body() == null) {
                return Result.retry()
            }

            val jobs: List<JobPost> = response.body() ?: emptyList()
            val seenJobIds = preferencesManager.getSeenJobIds()

            if (seenJobIds.isEmpty()) {
                // İlk kurulum: Tüm mevcut ilanları görüldü olarak işaretle, kullanıcıya 200+ toplu bildirim atma
                preferencesManager.markJobsAsSeen(jobs.map { it.id })
                return Result.success()
            }

            // 4. Henüz görülmemiş yeni ilanları bul
            val newJobs = jobs.filter { !seenJobIds.contains(it.id.toString()) }

            // 5. Kullanıcının kriterleriyle eşleşen ilanları filtrele
            val matchedJobs = newJobs.filter { job ->
                isJobMatchingProfile(job, profile.department, profile.educationLevel, profile.kpssType, profile.preferredCity)
            }

            // 6. Eşleşen her yeni ilan için bildirim gönder (maksimum 3 adet, spamlama önlemi)
            matchedJobs.take(3).forEach { matchedJob ->
                JobNotificationHelper.showJobMatchNotification(applicationContext, matchedJob)
            }

            // 7. Tüm çekilen ilanları görüldü olarak kaydet
            preferencesManager.markJobsAsSeen(jobs.map { it.id })

            return Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            return Result.retry()
        }
    }

    private fun isJobMatchingProfile(
        job: JobPost,
        department: String,
        educationLevel: String,
        kpssType: String,
        preferredCity: String
    ): Boolean {
        val departmentMatches = department.isBlank() || department == "all" ||
                TurkishMatcher.matchesCategory(job, department)

        val educationMatches = educationLevel.isBlank() || educationLevel == "Tümü" ||
                JobParser.detectEducationLevel(job).equals(educationLevel, ignoreCase = true)

        // Kullanıcı KPSS türü seçmiş olsa bile "KPSS Şartsız" ilanlar DAİMA eşleşir
        val detectedKpss = JobParser.detectKpssType(job)
        val isKpssFree = JobParser.isKpssFree(job)
        val kpssMatches = kpssType.isBlank() || kpssType == "Tümü" ||
                detectedKpss.equals(kpssType, ignoreCase = true) ||
                isKpssFree

        val cityMatches = preferredCity.isBlank() || preferredCity == "Tüm Türkiye" ||
                (job.city != null && TurkishMatcher.normalize(job.city).contains(TurkishMatcher.normalize(preferredCity)))

        return departmentMatches && educationMatches && kpssMatches && cityMatches
    }
}
