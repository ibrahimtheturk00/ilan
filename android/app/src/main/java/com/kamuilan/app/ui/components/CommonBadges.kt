package com.kamuilan.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.ui.theme.AgeAmber
import com.kamuilan.app.ui.theme.AgeAmberBg
import com.kamuilan.app.ui.theme.AgeAmberBorder
import com.kamuilan.app.ui.theme.AkademikPurple
import com.kamuilan.app.ui.theme.AkademikPurpleBg
import com.kamuilan.app.ui.theme.AkademikPurpleBorder
import com.kamuilan.app.ui.theme.CancelledRed
import com.kamuilan.app.ui.theme.EducationPurple
import com.kamuilan.app.ui.theme.EducationPurpleBg
import com.kamuilan.app.ui.theme.EducationPurpleBorder
import com.kamuilan.app.ui.theme.GenelSlate
import com.kamuilan.app.ui.theme.GenelSlateBg
import com.kamuilan.app.ui.theme.GenelSlateBorder
import com.kamuilan.app.ui.theme.IsciAmber
import com.kamuilan.app.ui.theme.IsciAmberBg
import com.kamuilan.app.ui.theme.IsciAmberBorder
import com.kamuilan.app.ui.theme.KpssBlue
import com.kamuilan.app.ui.theme.KpssBlueBg
import com.kamuilan.app.ui.theme.KpssBlueBorder
import com.kamuilan.app.ui.theme.MemurSky
import com.kamuilan.app.ui.theme.MemurSkyBg
import com.kamuilan.app.ui.theme.MemurSkyBorder
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.SourceIndigo
import com.kamuilan.app.ui.theme.SourceIndigoBg
import com.kamuilan.app.ui.theme.SourceIndigoBorder
import com.kamuilan.app.ui.theme.SozlesmeliTeal
import com.kamuilan.app.ui.theme.SozlesmeliTealBg
import com.kamuilan.app.ui.theme.SozlesmeliTealBorder
import com.kamuilan.app.ui.theme.UrgentRose
import com.kamuilan.app.ui.theme.UrgentRoseBg
import com.kamuilan.app.ui.theme.UrgentRoseBorder

@Composable
fun AppIconBadge(
    text: String,
    icon: ImageVector? = null,
    backgroundColor: Color,
    textColor: Color,
    borderColor: Color? = null,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(6.dp)
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .then(
                if (borderColor != null) Modifier.border(width = 1.dp, color = borderColor, shape = shape)
                else Modifier
            )
            .background(color = backgroundColor, shape = shape)
            .padding(horizontal = 7.dp, vertical = 3.dp)
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
        }
        Text(
            text = text,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun TodayAddedBadge(modifier: Modifier = Modifier) {
    AppIconBadge(
        text = "Bugün Eklendi",
        icon = Icons.Default.AutoAwesome,
        backgroundColor = Color(0xFFFEF3C7),
        textColor = Color(0xFF92400E),
        borderColor = Color(0xFFFDE68A),
        modifier = modifier
    )
}

@Composable
fun PostTypeBadge(postType: String?, modifier: Modifier = Modifier) {
    val (label, bg, text, border) = when (postType?.lowercase()) {
        "memur" -> Quad("Memur", MemurSkyBg, MemurSky, MemurSkyBorder)
        "sozlesmeli" -> Quad("Sözleşmeli", SozlesmeliTealBg, SozlesmeliTeal, SozlesmeliTealBorder)
        "isci" -> Quad("İşçi", IsciAmberBg, IsciAmber, IsciAmberBorder)
        "akademik" -> Quad("Akademik", AkademikPurpleBg, AkademikPurple, AkademikPurpleBorder)
        else -> Quad("Genel", GenelSlateBg, GenelSlate, GenelSlateBorder)
    }

    AppIconBadge(
        text = label,
        backgroundColor = bg,
        textColor = text,
        borderColor = border,
        modifier = modifier
    )
}

@Composable
fun UrgentBadge(daysRemaining: Long, modifier: Modifier = Modifier) {
    val text = when {
        daysRemaining <= 0 -> "Bugün Son Gün!"
        daysRemaining == 1L -> "Son 1 Gün Kaldı!"
        else -> "Son $daysRemaining Gün"
    }
    AppIconBadge(
        text = text,
        icon = Icons.Default.AccessTime,
        backgroundColor = UrgentRoseBg,
        textColor = UrgentRose,
        borderColor = UrgentRoseBorder,
        modifier = modifier
    )
}

@Composable
fun CancelledBadge(modifier: Modifier = Modifier) {
    AppIconBadge(
        text = "İptal İlanı",
        icon = Icons.Default.Cancel,
        backgroundColor = CancelledRed,
        textColor = Color.White,
        modifier = modifier
    )
}

@Composable
fun KpssBadge(kpssType: String, modifier: Modifier = Modifier) {
    if (kpssType == "Belirtilmemiş") return
    AppIconBadge(
        text = kpssType,
        icon = Icons.Default.MilitaryTech,
        backgroundColor = KpssBlueBg,
        textColor = KpssBlue,
        borderColor = KpssBlueBorder,
        modifier = modifier
    )
}

@Composable
fun EducationBadge(educationLevel: String, modifier: Modifier = Modifier) {
    if (educationLevel == "Belirtilmemiş") return
    AppIconBadge(
        text = educationLevel,
        icon = Icons.Default.School,
        backgroundColor = EducationPurpleBg,
        textColor = EducationPurple,
        borderColor = EducationPurpleBorder,
        modifier = modifier
    )
}

@Composable
fun AgeBadge(maxAge: Int, modifier: Modifier = Modifier) {
    AppIconBadge(
        text = "Maks. $maxAge Yaş",
        icon = Icons.Default.Schedule,
        backgroundColor = AgeAmberBg,
        textColor = AgeAmber,
        borderColor = AgeAmberBorder,
        modifier = modifier
    )
}

@Composable
fun SourceBadge(sourceName: String, modifier: Modifier = Modifier) {
    AppIconBadge(
        text = sourceName,
        icon = Icons.Default.Public,
        backgroundColor = SourceIndigoBg,
        textColor = SourceIndigo,
        borderColor = SourceIndigoBorder,
        modifier = modifier
    )
}

@Composable
fun CityBadge(city: String, modifier: Modifier = Modifier) {
    AppIconBadge(
        text = city,
        icon = Icons.Default.LocationOn,
        backgroundColor = Color(0xFFF1F5F9),
        textColor = Slate700,
        borderColor = Slate200,
        modifier = modifier
    )
}

@Composable
fun PositionCountBadge(count: Int, modifier: Modifier = Modifier) {
    AppIconBadge(
        text = "$count Kişi",
        icon = Icons.Default.People,
        backgroundColor = Color(0xFFECFDF5),
        textColor = Color(0xFF047857),
        borderColor = Color(0xFFA7F3D0),
        modifier = modifier
    )
}

private data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
