package com.kamuilan.app.ui.screens.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.repository.JobRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = false,
    val allJobs: List<JobPost> = emptyList(),
    val filteredJobs: List<JobPost> = emptyList(),
    val searchQuery: String = "",
    val selectedPostType: String = "all", // "all", "memur", "sozlesmeli", "isci", "akademik"
    val errorMessage: String? = null
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val jobRepository = JobRepository()
    private val preferencesManager = PreferencesManager(application.applicationContext)

    private val _uiState = MutableStateFlow(HomeUiState(isLoading = true))
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    val favoriteIds: StateFlow<Set<String>> = preferencesManager.favoriteJobIdsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptySet())

    init {
        loadJobs()
    }

    fun loadJobs() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = jobRepository.fetchJobs()
            result.onSuccess { jobs ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    allJobs = jobs,
                    filteredJobs = applyFilters(jobs, _uiState.value.searchQuery, _uiState.value.selectedPostType)
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = error.localizedMessage ?: "Bağlantı hatası oluştu"
                )
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredJobs = applyFilters(_uiState.value.allJobs, query, _uiState.value.selectedPostType)
        )
    }

    fun onPostTypeSelected(type: String) {
        _uiState.value = _uiState.value.copy(
            selectedPostType = type,
            filteredJobs = applyFilters(_uiState.value.allJobs, _uiState.value.searchQuery, type)
        )
    }

    fun toggleFavorite(jobId: Long) {
        viewModelScope.launch {
            preferencesManager.toggleFavorite(jobId)
        }
    }

    private fun applyFilters(jobs: List<JobPost>, query: String, postType: String): List<JobPost> {
        return jobs.filter { job ->
            val matchesType = if (postType == "all") true else job.postType.equals(postType, ignoreCase = true)
            val matchesQuery = if (query.isBlank()) {
                true
            } else {
                val q = query.lowercase().trim()
                job.title.lowercase().contains(q) ||
                        (job.institution?.lowercase()?.contains(q) == true) ||
                        (job.city?.lowercase()?.contains(q) == true)
            }
            matchesType && matchesQuery
        }
    }
}
