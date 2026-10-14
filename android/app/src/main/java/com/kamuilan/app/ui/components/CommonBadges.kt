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

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.graphics.luminance

@Composable
fun isAppDark(): Boolean = MaterialTheme.colorScheme.surface.luminance() < 0.5f

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
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun TodayAddedBadge(modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = "Bugün Eklendi",
        icon = Icons.Default.AutoAwesome,
        backgroundColor = if (isDark) Color(0x33F59E0B) else Color(0xFFFEF3C7),
        textColor = if (isDark) Color(0xFFFDE68A) else Color(0xFF92400E),
        borderColor = if (isDark) Color(0x66F59E0B) else Color(0xFFFDE68A),
        modifier = modifier
    )
}

@Composable
fun PostTypeBadge(postType: String?, modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    val (label, bg, text, border) = when (postType?.lowercase()) {
        "memur" -> if (isDark) Quad("Memur", com.kamuilan.app.ui.theme.MemurDarkBg, com.kamuilan.app.ui.theme.MemurDarkText, com.kamuilan.app.ui.theme.MemurDarkBorder)
                   else Quad("Memur", com.kamuilan.app.ui.theme.MemurLightBg, com.kamuilan.app.ui.theme.MemurLightText, com.kamuilan.app.ui.theme.MemurLightBorder)
        "sozlesmeli", "sözleşmeli" -> if (isDark) Quad("Sözleşmeli", com.kamuilan.app.ui.theme.SozlesmeliDarkBg, com.kamuilan.app.ui.theme.SozlesmeliDarkText, com.kamuilan.app.ui.theme.SozlesmeliDarkBorder)
                   else Quad("Sözleşmeli", com.kamuilan.app.ui.theme.SozlesmeliLightBg, com.kamuilan.app.ui.theme.SozlesmeliLightText, com.kamuilan.app.ui.theme.SozlesmeliLightBorder)
        "isci", "işçi" -> if (isDark) Quad("İşçi", com.kamuilan.app.ui.theme.IsciDarkBg, com.kamuilan.app.ui.theme.IsciDarkText, com.kamuilan.app.ui.theme.IsciDarkBorder)
                   else Quad("İşçi", com.kamuilan.app.ui.theme.IsciLightBg, com.kamuilan.app.ui.theme.IsciLightText, com.kamuilan.app.ui.theme.IsciLightBorder)
        "akademik" -> if (isDark) Quad("Akademik", com.kamuilan.app.ui.theme.AkademikDarkBg, com.kamuilan.app.ui.theme.AkademikDarkText, com.kamuilan.app.ui.theme.AkademikDarkBorder)
                   else Quad("Akademik", com.kamuilan.app.ui.theme.AkademikLightBg, com.kamuilan.app.ui.theme.AkademikLightText, com.kamuilan.app.ui.theme.AkademikLightBorder)
        else -> if (isDark) Quad("Genel", com.kamuilan.app.ui.theme.GenelDarkBg, com.kamuilan.app.ui.theme.GenelDarkText, com.kamuilan.app.ui.theme.GenelDarkBorder)
                   else Quad("Genel", com.kamuilan.app.ui.theme.GenelLightBg, com.kamuilan.app.ui.theme.GenelLightText, com.kamuilan.app.ui.theme.GenelLightBorder)
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
    val isDark = isAppDark()
    val text = when {
        daysRemaining <= 0 -> "Bugün Son Gün!"
        daysRemaining == 1L -> "Son 1 Gün Kaldı!"
        else -> "Son $daysRemaining Gün"
    }
    AppIconBadge(
        text = text,
        icon = Icons.Default.AccessTime,
        backgroundColor = if (isDark) Color(0x33F43F5E) else Color(0xFFFFE4E6),
        textColor = if (isDark) Color(0xFFFDA4AF) else Color(0xFFBE123C),
        borderColor = if (isDark) Color(0x66F43F5E) else Color(0xFFFECDD3),
        modifier = modifier
    )
}

@Composable
fun CancelledBadge(modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = "İptal İlanı",
        icon = Icons.Default.Cancel,
        backgroundColor = if (isDark) Color(0x33EF4444) else Color(0xFFFEE2E2),
        textColor = if (isDark) Color(0xFFF87171) else Color(0xFFDC2626),
        borderColor = if (isDark) Color(0x66EF4444) else Color(0xFFFCA5A5),
        modifier = modifier
    )
}

@Composable
fun KpssBadge(kpssType: String, modifier: Modifier = Modifier) {
    if (kpssType == "Belirtilmemiş") return
    val isDark = isAppDark()
    AppIconBadge(
        text = kpssType,
        icon = Icons.Default.MilitaryTech,
        backgroundColor = if (isDark) Color(0x2E38BDF8) else Color(0xFFEFF6FF),
        textColor = if (isDark) Color(0xFF7DD3FC) else Color(0xFF1D4ED8),
        borderColor = if (isDark) Color(0x5938BDF8) else Color(0xFFBFDBFE),
        modifier = modifier
    )
}

@Composable
fun EducationBadge(educationLevel: String, modifier: Modifier = Modifier) {
    if (educationLevel == "Belirtilmemiş") return
    val isDark = isAppDark()
    AppIconBadge(
        text = educationLevel,
        icon = Icons.Default.School,
        backgroundColor = if (isDark) Color(0x2EA855F7) else Color(0xFFFAF5FF),
        textColor = if (isDark) Color(0xFFD8B4FE) else Color(0xFF6B21A8),
        borderColor = if (isDark) Color(0x59A855F7) else Color(0xFFE9D5FF),
        modifier = modifier
    )
}

@Composable
fun AgeBadge(maxAge: Int, modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = "Maks. $maxAge Yaş",
        icon = Icons.Default.Schedule,
        backgroundColor = if (isDark) Color(0x2EF59E0B) else Color(0xFFFFFBEB),
        textColor = if (isDark) Color(0xFFFCD34D) else Color(0xFFB45309),
        borderColor = if (isDark) Color(0x59F59E0B) else Color(0xFFFEF3C7),
        modifier = modifier
    )
}

@Composable
fun SourceBadge(sourceName: String, modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = sourceName,
        icon = Icons.Default.Public,
        backgroundColor = if (isDark) Color(0x2E818CF8) else Color(0xFFEEF2FF),
        textColor = if (isDark) Color(0xFFA5B4FC) else Color(0xFF3730A3),
        borderColor = if (isDark) Color(0x59818CF8) else Color(0xFFC7D2FE),
        modifier = modifier
    )
}

@Composable
fun CityBadge(city: String, modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = city,
        icon = Icons.Default.LocationOn,
        backgroundColor = if (isDark) Color(0xFF1E293B) else Color(0xFFF1F5F9),
        textColor = if (isDark) Color(0xFFE2E8F0) else Color(0xFF334155),
        borderColor = if (isDark) Color(0xFF334155) else Color(0xFFE2E8F0),
        modifier = modifier
    )
}

@Composable
fun PositionCountBadge(count: Int, modifier: Modifier = Modifier) {
    val isDark = isAppDark()
    AppIconBadge(
        text = "$count Kişi",
        icon = Icons.Default.People,
        backgroundColor = if (isDark) Color(0x2E10B981) else Color(0xFFECFDF5),
        textColor = if (isDark) Color(0xFF6EE7B7) else Color(0xFF047857),
        borderColor = if (isDark) Color(0x5910B981) else Color(0xFFA7F3D0),
        modifier = modifier
    )
}

private data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
