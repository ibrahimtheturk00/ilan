package com.kamuilan.app.ui.components

import android.content.Context
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.InstitutionLogoDetector
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.CancelledRed
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.util.ShareUtils

private fun accentColorForPostType(postType: String?): Color {
    return when (postType?.lowercase()) {
        "memur" -> Color(0xFF0284C7)
        "sozlesmeli", "sözleşmeli" -> Color(0xFF0D9488)
        "isci", "işçi" -> Color(0xFFD97706)
        "akademik" -> Color(0xFF9333EA)
        else -> Color(0xFF64748B)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun JobCard(
    job: JobPost,
    isFavorite: Boolean,
    onFavoriteClick: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val daysRemaining = JobParser.calculateDaysRemaining(job.deadlineAt)
    val isCancelled = JobParser.isCancelled(job.title)
    val isToday = JobParser.isToday(job.publishedAt)
    val kpssType = JobParser.detectKpssType(job)
    val education = JobParser.detectEducationLevel(job)
    val maxAge = JobParser.detectMaxAge(job)

    val isUrgent = !isCancelled && daysRemaining != null && daysRemaining <= 3
    val accentColor = if (isCancelled) CancelledRed else accentColorForPostType(job.postType)
    val displayTitle = JobParser.cleanJobTitle(job.title, job.city, job.originalUrl)
    val displayInstitution = JobParser.cleanInstitution(job.institution, job.title, job.city, job.originalUrl)
    val instInfo = InstitutionLogoDetector.detect(displayInstitution)

    val cardBorderColor = when {
        isCancelled -> Color(0xFFFECACA)
        isUrgent -> Color(0xFFFECDD3)
        else -> Slate200
    }

    val cardShape = RoundedCornerShape(16.dp)

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clip(cardShape)
            .clickable(onClick = onClick)
            .border(
                width = 1.dp,
                color = cardBorderColor,
                shape = cardShape
            )
            .drawBehind {
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(accentColor, accentColor.copy(alpha = 0.4f))
                    ),
                    topLeft = Offset.Zero,
                    size = Size(4.dp.toPx(), size.height)
                )
            },
        shape = cardShape,
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 0.dp,
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 16.dp, top = 16.dp, bottom = 16.dp)
        ) {
            // ── Üst Rozetler ve Aksiyon Butonları (Paylaş & Favori) ────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    if (isToday) TodayAddedBadge()

                    // Kadro Türü Rozeti
                    if (isCancelled) {
                        CancelledBadge()
                    } else {
                        PostTypeSolidBadge(postType = job.postType)
                    }

                    // Kategori Rozeti
                    val catLabel = getWebCategoryLabel(job.category)
                    WebCategoryBadge(text = catLabel)

                    // Kaynak Rozeti
                    if (job.source != null && !job.source.name.isNullOrBlank()) {
                        WebSourceBadge(text = job.source.name)
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    IconButton(
                        onClick = { ShareUtils.shareJob(context, job) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Paylaş",
                            tint = Slate400,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = onFavoriteClick,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = "Favoriye Ekle",
                            tint = if (isFavorite) Color(0xFFF43F5E) else Slate400,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ── Kurum Logo/İkonu + Başlık Alanı ────────────────────────────────────
            Row(verticalAlignment = Alignment.Top) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(instInfo.bgColor)
                        .border(1.dp, instInfo.iconColor.copy(alpha = 0.25f), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = instInfo.icon,
                        contentDescription = instInfo.categoryName,
                        tint = instInfo.iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = displayTitle,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate900,
                        lineHeight = 21.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = displayInstitution,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate500,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // ── Meta Rozetleri: KPSS, Eğitim, Yaş Sınırı ───────────────────────────
            val hasKpss = kpssType != "Belirtilmemiş"
            val hasEdu = education != "Belirtilmemiş"
            val hasAge = maxAge != null

            if (hasKpss || hasEdu || hasAge) {
                Spacer(modifier = Modifier.height(10.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (hasKpss) {
                        WebMetaBadge(
                            text = kpssType,
                            icon = Icons.Default.MilitaryTech,
                            bg = Color(0xFFEFF6FF),
                            textColor = Color(0xFF1D4ED8),
                            borderColor = Color(0xFFBFDBFE)
                        )
                    }
                    if (hasEdu) {
                        WebMetaBadge(
                            text = education,
                            icon = Icons.Default.School,
                            bg = Color(0xFFFAF5FF),
                            textColor = Color(0xFF7E22CE),
                            borderColor = Color(0xFFE9D5FF)
                        )
                    }
                    if (hasAge) {
                        WebMetaBadge(
                            text = "Maks. $maxAge Yaş",
                            icon = Icons.Default.AccessTime,
                            bg = Color(0xFFFFFBEB),
                            textColor = Color(0xFF92400E),
                            borderColor = Color(0xFFFDE68A)
                        )
                    }
                }
            }

            // ── Açıklama Özeti ─────────────────────────────────────────────────────
            if (!job.description.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = job.description,
                    fontSize = 12.sp,
                    color = Slate500,
                    lineHeight = 18.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
            Spacer(modifier = Modifier.height(10.dp))

            // ── Alt Bilgi Çubuğu (Şehir, Başvuru Durumu, İncele ->) ────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Sol Bölüm: Şehir (veya Türkiye Geneli) & Kontenjan
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f, fill = false)
                ) {
                    val displayCity = if (!job.city.isNullOrBlank()) job.city else "Türkiye Geneli"
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Slate400,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = displayCity,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    if (job.positionCount != null && job.positionCount > 0) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.People,
                                contentDescription = null,
                                tint = Slate400,
                                modifier = Modifier.size(13.dp)
                            )
                            Text(
                                text = "${job.positionCount} Kişi",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Slate700,
                                maxLines = 1
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.width(6.dp))

                // Sağ Bölüm: Durum Rozeti (Pulse Efektli) + İncele Butonu
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    when {
                        isCancelled -> {
                            Box(
                                modifier = Modifier
                                    .background(CancelledRed, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 7.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "İptal Edildi",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    maxLines = 1
                                )
                            }
                        }
                        daysRemaining == null -> {
                            Box(
                                modifier = Modifier
                                    .border(1.dp, Slate200, RoundedCornerShape(6.dp))
                                    .background(Color(0xFFF1F5F9), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 7.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "Başvuru Aktif",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Slate700,
                                    maxLines = 1
                                )
                            }
                        }
                        daysRemaining < 0 -> {
                            Box(
                                modifier = Modifier
                                    .border(1.dp, Slate200, RoundedCornerShape(6.dp))
                                    .background(Color(0xFFF1F5F9), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 7.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "Süresi Doldu",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Slate500,
                                    maxLines = 1
                                )
                            }
                        }
                        daysRemaining <= 3 -> {
                            // ── Kalan Gün Geri Sayım Rozeti: Animasyonlu Pulse ────
                            val pulseTransition = rememberInfiniteTransition(label = "pulse_trans")
                            val pulseScale by pulseTransition.animateFloat(
                                initialValue = 1f,
                                targetValue = 1.05f,
                                animationSpec = infiniteRepeatable(
                                    animation = tween(durationMillis = 650, easing = FastOutSlowInEasing),
                                    repeatMode = RepeatMode.Reverse
                                ),
                                label = "pulse_scale"
                            )

                            val urgentText = if (daysRemaining == 0L) "Bugün Son Gün!" else "Son $daysRemaining gün!"
                            Box(
                                modifier = Modifier
                                    .graphicsLayer {
                                        scaleX = pulseScale
                                        scaleY = pulseScale
                                    }
                                    .border(1.dp, Color(0xFFFECDD3), RoundedCornerShape(6.dp))
                                    .background(Color(0xFFFFF1F2), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = urgentText,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFBE123C),
                                    maxLines = 1
                                )
                            }
                        }
                        else -> {
                            Box(
                                modifier = Modifier
                                    .border(1.dp, Color(0xFFFECDD3).copy(alpha = 0.8f), RoundedCornerShape(6.dp))
                                    .background(Color(0xFFFFF1F2), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "$daysRemaining gün kaldı",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFFBE123C),
                                    maxLines = 1
                                )
                            }
                        }
                    }

                    // İncele Linki (Her zaman görünür, shrink-0)
                    Row(
                        modifier = Modifier
                            .clickable { onClick() }
                            .padding(vertical = 3.dp, horizontal = 2.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text(
                            text = "İncele",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandPrimary,
                            maxLines = 1
                        )
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = BrandPrimary,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }
        }
    }
}

// ── Web Tarzı Rozetler ──────────────────────────────────────────────────────────

@Composable
private fun PostTypeSolidBadge(postType: String?) {
    val (label, bg) = when (postType?.lowercase()) {
        "isci", "işçi" -> "İşçi" to Color(0xFFD97706)
        "memur" -> "Memur" to Color(0xFF0284C7)
        "sozlesmeli", "sözleşmeli" -> "Sözleşmeli" to Color(0xFF0D9488)
        "akademik" -> "Akademik" to Color(0xFF9333EA)
        else -> "Genel" to Color(0xFF334155)
    }
    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 2.5.dp)
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
    }
}

