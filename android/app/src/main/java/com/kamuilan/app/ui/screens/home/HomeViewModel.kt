package com.kamuilan.app.ui.screens.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.model.TurkishMatcher
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
    val selectedCategory: String = "",    // Kategori slug'ı, ör. "bilisim", "saglik" — boşsa filtre yok
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
                    filteredJobs = applyFilters(
                        jobs,
                        _uiState.value.searchQuery,
                        _uiState.value.selectedPostType,
                        _uiState.value.selectedCategory
                    )
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
        // Arama yapılınca kategori filtresini koru
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredJobs = applyFilters(
                _uiState.value.allJobs,
                query,
                _uiState.value.selectedPostType,
                _uiState.value.selectedCategory
            )
        )
    }

    fun onPostTypeSelected(type: String) {
        _uiState.value = _uiState.value.copy(
            selectedPostType = type,
            filteredJobs = applyFilters(
                _uiState.value.allJobs,
                _uiState.value.searchQuery,
                type,
                _uiState.value.selectedCategory
            )
        )
    }

    /**
     * Web sitesiyle birebir aynı kategori mantığı:
     * TurkishMatcher.matchesCategory() kullanarak eş anlamlı kelimeler dahil filtreler.
     * Örneğin "bilisim" seçilince: yazılım, bilgisayar, kodlama, siber vb. de eşleşir.
     */
    fun onCategorySelected(categorySlug: String) {
        _uiState.value = _uiState.value.copy(
            selectedCategory = categorySlug,
            searchQuery = "", // Kategori seçilince metin aramasını sıfırla
            filteredJobs = applyFilters(
                _uiState.value.allJobs,
                "",
                _uiState.value.selectedPostType,
                categorySlug
            )
        )
    }

    fun clearCategoryFilter() {
        _uiState.value = _uiState.value.copy(
            selectedCategory = "",
            filteredJobs = applyFilters(
                _uiState.value.allJobs,
                _uiState.value.searchQuery,
                _uiState.value.selectedPostType,
                ""
            )
        )
    }

    fun toggleFavorite(jobId: Long) {
        viewModelScope.launch {
            preferencesManager.toggleFavorite(jobId)
        }
    }

    private fun applyFilters(
        jobs: List<JobPost>,
        query: String,
        postType: String,
        categorySlug: String
    ): List<JobPost> {
        return jobs.filter { job ->
            // 1. Kadro türü filtresi
            val matchesType = if (postType == "all") true
            else job.postType.equals(postType, ignoreCase = true)

            // 2. Kategori filtresi — web sitesiyle aynı matchesCategory() mantığı
            val matchesCategory = if (categorySlug.isBlank()) true
            else TurkishMatcher.matchesCategory(job, categorySlug)

            // 3. Metin araması (yalnızca kategori seçili değilse veya ek arama yapılıyorsa)
            val matchesQuery = if (query.isBlank()) true
            else TurkishMatcher.matchesQuery(job, query)

            matchesType && matchesCategory && matchesQuery
        }
    }
}
