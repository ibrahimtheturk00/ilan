package com.kamuilan.app.data.api

import com.kamuilan.app.data.model.AuthSessionResponse
import com.kamuilan.app.data.model.AuthUser
import com.kamuilan.app.data.model.JobPost
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query

interface SupabaseApiService {

    @GET("rest/v1/job_posts")
    suspend fun getJobs(
        @Query("select") select: String = "*,sources(*)",
        @Query("is_active") isActive: String = "eq.true",
        @Query("order") order: String = "published_at.desc.nullslast",
        @Query("limit") limit: Int = 500
    ): Response<List<JobPost>>

    @GET("rest/v1/job_posts")
    suspend fun getJobById(
        @Query("id") id: String,
        @Query("select") select: String = "*,sources(*)"
    ): Response<List<JobPost>>
}
