package com.kamuilan.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.JobParser
import com.kamuilan.app.data.model.JobPost
import com.kamuilan.app.ui.theme.SlateBorder
import com.kamuilan.app.ui.theme.SlateDark
import com.kamuilan.app.ui.theme.SlateMuted
import com.kamuilan.app.ui.theme.UrgentRed

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun JobCard(
    job: JobPost,
    isFavorite: Boolean,
    onFavoriteClick: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val daysRemaining = JobParser.calculateDaysRemaining(job.deadlineAt)
    val kpssType = JobParser.detectKpssType(job)
    val education = JobParser.detectEducationLevel(job)

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(SlateBorder))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Üst Satır: Kurum Adı ve Favori Butonu
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = job.institution ?: "T.C. Kamu Kurumu",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SlateMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                IconButton(
                    onClick = onFavoriteClick,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Favoriye Ekle",
                        tint = if (isFavorite) UrgentRed else SlateMuted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // İlan Başlığı
            Text(
                text = job.title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = SlateDark,
                lineHeight = 20.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Rozetler (Rozet Satırı)
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

            // Alt Kaynak Bilgisi
            if (job.source != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = job.source.name,
                    fontSize = 11.sp,
                    color = SlateMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
