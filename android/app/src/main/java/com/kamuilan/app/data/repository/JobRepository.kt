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
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("İlanlar yüklenemedi: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
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
