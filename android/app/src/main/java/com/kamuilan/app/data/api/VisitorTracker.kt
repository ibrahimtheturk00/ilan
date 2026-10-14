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
import java.util.concurrent.TimeUnit

private val Context.visitorDataStore by preferencesDataStore(name = "visitor_stats_prefs")

object VisitorTracker {
    private const val COUNTER_KEY = "kamu-ilan-merkezi-visitors-v1"
    private val KEY_MOBILE_COUNTED = booleanPreferencesKey("kpi_mobile_unique_counted")

    private val httpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()
    }

    /**
     * Mobil uygulamadan ilk girişte web sitesiyle paylaşılan sayaca /hit/ isteği atar.
     * Cihazda zaten bir kez sayıldıysa /hit/ atmaz.
     * UI'da gösterilmez, sadece web sayacına mobilden gelen ziyaretçileri de ekler.
     */
    suspend fun trackAppLaunch(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                val prefs = context.visitorDataStore.data.first()
                val alreadyCounted = prefs[KEY_MOBILE_COUNTED] ?: false
                if (alreadyCounted) return@withContext

                val url = "https://countapi.mileshilliard.com/api/v1/hit/$COUNTER_KEY"
                val request = Request.Builder()
                    .url(url)
                    .header("Accept", "application/json")
                    .get()
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        context.visitorDataStore.edit { editPrefs ->
                            editPrefs[KEY_MOBILE_COUNTED] = true
                        }
                    }
                }
            } catch (e: Exception) {
                // Sessizce yutulur; bir sonraki açılışta dener
            }
        }
    }
}
