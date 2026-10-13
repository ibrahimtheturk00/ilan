package com.kamuilan.app.data.repository

import com.kamuilan.app.data.api.NetworkModule
import com.kamuilan.app.data.api.SupabaseApiService
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.model.AuthSessionResponse
import kotlinx.coroutines.flow.Flow

class AuthRepository(
    private val preferencesManager: PreferencesManager,
    private val api: SupabaseApiService = NetworkModule.apiService
) {

    val userEmailFlow: Flow<String?> = preferencesManager.userEmailFlow
    val authTokenFlow: Flow<String?> = preferencesManager.authTokenFlow

    suspend fun signUp(email: String, password: String): Result<AuthSessionResponse> {
        return try {
            val body = mapOf("email" to email, "password" to password)
            val response = api.signUp(body)
            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!
                if (authData.accessToken != null && authData.user != null) {
                    preferencesManager.saveAuthSession(
                        token = authData.accessToken,
                        email = authData.user.email ?: email,
                        userId = authData.user.id
                    )
                }
                Result.success(authData)
            } else {
                Result.failure(Exception("Kayıt başarısız: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signIn(email: String, password: String): Result<AuthSessionResponse> {
        return try {
            val body = mapOf("email" to email, "password" to password)
            val response = api.signInWithPassword(body)
            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!
                if (authData.accessToken != null && authData.user != null) {
                    preferencesManager.saveAuthSession(
                        token = authData.accessToken,
                        email = authData.user.email ?: email,
                        userId = authData.user.id
                    )
                }
                Result.success(authData)
            } else {
                Result.failure(Exception("Giriş yapılamadı. Bilgilerinizi kontrol ediniz."))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signOut() {
        preferencesManager.clearAuthSession()
    }
}
