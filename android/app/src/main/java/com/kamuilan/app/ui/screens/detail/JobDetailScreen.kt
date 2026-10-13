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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
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

    val job = uiState.allJobs.firstOrNull { it.id == jobId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("İlan Detayı", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Slate900) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Slate700)
                    }
                },
                actions = {
                    if (job != null) {
                        val isFavorite = favoriteIds.contains(job.id.toString())
                        IconButton(onClick = { homeViewModel.toggleFavorite(job.id) }) {
                            Icon(
                                imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Favoriye Ekle",
                                tint = if (isFavorite) UrgentRose else Slate700
                            )
                        }

                        IconButton(onClick = { shareJobDetails(context, job) }) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = "Paylaş", tint = Slate700)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
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
                Text("İlan bilgisi bulunamadı.", color = Slate500, fontSize = 14.sp)
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
                    .padding(16.dp)
            ) {
                // Kurum Bilgisi & İkon
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Slate100, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = null,
                            tint = BrandPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = job.institution ?: "T.C. Kamu Kurumu",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Slate700
                        )
                        if (job.source != null) {
                            Text(
                                text = job.source.name,
                                fontSize = 11.sp,
                                color = Slate400
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // İlan Başlığı
                Text(
                    text = job.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900,
                    lineHeight = 25.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Rozetler
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (isToday) TodayAddedBadge()
                    if (isCancelled) CancelledBadge() else PostTypeBadge(postType = job.postType)
                    if (!isCancelled && daysRemaining != null && daysRemaining <= 3) UrgentBadge(daysRemaining = daysRemaining)
                    KpssBadge(kpssType = kpssType)
                    EducationBadge(educationLevel = education)
                    if (maxAge != null) AgeBadge(maxAge = maxAge)
                    if (!job.city.isNullOrBlank()) CityBadge(city = job.city)
                    if (job.positionCount != null && job.positionCount > 0) PositionCountBadge(count = job.positionCount)
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Özet Bilgi Kartı (Tarihler & Şehir)
                val cardShape = RoundedCornerShape(14.dp)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(width = 1.dp, color = Slate200, shape = cardShape),
                    shape = cardShape,
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        DetailInfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Yayın Tarihi:",
                            value = job.publishedAt?.take(10) ?: "Belirtilmemiş",
                            valueColor = Slate900
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        DetailInfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Son Başvuru:",
                            value = job.deadlineAt?.take(10) ?: "Belirtilmemiş",
                            valueColor = UrgentRose,
                            isBold = true
                        )
                        if (!job.city.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            DetailInfoRow(
                                icon = Icons.Default.LocationOn,
                                label = "Görev İli:",
                                value = job.city,
                                valueColor = Slate900
                            )
                        }
                        if (job.positionCount != null && job.positionCount > 0) {
                            Spacer(modifier = Modifier.height(8.dp))
                            DetailInfoRow(
                                icon = Icons.Default.People,
                                label = "Kontenjan:",
                                value = "${job.positionCount} Kişi",
                                valueColor = Slate900,
                                isBold = true
                            )
                        }
                        if (job.source != null) {
                            Spacer(modifier = Modifier.height(8.dp))
                            DetailInfoRow(
                                icon = Icons.Default.Public,
                                label = "Resmî Kaynak:",
                                value = job.source.name,
                                valueColor = Slate900
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // İlan Detayları ve Açıklama Başlığı
                Text(
                    text = "İlan Detayları ve Başvuru Şartları",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = job.description ?: "Bu ilan için ek açıklama bulunmamaktadır. Başvuru şartları, sınav takvimi ve kadro dağılımı için aşağıdaki bağlantıdan resmî ilana ulaşabilirsiniz.",
                    fontSize = 13.sp,
                    color = Slate700,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(28.dp))

                // Resmî İlana Git Butonu
                Button(
                    onClick = {
                        val url = job.originalUrl
                        if (!url.isNullOrBlank()) {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            context.startActivity(intent)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                ) {
                    Icon(imageVector = Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Resmî İlana & Başvuruya Git", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun DetailInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    valueColor: Color,
    isBold: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = icon, contentDescription = null, tint = Slate400, modifier = Modifier.size(14.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text(text = label, fontSize = 12.sp, color = Slate500)
        }
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Medium,
            color = valueColor
        )
    }
}

private fun shareJobDetails(context: Context, job: JobPost) {
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, job.title)
        putExtra(
            Intent.EXTRA_TEXT,
            "${job.title}\nKurum: ${job.institution ?: "Kamu Kurumu"}\nDetay: ${job.originalUrl ?: "https://kamuilanmerkezi.com"}"
        )
    }
    context.startActivity(Intent.createChooser(shareIntent, "İlanı Paylaş"))
}
