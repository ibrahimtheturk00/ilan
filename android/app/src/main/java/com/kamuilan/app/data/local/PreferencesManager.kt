package com.kamuilan.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "kamu_ilan_prefs")

data class UserPreferencesProfile(
    val isOnboardingCompleted: Boolean = false,
    val department: String = "",
    val educationLevel: String = "",
    val kpssType: String = "",
    val preferredCity: String = ""
)

class PreferencesManager(private val context: Context) {

    companion object {
        private val KEY_FAVORITES = stringSetPreferencesKey("favorite_job_ids")

        // Kurulum (Onboarding) ve Profil Tercihleri
        private val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        private val KEY_PREF_DEPARTMENT = stringPreferencesKey("pref_department")
        private val KEY_PREF_EDUCATION = stringPreferencesKey("pref_education")
        private val KEY_PREF_KPSS = stringPreferencesKey("pref_kpss")
        private val KEY_PREF_CITY = stringPreferencesKey("pref_city")
    }

    val favoriteJobIdsFlow: Flow<Set<String>> = context.dataStore.data.map { preferences ->
        preferences[KEY_FAVORITES] ?: emptySet()
    }

    val userProfileFlow: Flow<UserPreferencesProfile> = context.dataStore.data.map { prefs ->
        UserPreferencesProfile(
            isOnboardingCompleted = prefs[KEY_ONBOARDING_COMPLETED] ?: false,
            department = prefs[KEY_PREF_DEPARTMENT] ?: "",
            educationLevel = prefs[KEY_PREF_EDUCATION] ?: "",
            kpssType = prefs[KEY_PREF_KPSS] ?: "",
            preferredCity = prefs[KEY_PREF_CITY] ?: ""
        )
    }

    suspend fun saveUserProfile(
        department: String,
        educationLevel: String,
        kpssType: String,
        city: String
    ) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ONBOARDING_COMPLETED] = true
            prefs[KEY_PREF_DEPARTMENT] = department
            prefs[KEY_PREF_EDUCATION] = educationLevel
            prefs[KEY_PREF_KPSS] = kpssType
            prefs[KEY_PREF_CITY] = city
        }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ONBOARDING_COMPLETED] = completed
        }
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

    suspend fun clearFavorites() {
        context.dataStore.edit { preferences ->
            preferences.remove(KEY_FAVORITES)
        }
    }
}
