package com.kamuilan.app.ui.screens.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.YokDepartments
import com.kamuilan.app.ui.components.CategoryGridDialog
import com.kamuilan.app.ui.components.JobCard
import com.kamuilan.app.ui.components.JobCardSkeleton
import com.kamuilan.app.ui.theme.AkademikPurple
import com.kamuilan.app.ui.theme.AmbientGlassBackground
import com.kamuilan.app.ui.theme.BrandDark
import com.kamuilan.app.ui.theme.BrandLight
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.BrandSubtle
import com.kamuilan.app.ui.theme.IsciAmber
import com.kamuilan.app.ui.theme.MemurSky
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.ui.theme.SozlesmeliTeal

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onJobClick: (Long) -> Unit,
    modifier: Modifier = Modifier,
    listState: LazyListState = rememberLazyListState()
) {
    val uiState by viewModel.uiState.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()

    var showCategoryGridDialog by remember { mutableStateOf(false) }

    // Canlı kategori ilan sayıları
    val categoryCounts = remember(uiState.allJobs) {
        YokDepartments.calculateCounts(uiState.allJobs)
    }

    // Seçili kategori başlığını bul
    val activeCategoryTitle = remember(uiState.selectedCategory) {
        if (uiState.selectedCategory.isBlank()) null
        else YokDepartments.getById(uiState.selectedCategory)?.name
            ?: uiState.selectedCategory
    }

    // 4x4 Kategori Izgara Dialogu
    CategoryGridDialog(
        isOpen = showCategoryGridDialog,
        onDismiss = { showCategoryGridDialog = false },
        categoryCounts = categoryCounts,
        onSelectCategory = { deptId ->
            viewModel.onCategorySelected(deptId)
        }
    )

    AmbientGlassBackground(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // ── Üst Header ──────────────────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Gradient logo kutusu
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(
                                brush = Brush.linearGradient(listOf(BrandDark, Color(0xFF6D28D9))),
                                shape = RoundedCornerShape(13.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(11.dp))

                    Column {
                        Text(
                            text = "Kamu İlan",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Slate900,
                            letterSpacing = (-0.4).sp
                        )
                        Text(
                            text = "Resmî Kaynaklar • Canlı Güncelleme",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // 4x4 Kategori Izgarasını Açan Buton
                    IconButton(
                        onClick = { showCategoryGridDialog = true },
                        modifier = Modifier
                            .size(38.dp)
                            .background(BrandPrimary.copy(alpha = 0.1f), RoundedCornerShape(11.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Kategoriler Izgara",
                            tint = BrandPrimary,
                            modifier = Modifier.size(19.dp)
                        )
                    }

                    IconButton(
                        onClick = { viewModel.loadJobs() },
                        modifier = Modifier
                            .size(38.dp)
                            .background(Slate100, RoundedCornerShape(11.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Yenile",
                            tint = Slate700,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ── Arama Çubuğu ─────────────────────────────────────────────────
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                placeholder = {
                    Text(
                        "Unvan, kurum veya şehir ara...",
                        color = Slate400,
                        fontSize = 13.sp
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Ara",
                        tint = if (uiState.searchQuery.isNotEmpty()) BrandPrimary else Slate400,
                        modifier = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Temizle",
                                tint = Slate500,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BrandPrimary,
                    unfocusedBorderColor = Slate200,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            // ── Aktif Kategori Rozeti ─────────────────────────────────────────
            AnimatedVisibility(
                visible = activeCategoryTitle != null,
                enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut()
            ) {
                if (activeCategoryTitle != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(BrandSubtle, RoundedCornerShape(10.dp))
                            .border(1.dp, BrandPrimary.copy(alpha = 0.25f), RoundedCornerShape(10.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f, fill = false)
                        ) {
                            Icon(
                                imageVector = Icons.Default.FilterList,
                                contentDescription = null,
                                tint = BrandPrimary,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Kategori: ",
                                fontSize = 12.sp,
                                color = Slate500
                            )
                            Text(
                                text = activeCategoryTitle,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandPrimary,
                                maxLines = 1
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clickable { viewModel.clearCategoryFilter() }
                                .background(BrandPrimary.copy(alpha = 0.1f), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Temizle",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BrandPrimary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // ── Kadro Türü Filter Pill'leri ───────────────────────────────────
            val postTypePills = listOf(
                Triple("all", "Tümü", Slate900),
                Triple("memur", "Memur", MemurSky),
                Triple("sozlesmeli", "Sözleşmeli", SozlesmeliTeal),
                Triple("isci", "İşçi", IsciAmber),
                Triple("akademik", "Akademik", AkademikPurple)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                postTypePills.forEach { (typeKey, typeLabel, brandColor) ->
                    val isSelected = uiState.selectedPostType == typeKey
                    val interSource = remember { MutableInteractionSource() }
                    val isPressed by interSource.collectIsPressedAsState()
                    val shape = RoundedCornerShape(20.dp)

                    Box(
                        modifier = Modifier
                            .clickable(
                                interactionSource = interSource,
                                indication = null
                            ) { viewModel.onPostTypeSelected(typeKey) }
                            .then(
                                if (isSelected) {
                                    Modifier.background(
                                        brush = Brush.horizontalGradient(
                                            listOf(brandColor, brandColor.copy(alpha = 0.75f))
                                        ),
                                        shape = shape
                                    )
                                } else {
                                    Modifier
                                        .background(
                                            color = if (isPressed) Slate100 else MaterialTheme.colorScheme.surface,
                                            shape = shape
                                        )
                                        .border(width = 1.dp, color = Slate200, shape = shape)
                                }
                            )
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = typeLabel,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else Slate700
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ── Sayaç ────────────────────────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Toplam ",
                        fontSize = 12.sp,
                        color = Slate500
                    )
                    Text(
                        text = "",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = BrandPrimary
                    )
                    Text(
                        text = " güncel ilan listeleniyor",
                        fontSize = 12.sp,
                        color = Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // ── İçerik Durumları (Skeleton Loading) ───────────────────────────
            when {
                uiState.isLoading -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 90.dp)
                    ) {
                        items(5) {
                            JobCardSkeleton()
                        }
                    }
                }

                uiState.errorMessage != null -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Text(
                                text = uiState.errorMessage ?: "Bağlantı hatası oluştu",
                                color = Slate900,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = { viewModel.loadJobs() },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                            ) {
                                Text("Tekrar Dene")
                            }
                        }
                    }
                }

                uiState.filteredJobs.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(bottom = 80.dp, start = 24.dp, end = 24.dp)
                        ) {
                            Text(
                                text = "Aradığınız kriterlere uygun ilan bulunamadı",
                                color = Slate900,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Arama kelimenizi değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.",
                                color = Slate500,
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Button(
                                onClick = {
                                    viewModel.onSearchQueryChanged("")
                                    viewModel.onPostTypeSelected("all")
                                    viewModel.clearCategoryFilter()
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Slate900)
                            ) {
                                Text("Tüm Filtreleri Temizle")
                            }
                        }
                    }
                }

                else -> {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 90.dp)
                    ) {
                        items(uiState.filteredJobs, key = { it.id }) { job ->
                            JobCard(
                                job = job,
                                isFavorite = favoriteIds.contains(job.id.toString()),
                                onFavoriteClick = { viewModel.toggleFavorite(job.id) },
                                onClick = { onJobClick(job.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}
