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
                Row(verticalAlignment = Alignment.CenterVertically) {
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
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Text(
                            text = "Kamu İlan",
                            fontFamily = BricolageGrotesque,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            letterSpacing = (-0.3).sp
                        )
                        Text(
                            text = "Resmî Portallar • Anlık Veri Akışı",
                            fontFamily = Manrope,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f)
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // 1. Hızlı Tema Değiştirme Butonu
                    IconButton(
                        onClick = onToggleTheme,
                        modifier = Modifier
                            .size(38.dp)
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(10.dp))
                    ) {
                        val icon = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode
                        val tint = if (isDark) Color(0xFF38BDF8) else Color(0xFFF59E0B)
                        Icon(
                            imageVector = icon,
                            contentDescription = "Tema Değiştir",
                            tint = tint,
                            modifier = Modifier.size(19.dp)
                        )
                    }

                    // 2. 4x4 Kategori Izgarasını Açan Buton
                    IconButton(
                        onClick = { showCategoryGridDialog = true },
                        modifier = Modifier
                            .size(38.dp)
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), RoundedCornerShape(10.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Kategoriler Izgara",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(19.dp)
                        )
                    }

                    // 3. Yenile Butonu
                    IconButton(
                        onClick = { viewModel.loadJobs() },
                        modifier = Modifier
                            .size(38.dp)
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(10.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Yenile",
                            tint = MaterialTheme.colorScheme.onSurface,
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
                        "Unvan, kurum veya şehir ara (örn. Mühendis)...",
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f),
                        fontSize = 14.sp
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

            Spacer(modifier = Modifier.height(10.dp))

            // ── Hızlı Arama Etiketleri (Website ile Birebir Renk & Filtre Eşleşmesi) ──
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
                            color = if (isSelected) (if (isDark) Color(0xFF090D16) else Color.White) else brandCol
                        )
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
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BrandPrimary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // ── Hızlı Filtre Pill'leri: Bugün Eklenenler & Kadro Türleri ────────
            val memurColor = if (isDark) Color(0xFF38BDF8) else Color(0xFF059669)
            val sozlesmeliColor = if (isDark) Color(0xFF818CF8) else Color(0xFF2563EB)
            val isciColor = if (isDark) Color(0xFFF59E0B) else Color(0xFFD97706)
            val akademikColor = if (isDark) Color(0xFFA855F7) else Color(0xFF9333EA)

            val postTypePills = listOf(
                Triple("all", "Tümü", MaterialTheme.colorScheme.onSurface),
                Triple("memur", "Memur", memurColor),
                Triple("sozlesmeli", "Sözleşmeli", sozlesmeliColor),
                Triple("isci", "İşçi", isciColor),
                Triple("akademik", "Akademik", akademikColor)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                // 1. Özel "Bugün Eklenenler" Pill
                val isTodaySelected = uiState.onlyToday
                val todayShape = RoundedCornerShape(20.dp)
                Box(
                    modifier = Modifier
                        .clickable { viewModel.toggleOnlyToday() }
                        .then(
                            if (isTodaySelected) {
                                Modifier.background(
                                    brush = Brush.horizontalGradient(
                                        listOf(ActiveEmerald, Color(0xFF047857))
                                    ),
                                    shape = todayShape
                                )
                            } else {
                                Modifier
                                    .background(
                                        color = if (isDark) Color(0x26059669) else ActiveEmeraldBg,
                                        shape = todayShape
                                    )
                                    .border(width = 1.dp, color = if (isDark) Color(0x4D059669) else ActiveEmeraldBorder, shape = todayShape)
                            }
                        )
                        .padding(horizontal = 13.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = if (isTodaySelected) Color.White else if (isDark) Color(0xFF34D399) else ActiveEmerald,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "Bugün Eklenenler",
                            fontSize = 12.sp,
                            fontWeight = if (isTodaySelected) FontWeight.Bold else FontWeight.SemiBold,
                            color = if (isTodaySelected) Color.White else if (isDark) Color(0xFF34D399) else ActiveEmerald
                        )
                    }
                }
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
                                            color = if (isPressed) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface,
                                            shape = shape
                                        )
                                        .border(width = 1.dp, color = MaterialTheme.colorScheme.outline, shape = shape)
                                }
                            )
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = typeLabel,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
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
