package com.kamuilan.app.ui.screens.detail

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.repository.JobRepository
import com.kamuilan.app.ui.components.InstitutionLogoView
import com.kamuilan.app.ui.theme.BricolageGrotesque
import com.kamuilan.app.ui.theme.Manrope
import com.kamuilan.app.ui.components.AgeBadge
import com.kamuilan.app.ui.components.CancelledBadge
import com.kamuilan.app.ui.components.CityBadge
import com.kamuilan.app.ui.components.EducationBadge
import com.kamuilan.app.ui.components.KpssBadge
import com.kamuilan.app.ui.components.PositionCountBadge
import com.kamuilan.app.ui.components.PostTypeBadge
import com.kamuilan.app.ui.components.SourceBadge
import com.kamuilan.app.ui.components.TodayAddedBadge
import com.kamuilan.app.ui.components.UrgentBadge
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.theme.BrandDark
import com.kamuilan.app.ui.theme.BrandLight
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.ui.theme.UrgentRose

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun JobDetailScreen(
    jobId: Long,
    homeViewModel: HomeViewModel,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val uiState by homeViewModel.uiState.collectAsState()
    val favoriteIds by homeViewModel.favoriteIds.collectAsState()

    var networkJob by remember { mutableStateOf<JobPost?>(null) }
    var isFetching by remember { mutableStateOf(false) }
    val repository = remember { JobRepository() }

    val cachedJob = uiState.allJobs.firstOrNull { it.id == jobId }
    val job = cachedJob ?: networkJob

    LaunchedEffect(jobId, cachedJob) {
        if (cachedJob == null && networkJob == null) {
            isFetching = true
            val res = repository.fetchJobById(jobId)
            networkJob = res.getOrNull()
            isFetching = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Yumuşak ve kesiksiz üst gradyan (En tepeden başlar, TopAppBar ve başlık arkasından pürüzsüzce akar)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.09f),
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.03f),
                            Color.Transparent
                        )
                    )
                )
        )

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            "İlan Detayı",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBackClick) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Geri",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    },
                    actions = {
                        if (job != null) {
                            val isFavorite = favoriteIds.contains(job.id.toString())
                            IconButton(onClick = { homeViewModel.toggleFavorite(job.id) }) {
                                Icon(
                                    imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                    contentDescription = "Favoriye Ekle",
                                    tint = if (isFavorite) UrgentRose else MaterialTheme.colorScheme.onSurface
                                )
                            }
                            IconButton(onClick = { shareJobDetails(context, job) }) {
                                Icon(
                                    imageVector = Icons.Default.Share,
                                    contentDescription = "Paylaş",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent
                    )
                )
            }
        ) { innerPadding ->
            if (job == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    if (isFetching || uiState.isLoading) {
                        CircularProgressIndicator(
                            color = BrandPrimary,
                            modifier = Modifier.size(36.dp)
                        )
                    } else {
                        Text("İlan bilgisi bulunamadı.", color = Slate500, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }
            } else {
                val daysRemaining = JobParser.calculateDaysRemaining(job.deadlineAt)
                val isCancelled = JobParser.isCancelled(job.title)
                val isToday = JobParser.isToday(job.publishedAt)
                val kpssType = JobParser.detectKpssType(job)
                val education = JobParser.detectEducationLevel(job)
                val maxAge = JobParser.detectMaxAge(job)

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .verticalScroll(rememberScrollState())
                ) {
                    // ── Hero Header (Kesiksiz akıcı arka plan) ──────────────────────
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp)
                    ) {
                        // Kurum satırı
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            InstitutionLogoView(
                                institution = job.institution,
                                size = 42.dp
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = job.institution ?: "T.C. Kamu Kurumu",
                                    fontFamily = Manrope,
                                    fontSize = 14.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (job.source != null) {
                                    Text(
                                        text = job.source.name,
                                        fontFamily = Manrope,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // İlan Başlığı
                        Text(
                            text = job.title,
                            fontFamily = BricolageGrotesque,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 26.sp
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Rozetler
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (isToday) TodayAddedBadge()
                            if (isCancelled) CancelledBadge()
                            else PostTypeBadge(postType = job.postType)
                            if (!isCancelled && daysRemaining != null && daysRemaining <= 3)
                                UrgentBadge(daysRemaining = daysRemaining)
                            KpssBadge(kpssType = kpssType)
                            EducationBadge(educationLevel = education)
                            if (maxAge != null) AgeBadge(maxAge = maxAge)
                            if (!job.city.isNullOrBlank()) CityBadge(city = job.city)
                            if (job.positionCount != null && job.positionCount > 0)
                                PositionCountBadge(count = job.positionCount)
                            if (job.source != null) SourceBadge(sourceName = job.source.name)
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 1.dp)

                // ── Stat Kartları (3'lü grid) ────────────────────────────────
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        StatCard(
                            label = "Yayın Tarihi",
                            value = job.publishedAt?.take(10) ?: "—",
                            icon = Icons.Default.CalendarToday,
                            iconColor = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            label = "Son Başvuru",
                            value = job.deadlineAt?.take(10) ?: "—",
                            icon = Icons.Default.CalendarToday,
                            iconColor = UrgentRose,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    if (!job.city.isNullOrBlank() || (job.positionCount != null && job.positionCount > 0)) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            if (!job.city.isNullOrBlank()) {
                                StatCard(
                                    label = "Görev İli",
                                    value = job.city,
                                    icon = Icons.Default.LocationOn,
                                    iconColor = Color(0xFF059669),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (job.positionCount != null && job.positionCount > 0) {
                                StatCard(
                                    label = "Kontenjan",
                                    value = "${job.positionCount} Kişi",
                                    icon = Icons.Default.People,
                                    iconColor = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (job.city.isNullOrBlank() || job.positionCount == null || job.positionCount <= 0) {
                                // Boş yer doldurucu
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }

                    if (job.source != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                                .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Public,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Resmî Kaynak", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(
                                    text = job.source.name,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // ── Açıklama ────────────────────────────────────────────
                    Text(
                        text = "İlan Detayları ve Başvuru Şartları",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.85f), RoundedCornerShape(14.dp))
                            .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = job.description
                                ?: "Bu ilan için ek açıklama bulunmamaktadır. Başvuru şartları, sınav takvimi ve kadro dağılımı için aşağıdaki bağlantıdan resmî ilana ulaşabilirsiniz.",
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 22.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    // ── CTA Butonu ───────────────────────────────────────────
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                brush = Brush.horizontalGradient(
                                    listOf(
                                        MaterialTheme.colorScheme.primary,
                                        MaterialTheme.colorScheme.secondary
                                    )
                                )
                            )
                            .clickable {
                                val url = JobParser.resolveApplicationUrl(job.institution, job.originalUrl)
                                if (url.isNotBlank()) {
                                    context.startActivity(
                                        Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                    )
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.OpenInNew,
                                contentDescription = null,
                                tint = Color(0xFFF8F9FA),
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "Resmî İlana & Başvuruya Git",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFF8F9FA)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }
            }
        }
    }
}
}

@Composable
private fun StatCard(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.85f), RoundedCornerShape(12.dp))
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(iconColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(15.dp)
                    )
                }
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = label, 
                    fontSize = 12.sp, 
                    fontWeight = FontWeight.SemiBold, 
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 13.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

private fun shareJobDetails(context: Context, job: JobPost) {
    com.kamuilan.app.util.ShareUtils.shareJob(context, job)
}