@Composable
private fun WebCategoryBadge(text: String) {
    Box(
        modifier = Modifier
            .background(Color(0xFFF1F5F9), RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 2.5.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF475569)
        )
    }
}

@Composable
private fun WebSourceBadge(text: String) {
    Box(
        modifier = Modifier
            .border(1.dp, Color(0xFFC7D2FE), RoundedCornerShape(6.dp))
            .background(Color(0xFFEEF2FF), RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 2.5.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF4338CA)
        )
    }
}

@Composable
private fun WebMetaBadge(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    bg: Color,
    textColor: Color,
    borderColor: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier
            .border(1.dp, borderColor, RoundedCornerShape(6.dp))
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 2.5.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = textColor,
            modifier = Modifier.size(11.dp)
        )
        Text(
            text = text,
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor
        )
    }
}

private fun getWebCategoryLabel(category: String?): String {
    return when (category?.lowercase()?.trim()) {
        "bilisim" -> "Bilişim & Yazılım"
        "saglik" -> "Sağlık & Tıp"
        "egitim" -> "Eğitim & Akademi"
        "muhendislik" -> "Mühendislik & Teknik"
        "hukuk" -> "Hukuk & Adalet"
        "maliye" -> "Maliye & Finans"
        else -> "Genel / Diğer"
    }
}
