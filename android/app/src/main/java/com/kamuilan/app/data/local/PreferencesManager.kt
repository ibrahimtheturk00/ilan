package com.kamuilan.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "kamu_ilan_prefs")

class PreferencesManager(private val context: Context) {

    companion object {
        private val KEY_FAVORITES = stringSetPreferencesKey("favorite_job_ids")
        private val KEY_AUTH_TOKEN = stringPreferencesKey("auth_token")
        private val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        private val KEY_USER_ID = stringPreferencesKey("user_id")
    }

    val favoriteJobIdsFlow: Flow<Set<String>> = context.dataStore.data.map { preferences ->
        preferences[KEY_FAVORITES] ?: emptySet()
    }

    val userEmailFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_USER_EMAIL]
    }

    val authTokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_AUTH_TOKEN]
    }

    suspend fun toggleFavorite(jobId: Long): Boolean {
        var isNowFavorite = false
        context.dataStore.edit { preferences ->
            val current = (preferences[KEY_FAVORITES] ?: emptySet()).toMutableSet()
            val idStr = jobId.toString()
            if (current.contains(idStr)) {
                current.remove(idStr)
                isNowFavorite = false
            } else {
                current.add(idStr)
                isNowFavorite = true
            }
            preferences[KEY_FAVORITES] = current
        }
        return isNowFavorite
    }

    suspend fun isFavorite(jobId: Long): Boolean {
        val current = context.dataStore.data.first()[KEY_FAVORITES] ?: emptySet()
        return current.contains(jobId.toString())
    }

    suspend fun saveAuthSession(token: String, email: String, userId: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_AUTH_TOKEN] = token
            prefs[KEY_USER_EMAIL] = email
            prefs[KEY_USER_ID] = userId
        }
    }

    suspend fun clearAuthSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_AUTH_TOKEN)
            prefs.remove(KEY_USER_EMAIL)
            prefs.remove(KEY_USER_ID)
        }
    }
}
