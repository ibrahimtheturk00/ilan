package com.kamuilan.app.ui.screens.personalized

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PersonPin
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.data.model.TurkishMatcher
import com.kamuilan.app.ui.components.JobCard
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.theme.ActiveEmerald
import com.kamuilan.app.ui.theme.ActiveEmeraldBg
import com.kamuilan.app.ui.theme.ActiveEmeraldBorder
import com.kamuilan.app.ui.components.DotGridBackground
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.BrandSubtle
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900

@Composable
fun PersonalizedScreen(
    homeViewModel: HomeViewModel,
    onJobClick: (Long) -> Unit,
    onEditPreferences: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val preferencesManager = remember { PreferencesManager(context) }
    val userProfile by preferencesManager.userProfileFlow.collectAsState(initial = null)

    val uiState by homeViewModel.uiState.collectAsState()
    val favoriteIds by homeViewModel.favoriteIds.collectAsState()

    // Eşleşen ilanları hesapla ve puanla
    val matchedJobs = remember(uiState.allJobs, userProfile) {
        val profile = userProfile
        if (profile == null || !profile.isOnboardingCompleted) {
            emptyList()
        } else {
            uiState.allJobs.mapNotNull { job ->
                val departmentMatches = profile.department.isBlank() || profile.department == "all" ||
                        TurkishMatcher.matchesCategory(job, profile.department)

                val educationMatches = profile.educationLevel.isBlank() || profile.educationLevel == "Tümü" ||
                        JobParser.detectEducationLevel(job).equals(profile.educationLevel, ignoreCase = true)

                // KPSS eşleşmesi: Kullanıcı puan türü seçse bile "KPSS Şartsız" ilanlar DAİMA gösterilir
                val detectedKpss = JobParser.detectKpssType(job)
                val isKpssFree = JobParser.isKpssFree(job)
                val kpssMatches = profile.kpssType.isBlank() || profile.kpssType == "Tümü" ||
                        detectedKpss.equals(profile.kpssType, ignoreCase = true) ||
                        isKpssFree

                val cityMatches = profile.preferredCity.isBlank() || profile.preferredCity == "Tüm Türkiye" ||
                        (job.city != null && TurkishMatcher.normalize(job.city).contains(TurkishMatcher.normalize(profile.preferredCity)))

                // Puanlama: Doğrudan KPSS puanı eşleşmesi +3, KPSS Şartsız +2
                var matchScore = 0
                if (departmentMatches) matchScore += 4
                if (educationMatches) matchScore += 3
                if (kpssMatches) {
                    matchScore += if (detectedKpss.equals(profile.kpssType, ignoreCase = true)) 3 else 2
                }
                if (cityMatches) matchScore += 1

                if (departmentMatches || (educationMatches && kpssMatches)) {
                    Pair(job, matchScore)
                } else {
                    null
                }
            }.sortedByDescending { it.second }.map { it.first }
        }
    }

    DotGridBackground(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            // Başlık Alanı
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Bana Özel İlanlar",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = BrandPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "Mezuniyetinize ve KPSS puanınıza en uygun alımlar",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                OutlinedButton(
                    onClick = onEditPreferences,
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurface)
                ) {
                    Icon(
                        imageVector = Icons.Default.Tune,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Kriterler",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        softWrap = false
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Aktif Kriter Bilgi Kartı
            if (userProfile != null && userProfile!!.isOnboardingCompleted) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            val deptDisplay = com.kamuilan.app.data.model.YokDepartments.getDisplayName(userProfile!!.department)
                            val eduDisplay = userProfile!!.educationLevel.ifBlank { "Tüm Eğitimler" }
                            val kpssDisplay = userProfile!!.kpssType.ifBlank { "Tüm KPSS" }
                            Text(
                                text = "$deptDisplay • $eduDisplay • $kpssDisplay (+KPSS Şartsız)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface,
                                maxLines = 1
                            )
                        }

                        Text(
                            text = "${matchedJobs.size} İlan",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(start = 6.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            // Durumlar
            when {
                uiState.isLoading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }

                userProfile == null || !userProfile!!.isOnboardingCompleted -> {
                    // Profil henüz ayarlanmamış
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PersonPin,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(56.dp)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Kriterlerinizi Belirleyin",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Hangi bölümden mezun olduğunuzu ve KPSS puan türünüzü seçerek size özel filtrelenmiş ilanları görün.",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                                lineHeight = 19.sp
                            )
                            Spacer(modifier = Modifier.height(18.dp))
                            Button(
                                onClick = onEditPreferences,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text("Kurulumu Başlat")
                            }
                        }
                    }
                }

                matchedJobs.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Text(
                                text = "Şu anda seçtiğiniz kriterlerle tam eşleşen ilan bulunamadı",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Kriterlerinizi biraz daha genişleterek daha fazla kamu ilanına ulaşabilirsiniz.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Button(
                                onClick = onEditPreferences,
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text("Kriterleri Genişlet")
                            }
                        }
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 90.dp)
                    ) {
                        items(matchedJobs, key = { it.id }) { job ->
                            Column {
                                // Eşleşme Bildirim Şeridi
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(ActiveEmeraldBg, RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp))
                                        .border(width = 1.dp, color = ActiveEmeraldBorder, shape = RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = ActiveEmerald,
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Text(
                                        text = "Kriterlerinizle Doğrudan Eşleşen Kadro",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ActiveEmerald
                                    )
                                }

                                JobCard(
                                    job = job,
                                    isFavorite = favoriteIds.contains(job.id.toString()),
                                    onFavoriteClick = { homeViewModel.toggleFavorite(job.id) },
                                    onClick = { onJobClick(job.id) },
                                    modifier = Modifier.padding(top = 0.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
