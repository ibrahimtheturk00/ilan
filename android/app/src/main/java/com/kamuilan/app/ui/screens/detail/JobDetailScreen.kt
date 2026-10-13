package com.kamuilan.app.ui.screens.detail

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import com.kamuilan.app.ui.components.AppBadge
import com.kamuilan.app.ui.components.CityBadge
import com.kamuilan.app.ui.components.EducationBadge
import com.kamuilan.app.ui.components.KpssBadge
import com.kamuilan.app.ui.components.UrgentBadge
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.theme.BluePrimary
import com.kamuilan.app.ui.theme.SlateBorder
import com.kamuilan.app.ui.theme.SlateDark
import com.kamuilan.app.ui.theme.SlateMuted
import com.kamuilan.app.ui.theme.UrgentRed

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
                title = { Text("İlan Detayı", fontSize = 17.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri")
                    }
                },
                actions = {
                    if (job != null) {
                        val isFavorite = favoriteIds.contains(job.id.toString())
                        IconButton(onClick = { homeViewModel.toggleFavorite(job.id) }) {
                            Icon(
                                imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Favoriye Ekle",
                                tint = if (isFavorite) UrgentRed else SlateDark
                            )
                        }

                        IconButton(onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, job.title)
                                putExtra(
                                    Intent.EXTRA_TEXT,
                                    "${job.title}\nKurum: ${job.institution ?: "Kamu Kurumu"}\nDetaylar: ${job.originalUrl ?: "https://kamuilanmerkezi.com"}"
                                )
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "İlanı Paylaş"))
                        }) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = "Paylaş")
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
                Text("İlan bulunamadı.", color = SlateMuted)
            }
        } else {
            val daysRemaining = JobParser.calculateDaysRemaining(job.deadlineAt)
            val kpssType = JobParser.detectKpssType(job)
            val education = JobParser.detectEducationLevel(job)

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Kurum Adı & Kaynak
                Text(
                    text = job.institution ?: "T.C. Kamu Kurumu",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = BluePrimary
                )

                Spacer(modifier = Modifier.height(6.dp))

                // İlan Başlığı
                Text(
                    text = job.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark,
                    lineHeight = 24.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Rozetler
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (daysRemaining != null && daysRemaining <= 3) {
                        UrgentBadge(daysRemaining = daysRemaining)
                    }

                    KpssBadge(kpssType = kpssType)
                    EducationBadge(educationLevel = education)

                    if (!job.city.isNullOrBlank()) {
                        CityBadge(city = job.city)
                    }

                    if (job.positionCount != null && job.positionCount > 0) {
                        AppBadge(
                            text = "${job.positionCount} Kişi",
                            backgroundColor = Color(0xFFF0FDF4),
                            textColor = Color(0xFF15803D)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Tarih Bilgi Kartı
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(SlateBorder))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Yayın Tarihi:", fontSize = 12.sp, color = SlateMuted)
                            Text(job.publishedAt?.take(10) ?: "Belirtilmemiş", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SlateDark)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Son Başvuru:", fontSize = 12.sp, color = SlateMuted)
                            Text(job.deadlineAt?.take(10) ?: "Belirtilmemiş", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = UrgentRed)
                        }
                        if (job.source != null) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Resmî Kaynak:", fontSize = 12.sp, color = SlateMuted)
                                Text(job.source.name, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SlateDark)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // İlan Açıklaması / Detaylar
                Text(
                    text = "İlan Detayları ve Başvuru Şartları",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = SlateDark
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = job.description ?: "Bu ilan için ek açıklama bulunmamaktadır. Detaylar ve resmî başvuru kılavuzu için aşağıdaki bağlantıdan resmî portala ulaşabilirsiniz.",
                    fontSize = 14.sp,
                    color = SlateDark,
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
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                ) {
                    Icon(imageVector = Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.padding(start = 8.dp))
                    Text("Resmî İlana & Başvuruya Git")
                }
            }
        }
    }
}
