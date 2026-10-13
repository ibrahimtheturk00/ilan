package com.kamuilan.app.ui.components

import android.content.Context
import android.content.Intent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.CancelledRed
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate50
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.ui.theme.UrgentRose
import com.kamuilan.app.ui.theme.UrgentRoseBg
import com.kamuilan.app.ui.theme.UrgentRoseBorder

// Kart sol kenar rengi: kadro türüne göre
private fun accentColorForPostType(postType: String?): Color {
    return when (postType?.lowercase()) {
        "memur" -> Color(0xFF0284C7)
        "sozlesmeli", "sözleşmeli" -> Color(0xFF0D9488)
        "isci", "işçi" -> Color(0xFFD97706)
        "akademik" -> Color(0xFF9333EA)
        else -> Color(0xFF64748B)
    }
}

fun Modifier.coloredShadow(
    color: Color,
    borderRadius: Dp = 16.dp,
    blurRadius: Dp = 8.dp,
    offsetX: Dp = 0.dp,
    offsetY: Dp = 4.dp
): Modifier = this.drawBehind {
    this.drawIntoCanvas {
        val paint = Paint()
        val frameworkPaint = paint.asFrameworkPaint()
        val spreadPixel = blurRadius.toPx()
        frameworkPaint.color = android.graphics.Color.TRANSPARENT
        frameworkPaint.setShadowLayer(
            spreadPixel, offsetX.toPx(), offsetY.toPx(), color.copy(alpha = 0.15f).toArgb()
        )
        it.drawRoundRect(
            left = 0f,
            top = 0f,
            right = size.width,
            bottom = size.height,
            radiusX = borderRadius.toPx(),
            radiusY = borderRadius.toPx(),
            paint = paint
        )
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

    val accentColor = if (isCancelled) CancelledRed else accentColorForPostType(job.postType)
    val isUrgent = !isCancelled && daysRemaining != null && daysRemaining <= 3

    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.978f else 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 400f),
        label = "card_scale"
    )

    val cardShape = RoundedCornerShape(18.dp)

    Box(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .coloredShadow(
                color = if (isUrgent) UrgentRose else accentColor,
                blurRadius = if (isUrgent) 12.dp else 8.dp,
                offsetY = 3.dp
            )
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(cardShape)
                .clickable(
                    interactionSource = interactionSource,
                    indication = null,
                    onClick = onClick
                )
                .border(
                    width = 1.dp,
                    color = if (isUrgent) UrgentRoseBorder.copy(alpha = 0.6f) else Slate200,
                    shape = cardShape
                ),
            shape = cardShape,
            color = Color.White,
            tonalElevation = 0.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Min)
            ) {
                // Sol renkli aksan şeridi: kartın en üstünden en altına kadar tam uzanır
                Box(
                    modifier = Modifier
                        .width(4.dp)
                        .fillMaxHeight()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(accentColor, accentColor.copy(alpha = 0.4f))
                            )
                        )
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 14.dp, end = 14.dp, top = 14.dp, bottom = 12.dp)
                ) {
                    // Üst Satır: Rozetler + Aksiyon Butonları
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(5.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            if (isToday) TodayAddedBadge()
                            if (isCancelled) CancelledBadge()
                            else PostTypeBadge(postType = job.postType)
                            if (job.source != null) SourceBadge(sourceName = job.source.name)
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(0.dp)
                        ) {
                            IconButton(
                                onClick = { shareJob(context, job) },
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
                                    tint = if (isFavorite) UrgentRose else Slate300,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(9.dp))

                    // Kurum İkonu + Başlık Alanı
                    Row(verticalAlignment = Alignment.Top) {
                        // Kurum monogram kutusu
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(
                                    brush = Brush.linearGradient(
                                        colors = listOf(
                                            accentColor.copy(alpha = 0.12f),
                                            accentColor.copy(alpha = 0.06f)
                                        ),
                                        start = Offset(0f, 0f),
                                        end = Offset(36f, 36f)
                                    ),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .border(
                                    width = 1.dp,
                                    color = accentColor.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Business,
                                contentDescription = null,
                                tint = accentColor,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = job.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900,
                                lineHeight = 20.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(3.dp))
                            Text(
                                text = job.institution ?: "T.C. Kamu Kurumu",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Slate500,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Meta Rozetleri: KPSS, Eğitim, Yaş
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(5.dp),
                        verticalArrangement = Arrangement.spacedBy(5.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        KpssBadge(kpssType = kpssType)
                        EducationBadge(educationLevel = education)
                        if (maxAge != null) AgeBadge(maxAge = maxAge)
                    }

                    // Açıklama özeti
                    if (!job.description.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = job.description,
                            fontSize = 12.sp,
                            color = Slate500,
                            lineHeight = 17.sp,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Urgent uyarı bandı
                    if (isUrgent) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    brush = Brush.horizontalGradient(
                                        listOf(UrgentRoseBg, Color.White)
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .border(1.dp, UrgentRoseBorder.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            UrgentBadge(daysRemaining = daysRemaining!!)
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                    }

                    HorizontalDivider(color = Slate100, thickness = 1.dp)
                    Spacer(modifier = Modifier.height(8.dp))

                    // Footer: Şehir, Kontenjan, Tarih + İncele
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            if (!job.city.isNullOrBlank()) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.LocationOn,
                                        contentDescription = null,
                                        tint = Slate400,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text(
                                        job.city,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Slate700
                                    )
                                }
                            }
                            if (job.positionCount != null && job.positionCount > 0) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.People,
                                        contentDescription = null,
                                        tint = Slate400,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text(
                                        "${job.positionCount} Kişi",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Slate700
                                    )
                                }
                            }
                            if (!job.publishedAt.isNullOrBlank()) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.CalendarToday,
                                        contentDescription = null,
                                        tint = Slate400,
                                        modifier = Modifier.size(11.dp)
                                    )
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text(
                                        job.publishedAt.take(10),
                                        fontSize = 11.sp,
                                        color = Slate500
                                    )
                                }
                            }
                        }

                        // İncele butonu — pill tarzı
                        Box(
                            modifier = Modifier
                                .background(
                                    brush = Brush.horizontalGradient(
                                        listOf(BrandPrimary, Color(0xFF4F46E5))
                                    ),
                                    shape = RoundedCornerShape(20.dp)
                                )
                                .clickable { onClick() }
                                .padding(horizontal = 12.dp, vertical = 5.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Text(
                                    text = "İncele",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(11.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

private val Slate300 = Color(0xFFCBD5E1)

private fun shareJob(context: Context, job: JobPost) {
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
