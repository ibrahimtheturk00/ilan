package com.kamuilan.app.data.repository

import com.google.gson.Gson
import com.google.gson.JsonObject
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

    suspend fun signUp(email: String, password: String): Result<String> {
        return try {
            val body = mapOf("email" to email, "password" to password)
            val response = api.signUp(body)
            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!
                if (!authData.accessToken.isNullOrBlank() && authData.user != null) {
                    preferencesManager.saveAuthSession(
                        token = authData.accessToken,
                        email = authData.user.email ?: email,
                        userId = authData.user.id
                    )
                }
                Result.success("Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.")
            } else {
                val errorMsg = parseErrorMessage(response.errorBody()?.string(), response.code())
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception(e.localizedMessage ?: "Bağlantı hatası oluştu."))
        }
    }

    suspend fun signIn(email: String, password: String): Result<AuthSessionResponse> {
        return try {
            val body = mapOf("email" to email, "password" to password)
            val response = api.signInWithPassword(body)
            if (response.isSuccessful && response.body() != null) {
                val authData = response.body()!!
                if (!authData.accessToken.isNullOrBlank() && authData.user != null) {
                    preferencesManager.saveAuthSession(
                        token = authData.accessToken,
                        email = authData.user.email ?: email,
                        userId = authData.user.id
                    )
                }
                Result.success(authData)
            } else {
                val errorMsg = parseErrorMessage(response.errorBody()?.string(), response.code())
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception(e.localizedMessage ?: "Giriş yapılamadı."))
        }
    }

    suspend fun signOut() {
        preferencesManager.clearAuthSession()
    }

    private fun parseErrorMessage(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Geçersiz istek. Bilgilerinizi kontrol ediniz."
                422 -> "Şifreniz en az 6 karakter olmalıdır."
                else -> "İşlem başarısız (Hata Kodu: $statusCode)"
            }
        }

        return try {
            val json = Gson().fromJson(errorJson, JsonObject::class.java)
            val errorCode = json.get("error_code")?.asString ?: ""
            val rawMsg = json.get("msg")?.asString ?: json.get("error_description")?.asString ?: ""

            when {
                errorCode == "weak_password" || rawMsg.contains("Password should be at least", ignoreCase = true) ->
                    "Şifreniz en az 6 karakterden oluşmalıdır."

                errorCode == "email_address_invalid" || rawMsg.contains("invalid", ignoreCase = true) && rawMsg.contains("email", ignoreCase = true) ->
                    "Lütfen geçerli bir e-posta adresi giriniz."

                errorCode == "user_already_exists" || rawMsg.contains("already registered", ignoreCase = true) ->
                    "Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapın."

                errorCode == "invalid_credentials" || rawMsg.contains("Invalid login credentials", ignoreCase = true) ->
                    "E-posta adresi veya şifre hatalı. Lütfen kontrol ediniz."

                errorCode == "over_email_send_rate_limit" ->
                    "Çok fazla istek yapıldı. Lütfen biraz bekleyip tekrar deneyiniz."

                rawMsg.isNotBlank() -> rawMsg
                statusCode == 422 -> "Şifreniz en az 6 karakter olmalıdır."
                else -> "İşlem başarısız oldu (Hata: $statusCode)"
            }
        } catch (e: Exception) {
            "İşlem tamamlanamadı. Lütfen bilgilerinizi kontrol ediniz."
        }
    }
}
