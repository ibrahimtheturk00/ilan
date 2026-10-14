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
import com.kamuilan.app.ui.theme.PressScaleBox
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

    val rawTitle = JobParser.cleanJobTitle(job.title, job.city, job.originalUrl)
    val displayInstitution = JobParser.cleanInstitution(job.institution, job.title, job.city, job.originalUrl)
    val instInfo = InstitutionLogoDetector.detect(displayInstitution)

    val normTitle = rawTitle.lowercase().replace(Regex("""[^a-z0-9ğüşıöç]"""), "")
    val normInst = displayInstitution.lowercase().replace(Regex("""[^a-z0-9ğüşıöç]"""), "")
    val isTitleIdenticalToInst = normTitle == normInst

    val displayTitle = if (isTitleIdenticalToInst) {
        if (rawTitle.lowercase().contains("personel") || rawTitle.lowercase().contains("alım")) rawTitle
        else "$rawTitle Personel Alımı"
    } else rawTitle

    val cleanedDesc = JobParser.cleanJobDescription(job.description, displayTitle, displayInstitution)

    val cardBorderColor = when {
        isCancelled -> Color(0xFFFCA5A5)
        isUrgent -> Color(0xFFFDA4AF)
        else -> Color(0xFFE4E4E7)
    }

    val cardShape = RoundedCornerShape(10.dp)

    PressScaleBox(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        pressedScale = 0.985f
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(cardShape)
                .border(
                    width = 1.dp,
                    color = cardBorderColor,
                    shape = cardShape
                ),
            shape = cardShape,
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 0.dp,
            shadowElevation = 0.5.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // ── Üst Rozetler ve Aksiyon Butonları (Paylaş & Favori) ────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f, fill = false)
                    ) {
                        // Kadro Türü Rozeti
                        if (isCancelled) {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFFEE2E2), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.5.dp)
                            ) {
                                Text(
                                    text = "İptal",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFFDC2626)
                                )
                            }
                        } else {
                            PostTypeSolidBadge(postType = job.postType)
                        }

                        // Kaynak & Kategori sessiz metin
                        val catLabel = getWebCategoryLabel(job.category)
                        val sourceName = job.source?.name ?: "Resmî Gazete"
                        Text(
                            text = "$sourceName · $catLabel",
                            fontSize = 12.sp,
                            color = Color(0xFF71717A),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        if (isToday) {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFECFDF5), RoundedCornerShape(6.dp))
                                    .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Bugün",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF047857)
                                )
                            }
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        IconButton(
                            onClick = { ShareUtils.shareJob(context, job) },
                            modifier = Modifier.size(30.dp)
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
                            modifier = Modifier.size(30.dp)
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

                // ── Kurum Logo/İkonu + Kurum Adı ──────────────────────────────────────
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(instInfo.bgColor)
                            .border(1.dp, instInfo.iconColor.copy(alpha = 0.25f), RoundedCornerShape(6.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = instInfo.icon,
                            contentDescription = instInfo.categoryName,
                            tint = instInfo.iconColor,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Text(
                        text = displayInstitution,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF3F3F46),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // ── İlan Başlığı (Tekrar değilse göster, punto artırıldı: 17sp) ────────
                if (!isTitleIdenticalToInst) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = displayTitle,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF09090B),
                        lineHeight = 23.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
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
                                iconColor = Color(0xFF2563EB)
                            )
                        }
                        if (hasEdu) {
                            WebMetaBadge(
                                text = education,
                                icon = Icons.Default.School,
                                iconColor = Color(0xFF9333EA)
                            )
                        }
                        if (hasAge) {
                            WebMetaBadge(
                                text = "Maks. $maxAge Yaş",
                                icon = Icons.Default.AccessTime,
                                iconColor = Color(0xFFD97706)
                            )
                        }
                    }
                }

                // ── Açıklama Özeti (Temizlenmiş, punto 14sp) ───────────────────────────
                if (cleanedDesc != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = cleanedDesc,
                        fontSize = 14.sp,
                        color = Color(0xFF71717A),
                        lineHeight = 20.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = Color(0xFFF4F4F5), thickness = 1.dp)
                Spacer(modifier = Modifier.height(12.dp))

                // ── Alt Bilgi Çubuğu (Şehir, Başvuru Durumu, İncele ->) ────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Sol: Şehir & Kontenjan
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f, fill = false)
                    ) {
                        val displayCity = if (!job.city.isNullOrBlank()) job.city else "Türkiye Geneli"
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = Color(0xFFA1A1AA),
                                modifier = Modifier.size(15.dp)
                            )
                            Text(
                                text = displayCity,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF3F3F46),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        if (job.positionCount != null && job.positionCount > 0) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier
                                    .background(Color(0xFFF4F4F5), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.People,
                                    contentDescription = null,
                                    tint = Color(0xFFA1A1AA),
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = "${job.positionCount} Kişi",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF18181B),
                                    maxLines = 1
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Sağ: Süre Durum Rozeti (3-Kademeli) + İncele Butonu
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        when {
                            isCancelled -> {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFEE2E2), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFFCA5A5), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "İptal Edildi",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFDC2626),
                                        maxLines = 1
                                    )
                                }
                            }
                            daysRemaining == null -> {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFF4F4F5), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "Başvuru Aktif",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF52525B),
                                        maxLines = 1
                                    )
                                }
                            }
                            daysRemaining < 0 -> {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFF4F4F5), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "Süresi Doldu",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF71717A),
                                        maxLines = 1
                                    )
                                }
                            }
                            daysRemaining <= 3 -> {
                                val urgentText = if (daysRemaining == 0L) "Bugün Son Gün!" else "Son $daysRemaining gün!"
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFFE4E6), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFFECDD3), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = urgentText,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFBE123C),
                                        maxLines = 1
                                    )
                                }
                            }
                            daysRemaining <= 7 -> {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFEF3C7), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "$daysRemaining gün kaldı",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF92400E),
                                        maxLines = 1
                                    )
                                }
                            }
                            else -> {
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFF4F4F5), RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "$daysRemaining gün kaldı",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Normal,
                                        color = Color(0xFF52525B),
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        // İncele Butonu (Minimalist Linear/Apple stili)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xFFF4F4F5))
                                .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(6.dp))
                                .clickable { onClick() }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "İncele",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF18181B),
                                    maxLines = 1
                                )
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = null,
                                    tint = Color(0xFF18181B),
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Web Tarzı Rozetler ──────────────────────────────────────────────────────────

