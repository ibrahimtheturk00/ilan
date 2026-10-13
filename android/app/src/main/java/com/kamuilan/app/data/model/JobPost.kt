package com.kamuilan.app.data.model

import com.google.gson.annotations.SerializedName

data class JobPost(
    @SerializedName("id") val id: Long,
    @SerializedName("source_id") val sourceId: Long? = null,
    @SerializedName("title") val title: String,
    @SerializedName("institution") val institution: String? = null,
    @SerializedName("city") val city: String? = null,
    @SerializedName("district") val district: String? = null,
    @SerializedName("post_type") val postType: String? = null,
    @SerializedName("category") val category: String? = null,
    @SerializedName("position_count") val positionCount: Int? = null,
    @SerializedName("published_at") val publishedAt: String? = null,
    @SerializedName("deadline_at") val deadlineAt: String? = null,
    @SerializedName("original_url") val originalUrl: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("is_active") val isActive: Boolean? = true,
    @SerializedName("sources") val source: Source? = null
)

data class Source(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("slug") val slug: String? = null,
    @SerializedName("base_url") val baseUrl: String? = null
)

data class AuthUser(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class AuthSessionResponse(
    @SerializedName("access_token") val accessToken: String? = null,
    @SerializedName("token_type") val tokenType: String? = null,
    @SerializedName("expires_in") val expiresIn: Long? = null,
    @SerializedName("refresh_token") val refreshToken: String? = null,
    @SerializedName("user") val user: AuthUser? = null
)
