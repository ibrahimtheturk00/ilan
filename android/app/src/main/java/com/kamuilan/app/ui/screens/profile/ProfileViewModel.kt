package com.kamuilan.app.ui.screens.profile

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.local.UserPreferencesProfile
import com.kamuilan.app.notification.NotificationScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ProfileUiState(
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

    val notificationsEnabled: StateFlow<Boolean> = preferencesManager.notificationsEnabledFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = true
        )

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun toggleNotifications(enabled: Boolean) {
        viewModelScope.launch {
            preferencesManager.setNotificationsEnabled(enabled)
            val context = getApplication<Application>().applicationContext
            if (enabled) {
                NotificationScheduler.schedulePeriodicSync(context)
                _uiState.value = _uiState.value.copy(infoMessage = "Yeni ilan bildirimleri aktifleştirildi.")
            } else {
                NotificationScheduler.cancelPeriodicSync(context)
                _uiState.value = _uiState.value.copy(infoMessage = "İlan bildirimleri kapatıldı.")
            }
        }
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