@Composable
private fun PostTypeSolidBadge(postType: String?) {
    val (label, bg, textColor) = when (postType?.lowercase()) {
        "isci", "işçi" -> Triple("İşçi", Color(0xFFFEF3C7), Color(0xFFB45309))
        "memur" -> Triple("Memur", Color(0xFFE0F2FE), Color(0xFF0369A1))
        "sozlesmeli", "sözleşmeli" -> Triple("Sözleşmeli", Color(0xFFCCFBF1), Color(0xFF0F766E))
        "akademik" -> Triple("Akademik", Color(0xFFF3E8FF), Color(0xFF7E22CE))
        else -> Triple("Genel", Color(0xFFF4F4F5), Color(0xFF3F3F46))
    }
    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor
        )
    }
}

@Composable
private fun WebMetaBadge(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier
            .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(6.dp))
            .background(Color(0xFFF4F4F5), RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = iconColor,
            modifier = Modifier.size(13.dp)
        )
        Text(
            text = text,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF3F3F46)
        )
    }
}

private fun getWebCategoryLabel(category: String?): String {
    return when (category?.lowercase()?.trim()) {
        "bilisim" -> "Bilişim"
        "saglik" -> "Sağlık"
        "egitim" -> "Eğitim"
        "muhendislik" -> "Mühendislik"
        "hukuk" -> "Hukuk"
        "maliye" -> "Maliye"
        else -> "Genel"
    }
}
