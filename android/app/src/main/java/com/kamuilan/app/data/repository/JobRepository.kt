package com.kamuilan.app.data.repository

import com.kamuilan.app.data.api.NetworkModule
import com.kamuilan.app.data.api.SupabaseApiService
import com.kamuilan.app.data.model.JobPost

class JobRepository(
    private val api: SupabaseApiService = NetworkModule.apiService
) {

    suspend fun fetchJobs(): Result<List<JobPost>> {
        return try {
            val response = api.getJobs()
            if (response.isSuccessful && response.body() != null) {
                val deduplicated = deduplicateJobs(response.body()!!)
                Result.success(deduplicated)
            } else {
                Result.failure(Exception("İlanlar yüklenemedi: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun deduplicateJobs(jobs: List<JobPost>): List<JobPost> {
        val seen = mutableSetOf<String>()
        val result = mutableListOf<JobPost>()
        for (job in jobs) {
            val urlKey = job.originalUrl?.trim()?.lowercase() ?: ""
            val titleKey = "${(job.institution ?: "").trim().lowercase()}_${job.title.trim().lowercase()}"

            if (urlKey.isNotEmpty() && seen.contains(urlKey)) continue
            if (seen.contains(titleKey)) continue

            if (urlKey.isNotEmpty()) seen.add(urlKey)
            seen.add(titleKey)
            result.add(job)
        }
        return result
    }

    suspend fun fetchJobById(id: Long): Result<JobPost?> {
        return try {
            val response = api.getJobById(id = "eq.$id")
            if (response.isSuccessful && !response.body().isNullOrEmpty()) {
                Result.success(response.body()!!.first())
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
