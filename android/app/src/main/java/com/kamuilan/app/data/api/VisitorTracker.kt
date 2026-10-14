package com.kamuilan.app.data.api

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

private val Context.visitorDataStore by preferencesDataStore(name = "visitor_stats_prefs")

object VisitorTracker {
    private const val COUNTER_KEY = "kamu-ilan-merkezi-visitors-v1"
    private const val API_VISITOR_URL = "https://kamuilanmerkezi.com/api/visitor"
    private val KEY_MOBILE_COUNTED = booleanPreferencesKey("kpi_mobile_unique_counted")

    private val httpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(8, TimeUnit.SECONDS)
            .readTimeout(8, TimeUnit.SECONDS)
            .build()
    }

    /**
     * Mobil uygulamadan ilk girişte web sitesiyle paylaşılan sayaca POST isteği atar.
     * Cihazda zaten bir kez sayıldıysa istek atmaz.
     * UI'da gösterilmez, arka planda web sayacına mobilden gelen ziyaretçileri de ekler.
     */
    suspend fun trackAppLaunch(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                val prefs = context.visitorDataStore.data.first()
                val alreadyCounted = prefs[KEY_MOBILE_COUNTED] ?: false
                if (alreadyCounted) return@withContext

                var success = false

                // 1. Try internal /api/visitor first
                try {
                    val emptyBody = "".toRequestBody(null)
                    val request = Request.Builder()
                        .url(API_VISITOR_URL)
                        .header("Accept", "application/json")
                        .post(emptyBody)
                        .build()

                    httpClient.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            success = true
                        }
                    }
                } catch (_: Exception) {
                    // Try fallback
                }

                // 2. Fallback to countapi if direct API failed
                if (!success) {
                    try {
                        val fallbackUrl = "https://countapi.mileshilliard.com/api/v1/hit/$COUNTER_KEY"
                        val fbRequest = Request.Builder()
                            .url(fallbackUrl)
                            .header("Accept", "application/json")
                            .get()
                            .build()
                        httpClient.newCall(fbRequest).execute().use { response ->
                            if (response.isSuccessful) {
                                success = true
                            }
                        }
                    } catch (_: Exception) {}
                }

                if (success) {
                    context.visitorDataStore.edit { editPrefs ->
                        editPrefs[KEY_MOBILE_COUNTED] = true
                    }
                }
            } catch (e: Exception) {
                // Sessizce yutulur; bir sonraki açılışta dener
            }
        }
    }
}
