package com.kamuilan.app.ui.screens.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.isSystemInDarkTheme
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
import androidx.compose.material.icons.filled.AutoAwesome
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.YokDepartments
import com.kamuilan.app.ui.components.CategoryGridDialog
import com.kamuilan.app.ui.components.JobCard
import com.kamuilan.app.ui.components.JobCardSkeleton
import com.kamuilan.app.ui.theme.ActiveEmerald
import com.kamuilan.app.ui.theme.ActiveEmeraldBg
import com.kamuilan.app.ui.theme.ActiveEmeraldBorder
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
import com.kamuilan.app.ui.theme.BricolageGrotesque
import com.kamuilan.app.ui.theme.Manrope
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.ui.theme.SozlesmeliTeal
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.ui.graphics.graphicsLayer

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onJobClick: (Long) -> Unit,
    modifier: Modifier = Modifier,
    listState: LazyListState = rememberLazyListState(),
    currentThemeMode: String = "system",
    onToggleTheme: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()

    var showCategoryGridDialog by remember { mutableStateOf(false) }
    var isSearchFocused by remember { mutableStateOf(false) }
    val systemDark = isSystemInDarkTheme()
    val isDark = when (currentThemeMode) {
        "dark" -> true
        "light" -> false
        else -> systemDark
    }

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
            Spacer(modifier = Modifier.height(14.dp))

            // ── Üst Header ──────────────────────────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Logo kutusu (Modern, minimalist)
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(
                                color = MaterialTheme.colorScheme.primary,
                                shape = RoundedCornerShape(10.dp)
                            )
                            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = "Logo",
                            tint = Color(0xFFF8F9FA),
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(modifier = Modifier.weight(1f, fill = false)) {
                        Text(
                            text = "Kamu İlan",
                            fontFamily = BricolageGrotesque,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            letterSpacing = (-0.3).sp
                        )
                        Text(
                            text = "14 Resmî Portal • 1.000+ Kurum",
                            fontFamily = Manrope,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Hızlı Gece / Gündüz Tema Değiştirme Butonu (Tek, temiz ve taşma yapmayan)
                IconButton(
                    onClick = onToggleTheme,
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = if (isDark) Color(0xFF1E293B) else Color(0xFFE2E8F0),
                            shape = RoundedCornerShape(12.dp)
                        )
                ) {
                    val icon = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode
                    val tint = if (isDark) Color(0xFF38BDF8) else Color(0xFFF59E0B)
                    Icon(
                        imageVector = icon,
                        contentDescription = "Tema Değiştir",
                        tint = tint,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ── Arama Çubuğu ─────────────────────────────────────────────────
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .onFocusChanged { isSearchFocused = it.isFocused },
                placeholder = {
                    Text(
                        "Unvan, kurum veya şehir ara (örn. Mühendis)...",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Ara",
                        tint = if (uiState.searchQuery.isNotEmpty()) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Temizle",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                )
            )

            // ── Hızlı Arama Etiketleri (Yalnızca Arama Çubuğu Odaklandığında Açılır) ──
            AnimatedVisibility(
                visible = isSearchFocused || uiState.searchQuery.isNotBlank(),
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column {
                    Spacer(modifier = Modifier.height(10.dp))
                    val quickSearchTags = listOf(
                        Triple("Sağlık", if (isDark) Color(0xFF34D399) else Color(0xFF059669), if (isDark) Color(0x33059669) else Color(0xFFECFDF5)),
                        Triple("Büro Personeli", if (isDark) Color(0xFFA5B4FC) else Color(0xFF4338CA), if (isDark) Color(0x33818CF8) else Color(0xFFEEF2FF)),
                        Triple("Mühendis", if (isDark) Color(0xFFFCD34D) else Color(0xFFD97706), if (isDark) Color(0x33F59E0B) else Color(0xFFFFFBEB)),
                        Triple("Bilişim", if (isDark) Color(0xFF7DD3FC) else Color(0xFF0284C7), if (isDark) Color(0x3338BDF8) else Color(0xFFF0F9FF)),
                        Triple("Öğretim Görevlisi", if (isDark) Color(0xFFD8B4FE) else Color(0xFF7C3AED), if (isDark) Color(0x33A855F7) else Color(0xFFFAF5FF)),
                        Triple("KPSS Şartsız", if (isDark) Color(0xFFFDA4AF) else Color(0xFFE11D48), if (isDark) Color(0x33F43F5E) else Color(0xFFFFF1F2)),
                        Triple("Temizlik", if (isDark) Color(0xFF5EEAD4) else Color(0xFF0D9488), if (isDark) Color(0x3314B8A6) else Color(0xFFF0FDFA)),
                        Triple("Belediye", if (isDark) Color(0xFF93C5FD) else Color(0xFF2563EB), if (isDark) Color(0x333B82F6) else Color(0xFFEFF6FF))
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Hızlı:",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(end = 2.dp)
                        )
                        quickSearchTags.forEach { (tag, brandCol, bgCol) ->
                            val isSelected = uiState.searchQuery.equals(tag, ignoreCase = true)
                            val shape = RoundedCornerShape(8.dp)

                            Box(
                                modifier = Modifier
                                    .clickable {
                                        if (isSelected) viewModel.onSearchQueryChanged("")
                                        else viewModel.onSearchQueryChanged(tag)
                                    }
                                    .then(
                                        if (isSelected) {
                                            Modifier
                                                .background(brandCol, shape)
                                                .border(1.dp, brandCol, shape)
                                        } else {
                                            Modifier
                                                .background(bgCol, shape)
                                                .border(1.dp, brandCol.copy(alpha = if (isDark) 0.45f else 0.25f), shape)
                                        }
                                    )
                                    .padding(horizontal = 11.dp, vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = tag,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) (if (isDark) Color(0xFF090D16) else Color(0xFFF8F9FA)) else brandCol
                                )
                            }
                        }
                    }
                }
            }

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
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BrandPrimary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // ── 3x2 Eşit Ebatlı Izgara Filtre Butonları (Kare/Dikdörtgen Kartlar) ──
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Üst Satır: [ ✨ Bugün ] [ Tümü ] [ Memur ]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterGridTile(
                        label = "Bugün",
                        icon = Icons.Default.AutoAwesome,
                        isSelected = uiState.onlyToday,
                        activeColor = Color(0xFF059669),
                        isDark = isDark,
                        onClick = { viewModel.toggleOnlyToday() },
                        modifier = Modifier.weight(1f)
                    )
                    FilterGridTile(
                        label = "Tümü",
                        isSelected = !uiState.onlyToday && (uiState.selectedPostType == "all" || uiState.selectedPostType.isBlank()),
                        activeColor = if (isDark) Color(0xFF38BDF8) else Color(0xFF0284C7),
                        isDark = isDark,
                        onClick = {
                            if (uiState.onlyToday) viewModel.toggleOnlyToday()
                            viewModel.onPostTypeSelected("all")
                        },
                        modifier = Modifier.weight(1f)
                    )
                    FilterGridTile(
                        label = "Memur",
                        isSelected = !uiState.onlyToday && uiState.selectedPostType == "memur",
                        activeColor = Color(0xFF0284C7),
                        isDark = isDark,
                        onClick = {
                            if (uiState.onlyToday) viewModel.toggleOnlyToday()
                            viewModel.onPostTypeSelected("memur")
                        },
                        modifier = Modifier.weight(1f)
                    )
                }

                // Alt Satır: [ Sözleşmeli ] [ İşçi ] [ Akademik ]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterGridTile(
                        label = "Sözleşmeli",
                        isSelected = !uiState.onlyToday && (uiState.selectedPostType == "sozlesmeli" || uiState.selectedPostType == "sözleşmeli"),
                        activeColor = Color(0xFF0D9488),
                        isDark = isDark,
                        onClick = {
                            if (uiState.onlyToday) viewModel.toggleOnlyToday()
                            viewModel.onPostTypeSelected("sozlesmeli")
                        },
                        modifier = Modifier.weight(1f)
                    )
                    FilterGridTile(
                        label = "İşçi",
                        isSelected = !uiState.onlyToday && (uiState.selectedPostType == "isci" || uiState.selectedPostType == "işçi"),
                        activeColor = Color(0xFFD97706),
                        isDark = isDark,
                        onClick = {
                            if (uiState.onlyToday) viewModel.toggleOnlyToday()
                            viewModel.onPostTypeSelected("isci")
                        },
                        modifier = Modifier.weight(1f)
                    )
                    FilterGridTile(
                        label = "Akademik",
                        isSelected = !uiState.onlyToday && uiState.selectedPostType == "akademik",
                        activeColor = Color(0xFF9333EA),
                        isDark = isDark,
                        onClick = {
                            if (uiState.onlyToday) viewModel.toggleOnlyToday()
                            viewModel.onPostTypeSelected("akademik")
                        },
                        modifier = Modifier.weight(1f)
                    )
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
                        text = "${uiState.filteredJobs.size}",
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
                                color = MaterialTheme.colorScheme.onSurface,
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
                                color = MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Arama kelimenizi değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
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
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F172A),
                                    contentColor = Color(0xFFF8F9FA)
                                )
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

@Composable
private fun FilterGridTile(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    activeColor: Color = MaterialTheme.colorScheme.primary,
    isDark: Boolean = false
) {
    val shape = RoundedCornerShape(10.dp)
    val bg = when {
        isSelected -> activeColor
        isDark -> Color(0xFF1E293B)
        else -> Color(0xFFF8F9FA)
    }
    val borderCol = when {
        isSelected -> activeColor
        isDark -> Color(0xFF334155)
        else -> Color(0xFFCBD5E1)
    }
    val textCol = when {
        isSelected -> Color(0xFFF8F9FA)
        isDark -> Color(0xFFF1F5F9)
        else -> Color(0xFF0F172A)
    }

    Box(
        modifier = modifier
            .height(44.dp)
            .clip(shape)
            .background(bg)
            .border(1.dp, borderCol, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isSelected) Color(0xFFF8F9FA) else (if (isDark) Color(0xFF34D399) else Color(0xFF059669)),
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
            }
            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                color = textCol,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
