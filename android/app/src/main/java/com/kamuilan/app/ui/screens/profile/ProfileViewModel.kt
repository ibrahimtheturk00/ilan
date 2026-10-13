package com.kamuilan.app.ui.screens.profile

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.local.UserPreferencesProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ProfileUiState(
    val notificationsEnabled: Boolean = true,
    val urgentJobAlertsEnabled: Boolean = true,
    val infoMessage: String? = null
)

class ProfileViewModel(application: Application) : AndroidViewModel(application) {

    private val preferencesManager = PreferencesManager(application.applicationContext)

    val userProfile: StateFlow<UserPreferencesProfile> = preferencesManager.userProfileFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserPreferencesProfile()
        )

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun toggleNotifications(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(notificationsEnabled = enabled)
    }

    fun toggleUrgentJobAlerts(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(urgentJobAlertsEnabled = enabled)
    }

    fun resetPreferences() {
        viewModelScope.launch {
            preferencesManager.saveUserProfile("", "", "", "")
            preferencesManager.setOnboardingCompleted(false)
            _uiState.value = _uiState.value.copy(infoMessage = "Kariyer tercihleri sıfırlandı.")
        }
    }

    fun clearInfoMessage() {
        _uiState.value = _uiState.value.copy(infoMessage = null)
    }
}